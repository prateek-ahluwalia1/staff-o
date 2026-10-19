/**
 * Browser-based PDF Text Extraction & OCR Engine using PDF.js and Tesseract.js
 * Runs 100% in the client browser without sending files to external third-party OCR services.
 */

const PDFJS_SCRIPT_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const TESSERACT_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

let pdfjsLoadingPromise = null;
let tesseractLoadingPromise = null;

/**
 * Dynamically loads an external script tag if not already loaded.
 */
function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Browser environment required"));
    }

    // Check if script already exists in document
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      if (existingScript.getAttribute("data-loaded") === "true") {
        return resolve();
      }
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute("data-loaded", "false");

    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };

    script.onerror = (err) => {
      script.remove();
      reject(new Error(`Failed to load library from ${src}`));
    };

    document.head.appendChild(script);
  });
}

/**
 * Ensures PDF.js is initialized and available on window.pdfjsLib
 */
export async function getPdfJs() {
  if (window.pdfjsLib) {
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
    }
    return window.pdfjsLib;
  }

  if (!pdfjsLoadingPromise) {
    pdfjsLoadingPromise = loadExternalScript(PDFJS_SCRIPT_URL).then(() => {
      if (!window.pdfjsLib) {
        throw new Error("PDF.js failed to initialize on window object");
      }
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
      return window.pdfjsLib;
    });
  }

  return pdfjsLoadingPromise;
}

/**
 * Ensures Tesseract.js is initialized and available on window.Tesseract
 */
export async function getTesseract() {
  if (window.Tesseract) {
    return window.Tesseract;
  }

  if (!tesseractLoadingPromise) {
    tesseractLoadingPromise = loadExternalScript(TESSERACT_SCRIPT_URL).then(() => {
      if (!window.Tesseract) {
        throw new Error("Tesseract.js failed to initialize on window object");
      }
      return window.Tesseract;
    });
  }

  return tesseractLoadingPromise;
}

/**
 * Runs a promise with a specified timeout limit.
 */
function withTimeout(promise, ms, timeoutMessage = "Operation timed out") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), ms)
    ),
  ]);
}

/**
 * Runs OCR on an image file or HTML Canvas using Tesseract.js
 */
export async function runOcrOnImage(imageSource, onProgress) {
  const Tesseract = await getTesseract();

  if (onProgress) onProgress("Running OCR text recognition...");

  // Recognize text using Tesseract
  const result = await withTimeout(
    Tesseract.recognize(imageSource, "eng", {
      logger: (m) => {
        if (onProgress && m.status === "recognizing text" && typeof m.progress === "number") {
          const pct = Math.round(m.progress * 100);
          onProgress(`Reading document image... ${pct}%`);
        }
      },
    }),
    40000,
    "OCR text recognition timed out"
  );

  return result?.data?.text || "";
}

/**
 * Extracts text from a PDF file.
 * Automatically falls back to OCR if the PDF is scanned (contains no text layer).
 */
export async function extractPdfText(file, onProgress) {
  const pdfjsLib = await getPdfJs();

  if (onProgress) onProgress("Reading PDF document...");

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await withTimeout(loadingTask.promise, 25000, "PDF loading timed out");

  let extractedText = "";
  const numPagesToScan = Math.min(pdf.numPages, 3); // First 3 pages are sufficient for certificates & licenses

  for (let pageNum = 1; pageNum <= numPagesToScan; pageNum++) {
    if (onProgress) onProgress(`Extracting text from page ${pageNum} of ${numPagesToScan}...`);
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    extractedText += " " + pageText;
  }

  extractedText = extractedText.trim();

  // If the PDF has sufficient text layer, return it immediately
  const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 10 && extractedText.length >= 40) {
    return {
      text: extractedText,
      method: "pdf-text",
      isScanned: false,
    };
  }

  // Scanned PDF detected (images only, no native text layer)
  // Render pages to canvas and perform OCR
  if (onProgress) onProgress("Scanned PDF detected. Running optical character recognition (OCR)...");

  let ocrCombinedText = "";
  const ocrPagesLimit = Math.min(pdf.numPages, 2);

  for (let pageNum = 1; pageNum <= ocrPagesLimit; pageNum++) {
    const page = await pdf.getPage(pageNum);
    // 2.0 scale provides high DPI for crisp OCR accuracy
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx, viewport }).promise;

    const pageOcrText = await runOcrOnImage(canvas, onProgress);
    ocrCombinedText += " " + pageOcrText;
  }

  return {
    text: ocrCombinedText.trim(),
    method: "pdf-ocr",
    isScanned: true,
  };
}

/**
 * Universal document text extractor supporting PDF, JPG, JPEG, PNG, WEBP.
 *
 * @param {File} file          - The file selected by the user.
 * @param {function} onProgress - Optional callback for updating status messages.
 *
 * @returns {Promise<{ success: boolean, text?: string, method?: string, error?: string }>}
 */
export async function extractDocumentText(file, onProgress) {
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  const fileName = (file.name || "").toLowerCase();
  const fileType = (file.type || "").toLowerCase();

  try {
    // 1. PDF File
    if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
      const result = await extractPdfText(file, onProgress);
      return {
        success: true,
        text: result.text,
        method: result.method,
      };
    }

    // 2. Image File (JPG, JPEG, PNG, WEBP, GIF, BMP)
    const isImage =
      fileType.startsWith("image/") ||
      /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(fileName);

    if (isImage) {
      if (onProgress) onProgress("Reading image document...");
      const text = await runOcrOnImage(file, onProgress);
      return {
        success: true,
        text,
        method: "image-ocr",
      };
    }

    // 3. Fallback for other files (e.g. doc/docx if selected)
    return {
      success: false,
      error: "Unsupported file format for automated text verification. Please upload a PDF or image (JPG/PNG).",
    };
  } catch (err) {
    console.error("Text extraction failed:", err);
    return {
      success: false,
      error: err.message || "Failed to read document contents",
    };
  }
}
