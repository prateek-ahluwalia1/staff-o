import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import staffoLogo from "../assets/images/staffo.png";
import Loader from "../components/Loader";
import SignaturePad from "../components/contracts/SignaturePad";
import ResourcePartnerTerms from "./terms/ResourcePartnerTerms";
import { apiURL } from "../utils/exports";
import "./ContractSign.css";

/**
 * Format status slug to human readable string
 */
const formatStatus = (status = "") => {
  if (!status) return "Unknown";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Check if a key is an internal/non-display field
 */
const isIgnoredKey = (key) => {
  const ignored = [
    "pdf_url",
    "already_signed",
    "id",
    "token",
    "updated_at",
    "deleted_at",
  ];
  return ignored.includes(key.toLowerCase());
};

/**
 * Format key string to title label
 */
const formatKeyLabel = (key = "") => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Format dynamic values (dates, objects, booleans, strings)
 */
const formatValue = (key, val) => {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";

  // Check if date
  if (
    typeof val === "string" &&
    (key.includes("date") || key.includes("created_at") || key.includes("time"))
  ) {
    const parsedDate = new Date(val);
    if (!isNaN(parsedDate.getTime()) && val.length > 8) {
      return parsedDate.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }

  // Format currency/amounts
  if (typeof val === "number" && (key.includes("amount") || key.includes("rate") || key.includes("price") || key.includes("total"))) {
    return `$${val.toFixed(2)}`;
  }

  if (typeof val === "object") {
    return Array.isArray(val) ? val.join(", ") : JSON.stringify(val);
  }

  return String(val);
};

export default function ContractSign() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Form State
  const [signatureName, setSignatureName] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  const [hasSignature, setHasSignature] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);
  const [successResponseData, setSuccessResponseData] = useState(null);

  const sigPadRef = useRef(null);

  useEffect(() => {
    if (showTermsModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showTermsModal]);

  /**
   * Fetch Contract Details
   */
  const fetchContract = useCallback(async (authToken) => {
    if (!authToken) {
      setLoading(false);
      setFetchError("No contract token was provided. Please check the link from your email.");
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const res = await fetch(`${apiURL}api/contracts/sign/${authToken}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg = json?.message || json?.error || "Unable to load contract details.";
        setFetchError(errorMsg);
        setContractData(null);
        return;
      }

      if (json && json.success === false) {
        setFetchError(json.message || "Contract not found or link expired.");
        setContractData(null);
        return;
      }

      if (json?.data) {
        setContractData(json.data);
        if (json.data.already_signed) {
          setIsSubmittedSuccessfully(true);
        }
      } else {
        setFetchError("Contract data is unavailable.");
      }
    } catch (err) {
      console.error("Failed to fetch contract:", err);
      setFetchError("Unable to connect to the server. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContract(token);
  }, [token, fetchContract]);

  /**
   * Signature Pad Event Handlers
   */
  const handleSignatureEnd = ({ isEmpty, dataUrl }) => {
    setHasSignature(!isEmpty);
    setSignatureImage(dataUrl || "");
    if (!isEmpty && validationErrors.signature) {
      setValidationErrors((prev) => ({ ...prev, signature: null }));
    }
  };

  const handleSignatureClear = () => {
    setHasSignature(false);
    setSignatureImage("");
  };

  /**
   * Form Validation
   */
  const validateForm = () => {
    const errors = {};

    if (!signatureName.trim()) {
      errors.signatureName = "Please enter your signature name.";
    }

    // Get current signature data directly from canvas ref as fallback verification
    const currentSigData = sigPadRef.current?.toDataURL();
    const isSigEmpty = sigPadRef.current?.isEmpty ? sigPadRef.current.isEmpty() : !hasSignature;

    if (isSigEmpty || !currentSigData) {
      errors.signature = "Please provide your signature.";
    }

    if (!agreeTerms) {
      errors.agreeTerms = "Please agree to the Resource Partner Terms & Conditions to proceed.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Submit Signature
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validateForm()) {
      if (!agreeTerms) {
        toast.error("Please agree to the Resource Partner Terms & Conditions to proceed.");
      } else {
        toast.error("Please fill in all required signature fields.");
      }
      return;
    }

    // Ensure we have the latest Base64 image
    const finalBase64 = sigPadRef.current?.toDataURL() || signatureImage;
    if (!finalBase64) {
      toast.error("Please provide your signature.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        signature_name: signatureName.trim(),
        signature_image: finalBase64,
      };

      const res = await fetch(`${apiURL}api/contracts/sign/${token}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || (json && json.success === false)) {
        let errorMsg = json?.message || json?.error;
        if (!errorMsg && json?.errors && typeof json.errors === "object") {
          const firstKey = Object.keys(json.errors)[0];
          if (firstKey && Array.isArray(json.errors[firstKey])) {
            errorMsg = json.errors[firstKey][0];
          }
        }
        const displayError = errorMsg || "Failed to submit signature. Please try again.";
        toast.error(displayError);
        return;
      }

      // Success
      toast.success("Contract signed successfully!");
      setSuccessResponseData(json?.data || null);
      setIsSubmittedSuccessfully(true);
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("An unexpected network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Styling Helper
  const getStatusBadgeClass = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("pending") || s.includes("draft")) return "cs-badge-pending";
    if (s.includes("sign") || s.includes("active") || s.includes("approved")) return "cs-badge-signed";
    if (s.includes("cancel") || s.includes("reject") || s.includes("expire")) return "cs-badge-cancelled";
    return "cs-badge-pending";
  };

  return (
    <>
      <Helmet>
        <title>Contract Signing | Staffoo</title>
        <meta
          name="description"
          content="Review and digitally sign your Staffoo contract securely online."
        />
        <link rel="icon" type="image/png" href="/staffo.png" />
      </Helmet>

      <div className="cs-page">
        {/* Minimal Clean Top Bar */}
        <header className="cs-topbar">
          <div className="cs-container cs-topbar-inner">
            <Link to="/" className="cs-topbar-brand" title="Staffoo Home">
              <img src={staffoLogo} alt="Staffoo" className="cs-topbar-logo" />
            </Link>
            <div className="cs-topbar-badge">
              <i className="fa-solid fa-shield-halved" />
              <span>Secure Digital Signature Portal</span>
            </div>
          </div>
        </header>

        {/* Main Section */}
        <main className="cs-main">
          <div className="cs-container">
            {/* 1. LOADING STATE */}
            {loading && (
              <div style={{ padding: "60px 0" }}>
                <Loader message="Loading contract details..." />
              </div>
            )}

            {/* 2. ERROR / INVALID TOKEN STATE */}
            {!loading && fetchError && (
              <div className="cs-error-card">
                <div className="cs-error-icon-wrap">
                  <i className="fa-solid fa-triangle-exclamation" />
                </div>
                <h2 className="cs-error-title">Unable to Load Contract</h2>
                <p className="cs-error-desc">{fetchError}</p>
                <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => fetchContract(token)}
                    className="nh-btn nh-btn-solid"
                    style={{ padding: "10px 24px" }}
                  >
                    <i className="fa-solid fa-rotate-right" style={{ marginRight: "8px" }} />
                    Retry
                  </button>
                  <Link to="/" className="nh-btn nh-btn-outline" style={{ padding: "10px 24px" }}>
                    Return to Home
                  </Link>
                </div>
              </div>
            )}

            {/* 3. SUCCESS STATE */}
            {!loading && !fetchError && isSubmittedSuccessfully && (
              <div className="cs-success-card">
                <div className="cs-success-icon-wrap">
                  <i className="fa-solid fa-check" />
                </div>
                <h2 className="cs-success-title">Contract Signed Successfully</h2>
                <p className="cs-success-desc">
                  Your contract has been digitally signed and submitted successfully. A confirmation has been recorded on our platform.
                </p>

                {contractData && (
                  <div className="cs-success-summary">
                    {contractData.contract_number && (
                      <div className="cs-success-summary-row">
                        <span className="cs-success-summary-label">Contract Number:</span>
                        <span className="cs-success-summary-value">{contractData.contract_number}</span>
                      </div>
                    )}
                    {contractData.title && (
                      <div className="cs-success-summary-row">
                        <span className="cs-success-summary-label">Title:</span>
                        <span className="cs-success-summary-value">{contractData.title}</span>
                      </div>
                    )}
                    {signatureName && (
                      <div className="cs-success-summary-row">
                        <span className="cs-success-summary-label">Signed By:</span>
                        <span className="cs-success-summary-value">{signatureName}</span>
                      </div>
                    )}
                    <div className="cs-success-summary-row">
                      <span className="cs-success-summary-label">Signed Date:</span>
                      <span className="cs-success-summary-value">
                        {new Date().toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                  <Link to="/" className="nh-btn nh-btn-solid" style={{ padding: "12px 28px" }}>
                    Go to Homepage
                  </Link>
                </div>
              </div>
            )}

            {/* 4. ACTIVE SIGNING FLOW */}
            {!loading && !fetchError && !isSubmittedSuccessfully && contractData && (
              <>
                {/* Hero Header */}
                <div className="cs-hero-section">

                  <h1 className="cs-title">Contract Signing</h1>
                  <p className="cs-subtitle">
                    Please review your contract details and document below, then draw your digital signature to execute the agreement.
                  </p>
                </div>

                {/* Already Signed Notice (If backend returned already_signed: true) */}
                {contractData.already_signed && (
                  <div className="cs-signed-banner">
                    <i className="fa-solid fa-circle-check" />
                    <div className="cs-signed-banner-text">
                      <h4>Contract Already Signed</h4>
                      <p>This contract has already been signed and recorded in our system.</p>
                    </div>
                  </div>
                )}

                {/* Card 1: Contract Summary & Details */}
                <div className="cs-card">
                  <div className="cs-card-header">
                    <h2 className="cs-card-title">
                      <i className="fa-solid fa-file-lines" />
                      {contractData.title || "Contract Information"}
                    </h2>
                    <span className={`cs-badge ${getStatusBadgeClass(contractData.status)}`}>
                      <span className="cs-badge-dot" />
                      {formatStatus(contractData.status)}
                    </span>
                  </div>

                  <div className="cs-grid">
                    {contractData.contract_number && (
                      <div className="cs-grid-item">
                        <span className="cs-grid-label">Contract Number</span>
                        <span className="cs-grid-value highlight">{contractData.contract_number}</span>
                      </div>
                    )}

                    {contractData.title && (
                      <div className="cs-grid-item">
                        <span className="cs-grid-label">Title</span>
                        <span className="cs-grid-value">{contractData.title}</span>
                      </div>
                    )}

                    {contractData.state && (
                      <div className="cs-grid-item">
                        <span className="cs-grid-label">State / Region</span>
                        <span className="cs-grid-value" style={{ textTransform: "uppercase" }}>
                          {contractData.state}
                        </span>
                      </div>
                    )}

                    {contractData.status && (
                      <div className="cs-grid-item">
                        <span className="cs-grid-label">Status</span>
                        <span className="cs-grid-value">{formatStatus(contractData.status)}</span>
                      </div>
                    )}

                    {/* Dynamically render any other relevant API fields */}
                    {Object.entries(contractData).map(([key, val]) => {
                      if (
                        isIgnoredKey(key) ||
                        ["contract_number", "title", "state", "status"].includes(key.toLowerCase())
                      ) {
                        return null;
                      }

                      return (
                        <div key={key} className="cs-grid-item">
                          <span className="cs-grid-label">{formatKeyLabel(key)}</span>
                          <span className="cs-grid-value">{formatValue(key, val)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card 2: PDF Document Section */}
                {contractData.pdf_url && (
                  <div className="cs-card">
                    <div className="cs-card-header">
                      <h2 className="cs-card-title">
                        <i className="fa-solid fa-file-pdf" style={{ color: "#DC2626" }} />
                        Contract Document
                      </h2>
                    </div>

                    <div className="cs-doc-box">
                      <div className="cs-doc-info">
                        <div className="cs-doc-icon">
                          <i className="fa-solid fa-file-pdf" />
                        </div>
                        <div>
                          <div className="cs-doc-title">
                           
                            <span className="cs-doc-filename">
                              {contractData.contract_number
                                ? `${contractData.contract_number}.pdf`
                                : "Contract_Agreement.pdf"}
                            </span>
                          </div>
                          <div className="cs-doc-meta">
                            Official contract document for your review. Opens in a new tab.
                          </div>
                        </div>
                      </div>

                      <a
                        href={contractData.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cs-pdf-btn"
                        id="view-contract-pdf-btn"
                      >
                        <i className="fa-solid fa-file-pdf" />
                        <span>View Contract PDF</span>
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "12px", opacity: 0.85 }} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Card 3: Digital Signature Section */}
                {!contractData.already_signed && (
                  <form onSubmit={handleSubmit} className="cs-card" noValidate>
                    <div className="cs-card-header">
                      <h2 className="cs-card-title">
                        <i className="fa-solid fa-file-signature" />
                        Digital Signature
                      </h2>
                    </div>

                    <p className="cs-sig-instruction">
                      Please enter your legal name and draw your signature below. By clicking <strong>Sign &amp; Submit</strong>, you acknowledge that you have read, understood, and agreed to all terms outlined in the contract document.
                    </p>

                    {/* Signature Name Field */}
                    <div className="cs-form-group">
                      <label htmlFor="signature_name" className="cs-form-label">
                        Signature Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="signature_name"
                        name="signature_name"
                        placeholder="Enter your full name"
                        value={signatureName}
                        onChange={(e) => {
                          setSignatureName(e.target.value);
                          if (validationErrors.signatureName) {
                            setValidationErrors((prev) => ({ ...prev, signatureName: null }));
                          }
                        }}
                        className={`cs-input ${validationErrors.signatureName ? "has-error" : ""}`}
                        disabled={isSubmitting}
                        autoComplete="name"
                      />
                      {validationErrors.signatureName && (
                        <div className="cs-field-error">
                          <i className="fa-solid fa-circle-exclamation" />
                          {validationErrors.signatureName}
                        </div>
                      )}
                    </div>

                    {/* Signature Pad Area */}
                    <div className="cs-form-group">
                      <label className="cs-form-label">
                        Sign Here <span className="required">*</span>
                      </label>
                      <SignaturePad
                        ref={sigPadRef}
                        height={200}
                        onEnd={handleSignatureEnd}
                        onClear={handleSignatureClear}
                        disabled={isSubmitting}
                        placeholderText="Draw your signature here"
                      />
                      {validationErrors.signature && (
                        <div className="cs-field-error">
                          <i className="fa-solid fa-circle-exclamation" />
                          {validationErrors.signature}
                        </div>
                      )}
                    </div>

                    {/* Resource Partner Terms & Conditions Checkbox */}
                    <div className={`cs-terms-checkbox-group ${validationErrors.agreeTerms ? "has-error" : ""}`}>
                      <label className="cs-terms-checkbox-label">
                        <input
                          type="checkbox"
                          id="agree_terms"
                          name="agree_terms"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            if (validationErrors.agreeTerms) {
                              setValidationErrors((prev) => ({ ...prev, agreeTerms: null }));
                            }
                          }}
                          disabled={isSubmitting}
                          className="cs-checkbox"
                        />
                        <span>
                          I have read and agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="cs-terms-link-btn"
                          >
                            Resource Partner Terms &amp; Conditions
                          </button>
                          <span className="required" style={{ color: "#DC2626" }}> *</span>
                        </span>
                      </label>
                      {validationErrors.agreeTerms && (
                        <div className="cs-field-error">
                          <i className="fa-solid fa-circle-exclamation" />
                          {validationErrors.agreeTerms}
                        </div>
                      )}
                    </div>

                    {/* Submit Actions */}
                    <div className="cs-submit-box">
                      <button
                        type="submit"
                        disabled={isSubmitting || !agreeTerms}
                        className="cs-submit-btn"
                        id="sign-submit-btn"
                        style={{
                          opacity: (!agreeTerms || isSubmitting) ? 0.65 : 1,
                          cursor: (!agreeTerms || isSubmitting) ? "not-allowed" : "pointer",
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fa-solid fa-circle-notch fa-spin" />
                            Submitting Signature...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-signature" />
                            Sign &amp; Submit
                          </>
                        )}
                      </button>

                      <p className="cs-submit-disclaimer">
                        Your digital signature is legally binding and timestamped under applicable electronic transaction laws.
                      </p>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </main>

        {/* Resource Partner Terms & Conditions Modal Overlay */}
        {showTermsModal && (
          <ResourcePartnerTerms
            isOpen={showTermsModal}
            onClose={() => setShowTermsModal(false)}
            onAccept={() => {
              setAgreeTerms(true);
              setShowTermsModal(false);
              if (validationErrors.agreeTerms) {
                setValidationErrors((prev) => ({ ...prev, agreeTerms: null }));
              }
              toast.success("Resource Partner Terms & Conditions accepted.");
            }}
          />
        )}

        {/* Minimal Clean Footer */}
        <footer className="cs-simple-footer">
          <div className="cs-container">
            <p>© {new Date().getFullYear()} Staffoo. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
