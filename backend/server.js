// A small proxy between the ResumeParser page and the labd API.
// The API key lives here, on the server, and never reaches the browser.
// Uses only Node's built-in modules and fetch (Node 22+), so there is nothing to install.

import { createServer } from "node:http";

const PORT = Number(process.env.PORT) || 8787;
const LABD_URL = "https://agent.thedevlabs.io/v1/api/chat";
const API_KEY = process.env.LABD_API_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
const MAX_BODY_BYTES = 200_000; // about 200 KB, enough for a resume and a job post

if (!API_KEY) {
  console.error("LABD_API_KEY is not set. Add it to backend/.env and start with `npm start`.");
  process.exit(1);
}

// Turns labd's status codes into messages a learner can act on.
const LABD_ERRORS = {
  401: "The labd key is wrong or has been revoked.",
  402: "The labd allowance for this month is used up.",
  403: "The labd API is switched off for now.",
  429: "Too many requests this minute. Try again shortly.",
};

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body));
}

// Reads the request body, refusing anything too large.
function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Request body too large."), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(Object.assign(new Error("Body must be valid JSON."), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

// Builds the prompt. labd takes a list of messages, and the last one must be from the user.
function buildMessages({ resume, jobDescription }) {
  return [
    {
      role: "user",
      content:
        "You are a career coach. Compare the resume with the job description. " +
        "Reply with three short paragraphs: what the resume does well for this role, " +
        "the biggest gaps, and one concrete change to make first.\n\n" +
        `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resume}`,
    },
  ];
}

async function handleFeedback(req, res) {
  let body;
  try {
    body = await readJson(req);
  } catch (err) {
    return send(res, err.status || 400, { error: err.message });
  }

  const resume = typeof body.resume === "string" ? body.resume.trim() : "";
  const jobDescription = typeof body.jobDescription === "string" ? body.jobDescription.trim() : "";
  if (!resume || !jobDescription) {
    return send(res, 400, { error: "Both resume and jobDescription are required." });
  }

  let upstream;
  try {
    upstream = await fetch(LABD_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: buildMessages({ resume, jobDescription }) }),
    });
  } catch {
    return send(res, 502, { error: "Could not reach labd. Check the network and retry." });
  }

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return send(res, upstream.status, {
      error: LABD_ERRORS[upstream.status] || "labd returned an error.",
    });
  }

  // Pass on only what the page needs, not the whole labd response.
  return send(res, 200, {
    reply: data.message?.content ?? "",
    percentLeft: data.credits?.percentLeft ?? null,
  });
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return send(res, 204, {});
  }
  if (req.method === "POST" && req.url === "/api/feedback") {
    try {
      return await handleFeedback(req, res);
    } catch {
      return send(res, 500, { error: "Unexpected server error." });
    }
  }
  return send(res, 404, { error: "Not found." });
});

server.listen(PORT, () => {
  console.log(`labd proxy listening on http://localhost:${PORT}`);
  console.log(`Accepting requests from ${ALLOWED_ORIGIN}`);
});
