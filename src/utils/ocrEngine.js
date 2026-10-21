/**
 * PDF Text Extraction & OCR Engine using PDF.js, Google Cloud Vision (via our
 * backend), and Tesseract.js as a local fallback.
 */

import { apiURL } from "./exports";

const PDFJS_SCRIPT_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER_URL = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const TESSERACT_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

// Backend endpoint that proxies an uploaded image to the Google Cloud Vision
// API (DOCUMENT_TEXT_DETECTION) so the Vision API key never reaches the
// browser. See the matching Laravel controller/route for this project.
const GOOGLE_VISION_ENDPOINT = `${apiURL}api/ocr/google-vision`;
const GOOGLE_VISION_TIMEOUT_MS = 30000;

let pdfjsLoadingPromise = null;
let tesseractLoadingPromise = null;

/**
 * Reads the Bearer auth token out of the app's redux-persist storage
 * (persisted under the "auth" key — see src/store/store.js) so this plain
 * utility module can authenticate the Vision OCR request without needing
 * React/Redux hooks, which aren't usable outside components.
 */
function getStoredAuthToken() {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem("persist:auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    // redux-persist stores each slice value JSON-stringified.
    return JSON.parse(parsed.token) || null;
  } catch (_) {
    return null;
  }
}

/**
 * Sends an image file to our backend, which proxies it to the Google Cloud
 * Vision API for OCR. Runs server-side so the Vision API key stays secret.
 *
 * Returns the extracted text, or null on any failure (missing/unreachable
 * endpoint, network error, provider error) so the caller can fall back to
 * the in-browser Tesseract pipeline instead of blocking the upload.
 */
async function runGoogleVisionOcr(file, onProgress) {
  if (typeof fetch === "undefined") return null;

  try {
    if (onProgress) onProgress("Reading document image (cloud OCR)...");

    const formData = new FormData();
    formData.append("file", file);

    const token = getStoredAuthToken();
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await withTimeout(
      fetch(GOOGLE_VISION_ENDPOINT, {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      }),
      GOOGLE_VISION_TIMEOUT_MS,
      "Cloud OCR request timed out"
    );

    if (!res.ok) return null;

    const json = await res.json();
    if (!json || json.success === false || typeof json.text !== "string") return null;

    return json.text;
  } catch (_) {
    // Endpoint not deployed yet, offline, CORS, provider outage, etc. —
    // treated as "unavailable", not a hard failure.
    return null;
  }
}

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
 * Loads a File/Blob into an HTMLImageElement so it can be redrawn/rotated on a canvas.
 */
function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for OCR"));
    };
    img.src = url;
  });
}

/**
 * Draws an image/canvas onto a new canvas rotated by the given number of degrees
 * (0, 90, 180, or 270), swapping width/height for 90/270 so nothing is cropped.
 *
 * @param {number} [maxDim] - Optional cap on the longest output side; the source
 *   is downscaled to fit. Used for quick orientation checks where we only need
 *   enough resolution to score confidence, not a final high-accuracy reading.
 */
function rotateToCanvas(imgOrCanvas, degrees, maxDim) {
  const srcW = imgOrCanvas.naturalWidth || imgOrCanvas.width;
  const srcH = imgOrCanvas.naturalHeight || imgOrCanvas.height;

  let drawW = srcW;
  let drawH = srcH;
  if (maxDim) {
    const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
    drawW = Math.max(1, Math.round(srcW * scale));
    drawH = Math.max(1, Math.round(srcH * scale));
  }

  const canvas = document.createElement("canvas");
  const swapped = degrees === 90 || degrees === 270;
  canvas.width = swapped ? drawH : drawW;
  canvas.height = swapped ? drawW : drawH;

  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.drawImage(imgOrCanvas, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
  return canvas;
}

/**
 * Preprocesses a canvas for OCR: upscales small images, converts to
 * grayscale, and binarizes with an Otsu threshold (automatic black/white
 * cutoff). ID/license card photos are frequently low-resolution, glare-y,
 * or have a busy background pattern (holograms, watermarks, security
 * microprint) that Tesseract otherwise tries to read as text, producing
 * garbled output. A clean, high-contrast black-on-white image reads far
 * more reliably than the raw color photo.
 */
function preprocessCanvasForOcr(canvas) {
  const MIN_DIM = 1200;
  let srcCanvas = canvas;

  // Upscale small images so character strokes have enough pixels to be
  // recognized reliably.
  const maxSrcDim = Math.max(canvas.width, canvas.height);
  if (maxSrcDim > 0 && maxSrcDim < MIN_DIM) {
    const scale = MIN_DIM / maxSrcDim;
    const scaled = document.createElement("canvas");
    scaled.width = Math.round(canvas.width * scale);
    scaled.height = Math.round(canvas.height * scale);
    const sctx = scaled.getContext("2d");
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
    srcCanvas = scaled;
  }

  const ctx = srcCanvas.getContext("2d");
  const { width, height } = srcCanvas;
  if (!width || !height) return srcCanvas;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const n = width * height;

  // Grayscale (perceptual luminance) + histogram for Otsu threshold.
  const gray = new Uint8ClampedArray(n);
  const histogram = new Array(256).fill(0);
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const g = Math.round(0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]);
    gray[i] = g;
    histogram[g]++;
  }

  // Otsu's method: pick the threshold that maximizes between-class variance,
  // i.e. the cutoff that best separates "ink" from "background".
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * histogram[t];
  let sumB = 0;
  let wB = 0;
  let maxVar = 0;
  let threshold = 127;
  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    const wF = n - wB;
    if (wF === 0) break;
    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > maxVar) {
      maxVar = varBetween;
      threshold = t;
    }
  }

  // Write back as a binarized (black-on-white) image.
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const v = gray[i] >= threshold ? 255 : 0;
    data[p] = v;
    data[p + 1] = v;
    data[p + 2] = v;
  }

  ctx.putImageData(imageData, 0, 0);
  return srcCanvas;
}

let tesseractWorkerPromise = null;
let activeProgressHandler = null;
let activeProgressLabel = "";

/**
 * Lazily creates ONE persistent Tesseract worker and reuses it for every
 * recognition call in this session. The convenience `Tesseract.recognize()`
 * API spins up (and tears down) a brand-new worker — re-downloading/
 * initializing the ~15MB language model and WASM engine — on every single
 * call, which is what was causing multi-pass orientation checks to be slow
 * or time out. A shared worker pays that init cost once; every call after
 * that only does the actual image recognition.
 */
async function getOcrWorker() {
  if (!tesseractWorkerPromise) {
    tesseractWorkerPromise = (async () => {
      const Tesseract = await getTesseract();
      const worker = await Tesseract.createWorker("eng", 1, {
        logger: (m) => {
          if (activeProgressHandler && m.status === "recognizing text" && typeof m.progress === "number") {
            const pct = Math.round(m.progress * 100);
            activeProgressHandler(
              `Reading document image${activeProgressLabel ? ` (${activeProgressLabel})` : ""}... ${pct}%`
            );
          }
        },
      });
      return worker;
    })().catch((err) => {
      // Allow a later call to retry worker creation instead of being stuck
      // on a permanently-rejected promise.
      tesseractWorkerPromise = null;
      throw err;
    });
  }
  return tesseractWorkerPromise;
}

/**
 * Runs a single Tesseract recognition pass (on the shared persistent worker)
 * and returns both the text and the engine's mean confidence score (0-100),
 * so callers can compare attempts.
 */
async function recognizeOnce(source, onProgress, label, timeoutMs = 40000) {
  const worker = await getOcrWorker();

  activeProgressHandler = onProgress || null;
  activeProgressLabel = label || "";

  const result = await withTimeout(worker.recognize(source), timeoutMs, "OCR text recognition timed out");

  return {
    text: result?.data?.text || "",
    confidence: typeof result?.data?.confidence === "number" ? result.data.confidence : 0,
  };
}

/**
 * Runs OCR on an image file or HTML Canvas using Tesseract.js.
 *
 * Photos taken of ID/license cards are very often sideways or upside-down
 * (phone camera orientation), and Tesseract does not auto-correct that on its
 * own. Crucially, Tesseract's own confidence score on a single pass is NOT a
 * reliable signal for "is this the right orientation" — it can report a
 * deceptively okay confidence while reading garbled/rotated text (it's still
 * recognizing character-shaped blobs, just the wrong ones), so we can't just
 * check the as-uploaded orientation and bail out early when it "looks fine".
 *
 * Instead this always runs a quick, downscaled OCR pass at all four
 * orientations (0/90/180/270), keeps whichever one scores clearly highest,
 * then does one accurate full-resolution pass at that winning rotation so
 * the text used for validation is a proper reading, not the quick check.
 *
 * @returns {Promise<{ text: string, rotationDegrees: number }>}
 *   rotationDegrees is 0 when the image was upright, or 90/180/270 when the
 *   photo itself was sideways/upside-down and needed correcting.
 */
export async function runOcrOnImage(imageSource, onProgress) {
  if (onProgress) onProgress("Running OCR text recognition...");

  const canRotate =
    typeof document !== "undefined" &&
    ((typeof Blob !== "undefined" && imageSource instanceof Blob) ||
      (typeof HTMLCanvasElement !== "undefined" && imageSource instanceof HTMLCanvasElement));

  if (!canRotate) {
    // Can't redraw this source onto a canvas (unexpected input type) — just
    // OCR it as given, no orientation handling possible.
    const base = await recognizeOnce(imageSource, onProgress);
    return { text: base.text, rotationDegrees: 0 };
  }

  const QUICK_CHECK_MAX_DIM = 600;
  const QUICK_CHECK_TIMEOUT_MS = 15000;

  let objectUrl = null;
  try {
    let imgSource = imageSource;
    if (typeof Blob !== "undefined" && imageSource instanceof Blob) {
      const loaded = await loadImageElement(imageSource);
      imgSource = loaded.img;
      objectUrl = loaded.url;
    }

    // Quick scan across all four orientations on a small/downscaled canvas —
    // cheap since the worker is already warmed up and the image is small.
    const results = [];
    for (const degrees of [0, 90, 180, 270]) {
      if (onProgress) {
        onProgress(`Checking document orientation${degrees ? ` (${degrees}°)` : ""}...`);
      }
      const quickCanvas = preprocessCanvasForOcr(rotateToCanvas(imgSource, degrees, QUICK_CHECK_MAX_DIM));
      const attempt = await recognizeOnce(quickCanvas, null, `${degrees}°`, QUICK_CHECK_TIMEOUT_MS);
      results.push({ degrees, ...attempt });
      // A clearly excellent reading needs no further checking.
      if (attempt.confidence >= 85) break;
    }

    results.sort((a, b) => b.confidence - a.confidence);
    const winner = results[0];

    // Re-read the winning orientation at full resolution for an accurate
    // final text (the quick pass above was downscaled for speed only).
    if (onProgress) {
      onProgress(`Reading document image${winner.degrees ? ` (${winner.degrees}°)` : ""}...`);
    }
    const fullResCanvas = preprocessCanvasForOcr(rotateToCanvas(imgSource, winner.degrees));
    const finalAttempt = await recognizeOnce(fullResCanvas, onProgress, winner.degrees ? `${winner.degrees}°` : undefined);

    const finalText =
      finalAttempt.text && finalAttempt.text.trim().length >= 25 ? finalAttempt.text : winner.text;

    return { text: finalText, rotationDegrees: winner.degrees };
  } catch (err) {
    // Orientation scan failed for any reason — fall back to reading the
    // image exactly as uploaded rather than failing the whole extraction.
    const fallback = await recognizeOnce(imageSource, onProgress).catch(() => ({ text: "" }));
    return { text: fallback.text, rotationDegrees: 0 };
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
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

    const pageOcr = await runOcrOnImage(canvas, onProgress);
    ocrCombinedText += " " + pageOcr.text;
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

      // 1. Try Google Cloud Vision first (server-side OCR) — far more
      // accurate than in-browser OCR on real-world ID/license photos
      // (glare, busy backgrounds, skew, low resolution).
      const visionText = await runGoogleVisionOcr(file, onProgress);
      if (visionText && visionText.trim().length >= 10) {
        return {
          success: true,
          text: visionText,
          method: "google-vision",
        };
      }

      // 2. Fall back to in-browser OCR (Tesseract.js) if Vision is not
      // configured/reachable, or returned too little text to be useful.
      const ocrResult = await runOcrOnImage(file, onProgress);
      return {
        success: true,
        text: ocrResult.text,
        method: "image-ocr",
        rotationDegrees: ocrResult.rotationDegrees,
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
