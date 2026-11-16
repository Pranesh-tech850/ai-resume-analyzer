// Reads text out of a PDF or .docx file. Both readers are loaded as globals in index.html.

const PDF_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function extractPdf(buffer) {
  const pdfjsLib = window.pdfjsLib;
  if (!pdfjsLib) throw new Error("The PDF reader did not load. Check your connection and retry.");
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
}

async function extractDocx(buffer) {
  if (!window.mammoth) throw new Error("The Word reader did not load. Check your connection and retry.");
  const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

export async function extractText(file) {
  const name = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();

  if (name.endsWith(".pdf")) return extractPdf(buffer);
  if (name.endsWith(".docx")) return extractDocx(buffer);

  throw new Error("Unsupported file. Please upload a PDF or a .docx file.");
}
