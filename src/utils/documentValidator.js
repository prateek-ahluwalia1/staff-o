/**
 * High-level Centralized Document Validator for Staffoo.
 * Bridges browser OCR/PDF extraction and the centralized category validation rules.
 *
 * Covers:
 * 1. Staffoo Staff (directly managed staff)
 * 2. Resource Partner / Contractor Staff (staff managed by contractors)
 * 3. Resource Partner Company Documents (Public Liability, ASIC, Master License, etc.)
 */

import { extractDocumentText } from "./ocrEngine";
import {
  evaluateDocumentText,
  resolveDocumentTypeKey,
  resolveStateCode,
  STATE_NAMES,
  DOC_TYPE_DISPLAY_NAMES,
  updateDocumentKeywords,
  setDocumentRules,
  getDocumentRules,
  getAllDocumentRules,
  resetDocumentRules,
  updateStateKeywords,
  DOCUMENT_RULES_CONFIG,
  DEFAULT_DOCUMENT_RULES,
} from "./documentValidationRules";

export {
  updateDocumentKeywords,
  setDocumentRules,
  getDocumentRules,
  getAllDocumentRules,
  resetDocumentRules,
  updateStateKeywords,
  DOCUMENT_RULES_CONFIG,
  DEFAULT_DOCUMENT_RULES,
  resolveDocumentTypeKey,
  resolveStateCode,
  DOC_TYPE_DISPLAY_NAMES,
  extractDocumentText,
};

/**
 * Computes the Levenshtein (edit) distance between two short strings.
 * Used to tolerate a stray OCR misread (one wrong/missing/extra character)
 * when matching a user-entered document number against extracted text.
 */
function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prevRow = new Array(n + 1);
  for (let j = 0; j <= n; j++) prevRow[j] = j;

  for (let i = 1; i <= m; i++) {
    const currRow = new Array(n + 1);
    currRow[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1, // deletion
        currRow[j - 1] + 1, // insertion
        prevRow[j - 1] + cost // substitution
      );
    }
    prevRow = currRow;
  }

  return prevRow[n];
}

/**
 * Verifies whether a document number is present in the extracted document text.
 * Handles case-insensitivity, stripped punctuation/spaces, dashed numbers,
 * common OCR character substitutions (e.g. 0/O, 1/I/L, 8/B, 5/S), and spaced text.
 *
 * @param {string} rawText       - The text extracted from the document file.
 * @param {string} docNumber     - The user-entered document number to look for.
 * @returns {boolean}
 */
export function isDocumentNumberInText(rawText, docNumber) {
  if (!rawText || !docNumber) return false;
  const numStr = String(docNumber).trim();
  if (!numStr) return false;

  const textLower = String(rawText).toLowerCase();
  const numLower = numStr.toLowerCase();

  // 1. Direct case-insensitive substring match
  if (textLower.includes(numLower)) return true;

  // 2. Alphanumeric match (ignoring whitespace, hyphens, slashes, periods, colons, hash, commas)
  const textAlpha = textLower.replace(/[^a-z0-9]/g, "");
  const numAlpha = numLower.replace(/[^a-z0-9]/g, "");

  if (numAlpha && textAlpha.includes(numAlpha)) return true;

  // 3. Digits-only match (e.g. user entered "VIC-12345678" and document has "12345678", or vice versa)
  const numDigits = numLower.replace(/[^0-9]/g, "");
  if (numDigits.length >= 3 && textAlpha.includes(numDigits)) {
    return true;
  }

  // 4. Any token containing digits (e.g. user entered "LIC 1234567" -> checks "1234567")
  const partsWithDigits = numStr.split(/[\s\-_/.:#]+/).filter((w) => /\d/.test(w));
  for (const p of partsWithDigits) {
    const pAlpha = p.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (pAlpha.length >= 3 && textAlpha.includes(pAlpha)) {
      return true;
    }
  }

  // 5. Spaced regex match (e.g. user entered "ABC123", document has "A B C 1 2 3" or "ABC - 123")
  if (numAlpha.length >= 2) {
    try {
      const escapedChars = numAlpha.split("").map((c) => "\\" + c);
      const spacedPattern = new RegExp(escapedChars.join("[\\s\\-_/.#:]*"), "i");
      if (spacedPattern.test(rawText)) return true;
    } catch (_) {}
  }

  // 6. Strip leading zeros check in both directions (e.g. "0012345" vs "12345")
  const noLeadingZeros = numAlpha.replace(/^0+/, "");
  if (noLeadingZeros.length >= 2 && textAlpha.includes(noLeadingZeros)) {
    return true;
  }

  // 7. OCR confusion normalized match (0 <-> o/d/q, 1 <-> l/i/|/!/j, 2 <-> z, 5 <-> s, 6 <-> g, 7 <-> t, 8 <-> b)
  const ocrNormalize = (s) =>
    s
      .replace(/[^a-z0-9]/g, "")
      .replace(/[oOdDqQ]/g, "0")
      .replace(/[liI|!jJ]/g, "1")
      .replace(/[zZ]/g, "2")
      .replace(/[sS]/g, "5")
      .replace(/[gG]/g, "6")
      .replace(/[tT]/g, "7")
      .replace(/[bB]/g, "8");

  const textOcrNorm = ocrNormalize(textLower);
  const numOcrNorm = ocrNormalize(numLower);

  if (numOcrNorm && textOcrNorm.includes(numOcrNorm)) {
    return true;
  }

  // 8. OCR confusion on digits only
  const textDigitsOcr = textOcrNorm.replace(/[^0-9]/g, "");
  const numDigitsOcr = numOcrNorm.replace(/[^0-9]/g, "");
  if (numDigitsOcr.length >= 3 && textDigitsOcr.includes(numDigitsOcr)) {
    return true;
  }

  // 9. Fuzzy tolerance for a stray OCR misread (e.g. one digit read as a
  // visually similar but different digit, a skipped/doubled character, etc).
  // Run against BOTH the raw alphanumeric strings and the OCR-confusion-
  // normalized ones from step 7/8 — normalizing first collapses known
  // look-alike swaps (0/O, 1/I/L, 2/Z, 5/S, 6/G, 7/T, 8/B) so only genuine
  // misreads count against the edit-distance budget, catching cases like
  // "879-209-30S" read as "879-200-305" (an S→5 swap, already tolerated,
  // PLUS a genuine 9→0 misread) that raw-string comparison alone would miss.
  // Only applied to longer numbers (>=6 chars) to avoid false positives on
  // short ones; allows 1 edit for numbers under 10 characters, 2 for longer.
  if (numAlpha.length >= 6) {
    const maxDistance = numAlpha.length >= 10 ? 2 : 1;

    const fuzzyMatch = (haystack, needle) => {
      for (const winLen of [needle.length - 1, needle.length, needle.length + 1]) {
        if (winLen <= 0 || winLen > haystack.length) continue;
        for (let i = 0; i <= haystack.length - winLen; i++) {
          const window = haystack.substr(i, winLen);
          if (levenshteinDistance(window, needle) <= maxDistance) return true;
        }
      }
      return false;
    };

    if (fuzzyMatch(textAlpha, numAlpha)) return true;
    if (numOcrNorm.length >= 6 && fuzzyMatch(textOcrNorm, numOcrNorm)) return true;
  }

  return false;
}

const MONTH_NAMES_MAP = {
  1: ["jan", "january"],
  2: ["feb", "february"],
  3: ["mar", "march"],
  4: ["apr", "april"],
  5: ["may"],
  6: ["jun", "june"],
  7: ["jul", "july"],
  8: ["aug", "august"],
  9: ["sep", "sept", "september"],
  10: ["oct", "october"],
  11: ["nov", "november"],
  12: ["dec", "december"],
};

/**
 * Verifies whether an expiry date (entered as DD/MM/YYYY) is present in the extracted document text.
 * Handles numeric formats (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD/MM/YY) and month names
 * (e.g. "15 Oct 2026", "15 October 2026", "October 15, 2026", "15th Oct 2026").
 *
 * @param {string} rawText       - The text extracted from the document file.
 * @param {string} expiryDate    - The user-entered expiry date (e.g. "15/10/2026").
 * @returns {boolean}
 */
export function isExpiryDateInText(rawText, expiryDate) {
  if (!rawText || !expiryDate) return false;
  const cleanExp = String(expiryDate).trim();
  if (!cleanExp) return false;

  const textLower = String(rawText).toLowerCase();

  // Try direct substring match first
  if (textLower.includes(cleanExp.toLowerCase())) return true;

  // Expected input format: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, or YYYY-MM-DD
  let dInt, mInt, yStr;
  const parts = cleanExp.split(/[/\-.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // Format: YYYY-MM-DD
      yStr = parts[0].trim();
      mInt = parseInt(parts[1], 10);
      dInt = parseInt(parts[2], 10);
    } else {
      // Format: DD/MM/YYYY
      dInt = parseInt(parts[0], 10);
      mInt = parseInt(parts[1], 10);
      yStr = parts[2].trim();
    }
  } else {
    return false;
  }

  if (isNaN(dInt) || isNaN(mInt) || !yStr || yStr.length < 2) {
    return false;
  }

  const dStr = String(dInt);
  const dPad = dInt < 10 ? `0${dInt}` : dStr;
  const mStr = String(mInt);
  const mPad = mInt < 10 ? `0${mInt}` : mStr;
  const yShort = yStr.length === 4 ? yStr.slice(2) : yStr;

  const monthWords = MONTH_NAMES_MAP[mInt] || [];

  // 1. Direct numeric format variations
  const directPatterns = [
    `${dPad}/${mPad}/${yStr}`,
    `${dStr}/${mStr}/${yStr}`,
    `${dPad}-${mPad}-${yStr}`,
    `${dStr}-${mStr}-${yStr}`,
    `${dPad}.${mPad}.${yStr}`,
    `${dStr}.${mStr}.${yStr}`,
    `${dPad} ${mPad} ${yStr}`,
    `${dStr} ${mStr} ${yStr}`,
    // ISO format YYYY-MM-DD / YYYY/MM/DD
    `${yStr}-${mPad}-${dPad}`,
    `${yStr}/${mPad}/${dPad}`,
    `${yStr}-${mStr}-${dStr}`,
    // 2-digit year format DD/MM/YY
    `${dPad}/${mPad}/${yShort}`,
    `${dStr}/${mStr}/${yShort}`,
    `${dPad}-${mPad}-${yShort}`,
    `${dStr}-${mStr}-${yShort}`,
  ];

  for (const pat of directPatterns) {
    if (textLower.includes(pat.toLowerCase())) return true;
  }

  // 2. Month name patterns ("15 Oct 2026", "15 October 2026", "October 15, 2026", etc.)
  for (const mw of monthWords) {
    const wordPatterns = [
      `${dStr} ${mw} ${yStr}`,
      `${dPad} ${mw} ${yStr}`,
      `${dStr}-${mw}-${yStr}`,
      `${dPad}-${mw}-${yStr}`,
      `${dStr}/${mw}/${yStr}`,
      `${dPad}/${mw}/${yStr}`,
      `${dStr}.${mw}.${yStr}`,
      `${dPad}.${mw}.${yStr}`,
      `${mw} ${dStr} ${yStr}`,
      `${mw} ${dPad} ${yStr}`,
      `${mw} ${dStr}, ${yStr}`,
      `${mw} ${dPad}, ${yStr}`,
      `${dStr}th ${mw} ${yStr}`,
      `${dStr}st ${mw} ${yStr}`,
      `${dStr}nd ${mw} ${yStr}`,
      `${dStr}rd ${mw} ${yStr}`,
      `${dStr} ${mw} ${yShort}`,
      `${dPad} ${mw} ${yShort}`,
      `${dStr}-${mw}-${yShort}`,
      `${dPad}-${mw}-${yShort}`,
    ];

    for (const pat of wordPatterns) {
      if (textLower.includes(pat)) return true;
    }
  }

  // 3. Compact / alphanumeric variations (e.g. "15oct2026", "15102026")
  const textAlpha = textLower.replace(/[^a-z0-9]/g, "");
  const alphaCandidates = [
    `${dPad}${mPad}${yStr}`,
    `${dStr}${mStr}${yStr}`,
    `${yStr}${mPad}${dPad}`,
    `${dPad}${mPad}${yShort}`,
    ...monthWords.map((mw) => `${dPad}${mw}${yStr}`),
    ...monthWords.map((mw) => `${dStr}${mw}${yStr}`),
    ...monthWords.map((mw) => `${mw}${dPad}${yStr}`),
    ...monthWords.map((mw) => `${mw}${dStr}${yStr}`),
    ...monthWords.map((mw) => `${dPad}${mw}${yShort}`),
  ];

  for (const cand of alphaCandidates) {
    if (textAlpha.includes(cand)) return true;
  }

  // 4. Regex with flexible spacing / separators
  for (const mw of [mPad, ...monthWords]) {
    try {
      const reg1 = new RegExp(`\\b0?${dStr}(?:st|nd|rd|th)?\\s*[\\/\\-\\.\\s,]\\s*${mw}\\s*[\\/\\-\\.\\s,]\\s*(?:20)?${yShort}\\b`, "i");
      if (reg1.test(textLower)) return true;
      const reg2 = new RegExp(`\\b${mw}\\s*[\\/\\-\\.\\s,]\\s*0?${dStr}(?:st|nd|rd|th)?\\s*,?\\s*(?:20)?${yShort}\\b`, "i");
      if (reg2.test(textLower)) return true;
    } catch (_) {}
  }

  return false;
}

/**
 * Known sentinel phrases a user can enter in the Expiry Date field to indicate
 * a license/document is currently valid but awaiting renewal paperwork, rather
 * than providing an actual expiry date found in the document. When one of these
 * is entered, OCR expiry-date matching is bypassed (the document can still be
 * uploaded and the document number is still verified as normal).
 */
const PENDING_RENEWAL_PHRASES = [
  "current, pending renewal",
  "current pending renewal",
  "pending renewal",
];

/**
 * Checks whether the user-entered expiry value is a "pending renewal" sentinel
 * (as opposed to an actual date), so the OCR expiry-date check can be bypassed.
 *
 * @param {string} expiryValue - The user-entered expiry date/value.
 * @returns {boolean}
 */
export function isPendingRenewalExpiry(expiryValue) {
  if (!expiryValue) return false;
  const normalized = String(expiryValue).trim().toLowerCase();
  if (!normalized) return false;
  return PENDING_RENEWAL_PHRASES.some((phrase) => normalized === phrase || normalized.includes(phrase));
}

/**
 * Determines whether automated document content validation applies to this document.
 * Returns true if the document type or name maps to any known category (Staff or Contractor)
 * or if a document number is provided for verification.
 *
 * @param {string} userType      - Current user role ('staff', 'contractor', 'admin', etc.)
 * @param {string} docType       - document_type from form/doc
 * @param {string} docCategory   - document_category (e.g. 'contractor_document', 'nsw_document', or state)
 * @param {string} docName       - document_name from form/doc or fieldName
 * @param {string} [documentNumber] - document_no from form
 */
export function isDocumentValidationApplicable(userType, docType, docCategory, docName, documentNumber = null) {
  return true;
}

/**
 * Specifically checks if validation applies to a staff-related document.
 */
export function isStaffValidationApplicable(userType, docType, docCategory, docName) {
  const resolvedTypeKey = resolveDocumentTypeKey(docType, docName);
  if (!resolvedTypeKey) return false;
  // Exclude contractor company documents if specifically checking for staff
  const contractorCompanyKeys = [
    "public_liability",
    "asic_report",
    "security_membership",
    "security_master_license",
    "workcover",
    "labour_hire",
  ];
  return !contractorCompanyKeys.includes(resolvedTypeKey);
}

/**
 * Backwards-compatible check for Resource Partner company documents.
 */
export function isResourcePartnerValidationApplicable(userType, docType, docCategory, docName) {
  const resolvedTypeKey = resolveDocumentTypeKey(docType, docName);
  return Boolean(resolvedTypeKey);
}

/**
 * Validates any staff or contractor document file in the browser before upload.
 * Extracts text via in-browser PDF text-extraction or Tesseract.js OCR,
 * then validates against category keywords, state requirements, and document number.
 *
 * @param {File} file            - The user's selected file.
 * @param {string} docType       - document_type (e.g. 'passport', 'security_license', 'public_liability')
 * @param {string} docCategory   - document_category or state ('vic', 'contractor_document', 'nsw_document', etc.)
 * @param {string} docName       - document_name or fieldName
 * @param {function} onProgress - Progress status callback: (statusMessage) => void
 * @param {object} [options]     - Optional parameters (e.g. { state: 'VIC', documentNumber: 'ABC123456' })
 *
 * @returns {Promise<{
 *   shouldValidate: boolean,
 *   isValid: boolean,
 *   error?: string,
 *   docDisplayName?: string,
 *   stateName?: string,
 *   method?: string,
 *   extractedText?: string
 * }>}
 */
export async function validateDocument(
  file,
  docType,
  docCategory,
  docName = "",
  onProgress = null,
  options = {}
) {
  const typeKey = resolveDocumentTypeKey(docType, docName);
  const effectiveState = options.state || docCategory;
  const stateCode = resolveStateCode(effectiveState);
  const stateName = stateCode ? STATE_NAMES[stateCode] : "";
  const docDisplayName = typeKey ? DOC_TYPE_DISPLAY_NAMES[typeKey] : docName || "Document";
  const docNumber = options.documentNumber ? String(options.documentNumber).trim() : "";


  if (!file) {
    return {
      shouldValidate: true,
      isValid: false,
      error: "No file selected. Please select a valid document to upload.",
      docDisplayName,
      stateName,
    };
  }

  if (onProgress) {
    onProgress(`Checking document contents for ${docDisplayName}${stateName ? ` (${stateName})` : ""}...`);
  }

  // 1. Extract text from PDF or Image via in-browser PDF.js & Tesseract.js
  const extraction = await extractDocumentText(file, onProgress);

  if (!extraction.success) {
    return {
      shouldValidate: true,
      isValid: false,
      error:
        extraction.error ||
        "We couldn't read this document. Please upload a clearer PDF or image.",
      docDisplayName,
      stateName,
    };
  }

  const extractedText = extraction.text || "";

  // Note: extraction.rotationDegrees (set in ocrEngine.js) tells us whether the
  // photo was sideways/upside-down and had to be auto-rotated to be read. We
  // don't reject on that — users shouldn't be forced to upload in one exact
  // orientation — so extractedText above is already the correctly-rotated
  // reading and just flows into the normal keyword validation below.

  // 2. Evaluate against category & state keyword rules (if mapped)
  if (typeKey) {
    if (onProgress) {
      onProgress("Verifying document category and details...");
    }

    const evaluation = evaluateDocumentText(extractedText, docType, effectiveState, docName);

    if (!evaluation.isValid) {
      return {
        shouldValidate: true,
        isValid: false,
        error:
          evaluation.error ||
          "This document does not appear to match the selected document type. Please upload the correct document.",
        docDisplayName: evaluation.docDisplayName || docDisplayName,
        stateName: evaluation.stateName || stateName,
        method: extraction.method,
      };
    }
  }

  // 3. Verify Document Number (if provided)
  if (docNumber) {
    if (onProgress) {
      onProgress(`Verifying document number ${docNumber}...`);
    }

    const matchesDocNumber = isDocumentNumberInText(extractedText, docNumber);

    if (!matchesDocNumber) {
      // Surface what OCR actually read so this is debuggable without extra
      // tooling — open the browser console to see what text was extracted
      // and compare it against the number that was entered.
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          `[documentValidator] Document Number "${docNumber}" not found. OCR (${extraction.method}) extracted:\n`,
          extractedText
        );
      }
      return {
        shouldValidate: true,
        isValid: false,
        error: `Document Number "${docNumber}" was not found in the uploaded document. Please check the document number or upload the matching document.`,
        docDisplayName,
        stateName,
        method: extraction.method,
        extractedText,
      };
    }
  }

  return {
    shouldValidate: true,
    isValid: true,
    docDisplayName,
    stateName,
    method: extraction.method,
    extractedText,
  };
}

/**
 * Alias for backward compatibility with previous Resource Partner implementation.
 */
export const validateResourcePartnerDocument = validateDocument;
export default validateDocument;