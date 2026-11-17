
import { createServer } from "node:http";
import { connectDb, getDb } from "./db.js";
import { sanitizeAnalysis, saveAnalysis } from "./analysisStore.js";

const PORT = Number(process.env.PORT) || 8787;

const LABD_URL = "https://agent.thedevlabs.io/v1/api/chat";
const API_KEY = process.env.LABD_API_KEY;

const FRONTEND_URL = "https://ai-resume-analyzer-5-7e2t.onrender.com";

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGIN ||
  `${FRONTEND_URL},http://localhost:5173`
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const MAX_BODY_BYTES = 200_000;

// Ensure the API key exists
if (!API_KEY) {
  console.error("LABD_API_KEY is missing.");
  process.exit(1);
}

// Send JSON response with CORS headers
function send(res, status, body, origin) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };

  if (ALLOWED_ORIGINS.includes("*")) {
    headers["Access-Control-Allow-Origin"] = "*";
  } else if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  res.writeHead(status, headers);

  if (status === 204) {
    return res.end();
  }

  res.end(JSON.stringify(body));
}

// Read incoming JSON request
function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      size += chunk.length;

      if (size > MAX_BODY_BYTES) {
        reject(
          Object.assign(
            new Error("Request body too large."),
            { status: 413 }
          )
        );

        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(
          Object.assign(
            new Error("Body must be valid JSON."),
            { status: 400 }
          )
        );
      }
    });

    req.on("error", reject);
  });
}

// Build LABD prompt
function buildMessages({ resume, jobDescription }) {
  return [
    {
      role: "user",
      content:
        "You are a career coach. Compare the resume with the job description. " +
        "Reply with three short paragraphs: what the resume does well for this role, " +
        "the biggest gaps, and one concrete change to make first.\n\n" +
        `JOB DESCRIPTION:\n${jobDescription}\n\n` +
        `RESUME:\n${resume}`,
    },
  ];
}

// Handle feedback request
async function handleFeedback(req, res, origin) {
  let body;

  try {
    body = await readJson(req);
  } catch (err) {
    return send(res, err.status || 400, {
      error: err.message,
    }, origin);
  }

  const resume =
    typeof body.resume === "string"
      ? body.resume.trim()
      : "";

  const jobDescription =
    typeof body.jobDescription === "string"
      ? body.jobDescription.trim()
      : "";

  if (!resume || !jobDescription) {
    return send(res, 400, {
      error: "Both resume and jobDescription are required.",
    }, origin);
  }

  let upstream;

  try {
    upstream = await fetch(LABD_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: buildMessages({
          resume,
          jobDescription,
        }),
      }),
    });
  } catch (err) {
    console.error("LABD connection error:", err);

    return send(res, 502, {
      error: "Could not reach LABD. Check the network and retry.",
    }, origin);
  }

  const data = await upstream.json().catch(() => ({}));

  const LABD_ERRORS = {
    401: "The LABD API key is incorrect or revoked.",
    402: "The LABD API allowance has been exhausted.",
    403: "The LABD API is currently disabled.",
    429: "Too many requests. Please try again shortly.",
  };

  if (!upstream.ok) {
    console.error("LABD API error:", upstream.status, data);

    return send(res, upstream.status, {
      error:
        LABD_ERRORS[upstream.status] ||
        "LABD returned an error.",
    }, origin);
  }

  return send(res, 200, {
    reply: data.message?.content ?? "",
    percentLeft: data.credits?.percentLeft ?? null,
  }, origin);
}

// Main HTTP server
const server = createServer(async (req, res) => {
  const origin = req.headers.origin;

  // Reject requests from unapproved browser origins
  if (
    origin &&
    !ALLOWED_ORIGINS.includes("*") &&
    !ALLOWED_ORIGINS.includes(origin)
  ) {
    return send(res, 403, {
      error: "Origin not allowed.",
    }, origin);
  }

  // CORS preflight
  if (req.method === "OPTIONS") {
    return send(res, 204, {}, origin);
  }

  // Health check
  if (
    req.method === "GET" &&
    (req.url === "/" || req.url === "/health")
  ) {
    return send(res, 200, {
      ok: true,
      service: "resume-parser-backend",
    }, origin);
  }

  // Feedback endpoint
  if (
    req.method === "POST" &&
    req.url === "/api/feedback"
  ) {
    try {
      return await handleFeedback(req, res, origin);
    } catch (err) {
      console.error("Unexpected feedback error:", err);

      return send(res, 500, {
        error: "Unexpected server error.",
      }, origin);
    }
  }

  // Save a scorecard result
  if (req.method === "POST" && req.url === "/api/analyses") {
    try {
      const db = getDb();
      if (!db) {
        return send(res, 503, { error: "Saving is not set up on this server." }, origin);
      }

      const body = await readJson(req).catch((err) => {
        throw Object.assign(err, { status: err.status || 400 });
      });

      const doc = sanitizeAnalysis(body);
      if (!doc) {
        return send(res, 400, { error: "A valid score is required." }, origin);
      }

      const id = await saveAnalysis(db, doc);
      return send(res, 201, { id: String(id) }, origin);
    } catch (err) {
      console.error("Save analysis error:", err);
      return send(res, err.status || 500, {
        error: err.status ? err.message : "Could not save the analysis.",
      }, origin);
    }
  }

  // Unknown endpoint
  return send(res, 404, {
    error: "Not found.",
  }, origin);
});

// Start server. The database connects first, but a failed connection doesn't stop
// the feedback endpoint from working.
try {
  await connectDb();
} catch (err) {
  console.error("MongoDB connection failed. Analyses will not be saved:", err.message);
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Resume Parser backend running on port ${PORT}`);
  console.log("Allowed frontend origins:", ALLOWED_ORIGINS);
});
