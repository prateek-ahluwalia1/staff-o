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
};

/**
 * Determines whether automated document content validation applies to this document.
 * Returns true if the document type or name maps to any known category (Staff or Contractor).
 *
 * @param {string} userType      - Current user role ('staff', 'contractor', 'admin', etc.)
 * @param {string} docType       - document_type from form/doc
 * @param {string} docCategory   - document_category (e.g. 'contractor_document', 'nsw_document', or state)
 * @param {string} docName       - document_name from form/doc or fieldName
 */
export function isDocumentValidationApplicable(userType, docType, docCategory, docName) {
  const resolvedTypeKey = resolveDocumentTypeKey(docType, docName);
  return Boolean(resolvedTypeKey);
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
 * then validates against category keywords and state requirements.
 *
 * @param {File} file            - The user's selected file.
 * @param {string} docType       - document_type (e.g. 'passport', 'security_license', 'public_liability')
 * @param {string} docCategory   - document_category or state ('vic', 'contractor_document', 'nsw_document', etc.)
 * @param {string} docName       - document_name or fieldName
 * @param {function} onProgress - Progress status callback: (statusMessage) => void
 * @param {object} [options]     - Optional parameters (e.g. { state: 'VIC' })
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

  if (!typeKey) {
    // Unknown or unmapped document category: allow existing upload flow without blocking
    return { shouldValidate: false, isValid: true, docDisplayName };
  }

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

  // 2. Evaluate against category & state keyword rules
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
