import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";

/**
 * Format status slug to human readable string
 */
const formatStatus = (status = "") => {
  if (!status) return "Pending Signature";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Format dynamic date strings (e.g. ISO date or timestamp)
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return String(dateStr);
  return parsed.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function PartnerContracts() {
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Fetch contracts via existing hook
  const {
    data: contractsResponse,
    loading,
    error: fetchError,
    refetch,
  } = useFetch("api/contracts", {
    isAuth: true,
  });

  // Extract contracts array safely from response
  const contractsList = useMemo(() => {
    if (!contractsResponse) return [];
    if (Array.isArray(contractsResponse)) return contractsResponse;
    if (Array.isArray(contractsResponse.data)) return contractsResponse.data;
    if (Array.isArray(contractsResponse.contracts)) return contractsResponse.contracts;
    if (Array.isArray(contractsResponse.data?.contracts)) return contractsResponse.data.contracts;
    if (Array.isArray(contractsResponse.data?.data)) return contractsResponse.data.data;
    return [];
  }, [contractsResponse]);

  // Statistics dynamically calculated from actual contract.status
  const stats = useMemo(() => {
    const total = contractsList.length;
    const signed = contractsList.filter(
      (c) => String(c.status || "").toLowerCase() === "signed"
    ).length;
    const pending = contractsList.filter(
      (c) => String(c.status || "").toLowerCase() !== "signed"
    ).length;

    return { total, signed, pending };
  }, [contractsList]);

  // Status Badge Helper
  const getStatusBadge = (status = "") => {
    const s = String(status || "").toLowerCase();
    if (s === "signed") {
      return {
        bg: "#E1F3F0",
        color: "#0A7C6E",
        dot: "#0A7C6E",
        label: "Signed",
      };
    }
    if (s.includes("cancel") || s.includes("reject") || s.includes("expire")) {
      return {
        bg: "#FEE2E2",
        color: "#991B1B",
        dot: "#DC2626",
        label: formatStatus(status || "Cancelled"),
      };
    }
    return {
      bg: "#FEF3C7",
      color: "#92400E",
      dot: "#D97706",
      label: formatStatus(status || "Pending Signature"),
    };
  };

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    return contractsList.filter((item) => {
      // Text search
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        (item.contract_number && item.contract_number.toLowerCase().includes(term)) ||
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.partner_name && item.partner_name.toLowerCase().includes(term)) ||
        (item.contractor_name && item.contractor_name.toLowerCase().includes(term)) ||
        (item.client_name && item.client_name.toLowerCase().includes(term)) ||
        (item.signature_name && item.signature_name.toLowerCase().includes(term));

      // Status filter strictly based on item.status
      const itemStatus = String(item.status || "").toLowerCase();
      const isSigned = itemStatus === "signed";
      const matchStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "signed" && isSigned) ||
        (selectedStatus === "pending" && !isSigned);

      return matchSearch && matchStatus;
    });
  }, [contractsList, searchTerm, selectedStatus]);

  // Restrict to Admin
  if (userType !== "admin") {
    return (
      <div className="dashboard-main" style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: "450px", margin: "60px auto", background: "#fff", padding: "40px 24px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          <i className="fa-solid fa-lock" style={{ fontSize: "36px", color: "#94a3b8", marginBottom: "16px" }} />
          <h4 style={{ color: "#0f172a", marginBottom: "8px", fontWeight: 700 }}>Access Denied</h4>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            You do not have permission to view Partner Contracts. This page is accessible by administrators only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main">
      <style>{`
        .pc-page-wrapper {
          padding: 0 0 20px;
          color: #14181c;
          font-family: 'Inter', sans-serif;
        }

        /* Hero Banner */
        .pc-hero-card {
          background: linear-gradient(135deg, #0a1930 0%, #0e2340 65%, #0A7C6E 100%);
          border-radius: 12px;
          padding: 18px 22px;
          color: #ffffff;
          margin-bottom: 14px;
          box-shadow: 0 2px 10px rgba(10, 25, 48, 0.12);
        }

        .pc-hero-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .pc-hero-title {
          font-family: 'Barlow Semi Condensed', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 3px 0;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pc-hero-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
          line-height: 1.4;
        }

        /* Stat Counters */
        .pc-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 14px;
        }

        .pc-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 12px 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pc-stat-icon {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .pc-stat-info {
          display: flex;
          flex-direction: column;
        }

        .pc-stat-value {
          font-family: 'Barlow Semi Condensed', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.1;
        }

        .pc-stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        /* Filter Controls */
        .pc-filter-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 14px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .pc-search-box {
          position: relative;
          flex: 1;
          min-width: 200px;
          max-width: 360px;
        }

        .pc-search-input {
          width: 100%;
          padding: 7px 12px 7px 32px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          color: #0f172a;
          background: #f8fafc;
          transition: border-color 0.15s, background 0.15s;
        }

        .pc-search-input:focus {
          border-color: #0A7C6E;
          background: #ffffff;
          box-shadow: 0 0 0 2px rgba(10, 124, 110, 0.1);
        }

        .pc-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 13px;
          pointer-events: none;
        }

        .pc-filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pc-select {
          padding: 7px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 12.5px;
          color: #334155;
          background: #f8fafc;
          outline: none;
          cursor: pointer;
          font-weight: 500;
        }

        .pc-select:focus {
          border-color: #0A7C6E;
          background: #ffffff;
        }

        .pc-refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          background: #f0fdf9;
          border: 1px solid #d1fae5;
          color: #0A7C6E;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .pc-refresh-btn:hover {
          background: #0A7C6E;
          color: #ffffff;
          border-color: #0A7C6E;
        }

        /* Table Card */
        .pc-table-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          overflow: hidden;
        }

        .pc-table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .pc-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }

        .pc-table th {
          background: #f8fafc;
          color: #475569;
          font-weight: 600;
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }

        .pc-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          vertical-align: middle;
        }

        .pc-table tr:hover td {
          background: #f8fafc;
        }

        .pc-table tr:last-child td {
          border-bottom: none;
        }

        /* Badges */
        .pc-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1px;
          white-space: nowrap;
        }

        .pc-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .pc-contract-num {
          font-weight: 700;
          color: #0A7C6E;
          font-family: 'Barlow Semi Condensed', sans-serif;
          font-size: 13.5px;
          white-space: nowrap;
        }

        .pc-pdf-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .pc-pdf-btn.signed {
          background: #E1F3F0;
          border: 1px solid #0A7C6E;
          color: #0A7C6E;
        }

        .pc-pdf-btn.signed:hover {
          background: #0A7C6E;
          color: #ffffff;
          text-decoration: none;
        }

        .pc-pdf-btn.unsigned {
          background: #ffffff;
          border: 1px solid #CBD5E1;
          color: #475569;
        }

        .pc-pdf-btn.unsigned:hover {
          background: #f1f5f9;
          border-color: #94A3B8;
          color: #1E293B;
          text-decoration: none;
        }

        /* Empty & Error States */
        .pc-empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #64748b;
        }

        .pc-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin: 0 auto 12px;
        }

        .pc-empty-title {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .pc-empty-desc {
          font-size: 13px;
          margin: 0;
          max-width: 360px;
          margin: 0 auto;
        }

        .pc-error-state {
          padding: 28px 20px;
          text-align: center;
          background: #ffffff;
          border: 1px solid #fecaca;
          border-radius: 10px;
          margin-bottom: 14px;
        }

        .pc-error-icon {
          font-size: 24px;
          color: #dc2626;
          margin-bottom: 8px;
        }

        .pc-error-title {
          font-size: 15px;
          font-weight: 700;
          color: #991b1b;
          margin: 0 0 4px;
        }

        .pc-error-desc {
          font-size: 12.5px;
          color: #b91c1c;
          margin: 0 0 12px;
        }
      `}</style>

      <div className="pc-page-wrapper">
        {/* Hero Section */}
        <div className="pc-hero-card">
          <div className="pc-hero-header">
            <div>
              <h1 className="pc-hero-title">
                <i className="fa-solid fa-file-signature" />
                Partner Contracts
              </h1>
              <p className="pc-hero-subtitle">
                Overview of partner and contractor agreements, statuses, and documents.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => refetch()}
                className="pc-refresh-btn"
                title="Refresh contracts list"
              >
                <i className="fa-solid fa-rotate" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="pc-stats-row">
          <div className="pc-stat-card">
            <div className="pc-stat-icon" style={{ background: "#f0fdf9", color: "#0A7C6E" }}>
              <i className="fa-solid fa-file-contract" />
            </div>
            <div className="pc-stat-info">
              <span className="pc-stat-value">{stats.total}</span>
              <span className="pc-stat-label">Total Contracts</span>
            </div>
          </div>

          <div className="pc-stat-card">
            <div className="pc-stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
              <i className="fa-solid fa-signature" />
            </div>
            <div className="pc-stat-info">
              <span className="pc-stat-value">{stats.signed}</span>
              <span className="pc-stat-label">Signed Contracts</span>
            </div>
          </div>

          <div className="pc-stat-card">
            <div className="pc-stat-icon" style={{ background: "#fffbeb", color: "#d97706" }}>
              <i className="fa-solid fa-hourglass-half" />
            </div>
            <div className="pc-stat-info">
              <span className="pc-stat-value">{stats.pending}</span>
              <span className="pc-stat-label">Pending Signatures</span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="pc-filter-card">
          <div className="pc-search-box">
            <i className="fa-solid fa-magnifying-glass pc-search-icon" />
            <input
              type="text"
              className="pc-search-input"
              placeholder="Search contract #, title, partner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="pc-filter-group">
            {/* Status Filter */}
            <select
              className="pc-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="signed">Signed</option>
              <option value="pending">Pending Signature</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {fetchError && (
          <div className="pc-error-state">
            <i className="fa-solid fa-triangle-exclamation pc-error-icon" />
            <h3 className="pc-error-title">Unable to Load Partner Contracts</h3>
            <p className="pc-error-desc">{fetchError}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="pc-refresh-btn"
            >
              <i className="fa-solid fa-rotate" />
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="pc-table-card" style={{ padding: "40px 0" }}>
            <Loader message="Loading partner contracts..." />
          </div>
        )}

        {/* Table Content */}
        {!loading && !fetchError && (
          <div className="pc-table-card">
            {filteredContracts.length === 0 ? (
              <div className="pc-empty-state">
                <div className="pc-empty-icon">
                  <i className="fa-solid fa-file-contract" />
                </div>
                <h3 className="pc-empty-title">No Partner Contracts Found</h3>
                <p className="pc-empty-desc">
                  {searchTerm || selectedStatus !== "ALL"
                    ? "No partner contracts match the selected search filters."
                    : "No partner contracts are currently available."}
                </p>
              </div>
            ) : (
              <div className="pc-table-responsive">
                <table className="pc-table">
                  <thead>
                    <tr>
                      <th style={{ width: "36px" }}>#</th>
                      <th style={{ width: "130px" }}>Contract Number</th>
                      <th>Title</th>
                      <th>Partner</th>
                      <th style={{ width: "120px" }}>Status</th>
                      <th style={{ width: "100px" }}>Dates</th>
                      <th style={{ width: "130px", textAlign: "right" }}>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.map((item, index) => {
                      const isSigned = String(item.status || "").toLowerCase() === "signed";
                      const badge = getStatusBadge(item.status);
                      const partnerName =
                        item.partner_name ||
                        item.contractor_name ||
                        item.user_name ||
                        item.client_name ||
                        item.user?.name ||
                        item.partner?.name ||
                        "—";

                      const dateDisplay = item.created_at
                        ? formatDate(item.created_at)
                        : item.start_date
                          ? formatDate(item.start_date)
                          : item.signed_at
                            ? formatDate(item.signed_at)
                            : "—";

                      // PDF selection logic: if signed, use signed_pdf_url; otherwise use pdf_url
                      const targetPdfUrl = isSigned
                        ? (item.signed_pdf_url || item.pdf_url)
                        : item.pdf_url;

                      const pdfButtonLabel = isSigned ? "View Signed PDF" : "View Contract PDF";

                      return (
                        <tr key={item.id || item.contract_number || index}>
                          <td style={{ color: "#94a3b8", fontSize: "12px" }}>{index + 1}</td>
                          <td>
                            <span className="pc-contract-num">
                              {item.contract_number || `CTR-${item.id || index + 1}`}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: "#0f172a" }}>
                              {item.title || "Partner Agreement"}
                            </div>
                            {item.description && (
                              <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "1px" }}>
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{partnerName}</div>
                            {item.signature_name && (
                              <div style={{ fontSize: "11px", color: "#64748b" }}>
                                Signed by: {item.signature_name}
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              className="pc-status-badge"
                              style={{ backgroundColor: badge.bg, color: badge.color }}
                            >
                              <span
                                className="pc-status-dot"
                                style={{ backgroundColor: badge.dot }}
                              />
                              {badge.label}
                            </span>
                          </td>
                          <td style={{ fontSize: "12px", color: "#475569", whiteSpace: "nowrap" }}>
                            {dateDisplay}
                          </td>
                          <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            {targetPdfUrl ? (
                              <a
                                href={targetPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`pc-pdf-btn ${isSigned ? "signed" : "unsigned"}`}
                                title={isSigned ? "Open Signed Contract PDF" : "Open Original Contract PDF"}
                              >
                                <i
                                  className={`fa-solid ${isSigned ? "fa-file-circle-check" : "fa-file-pdf"}`}
                                  style={{ color: isSigned ? "#0A7C6E" : "#dc2626" }}
                                />
                                {pdfButtonLabel}
                              </a>
                            ) : (
                              <span style={{ color: "#94a3b8", fontSize: "12px" }}>No PDF</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
