import React from "react";
import { apiURL } from "../utils/exports";

export default function DocumentTable({ documents, onAddFile, onAddDocument, userType }) {
  return (
    <div
      className="settings-card"
      style={{
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        border: "1px solid #e5e7eb",
        background: "#fff",
        padding: 0,
      }}
    >
      <div
        className="settings-card-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 32px 12px 32px",
          borderBottom: "1px solid #f0f0f0",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          background: "#f9fafb",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontWeight: 750, fontSize: 22, color: "#222" }}>
            Documents
          </h3>
          <p style={{ margin: 0, color: "#888", fontSize: 14 }}>
            All documents associated with your profile.
          </p>
        </div>
      </div>
      <div style={{ overflowX: "auto", padding: 24 }}>
        <table
          className="table table-bordered"
          style={{
            borderRadius: 12,
            overflow: "hidden",
            minWidth: 800,
            background: "#fff",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <thead style={{ background: "#f3f4f6" }}>
            <tr>
              <th style={{ fontWeight: 750, color: "#333", border: "none", padding: "12px 16px" }}>Document Name</th>
              <th style={{ fontWeight: 750, color: "#333", border: "none", padding: "12px 16px" }}>DOC. No.</th>
              <th style={{ fontWeight: 750, color: "#333", border: "none", padding: "12px 16px" }}>Expiration Date</th>
              <th style={{ fontWeight: 750, color: "#333", border: "none", padding: "12px 16px" }}>File</th>
              <th style={{ fontWeight: 750, color: "#333", border: "none", padding: "12px 16px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents && documents.length > 0 ? (
              documents.map((doc, idx) => {
                const isStaffEditingExisting = userType === "staff" && doc.file;

                return (
                  <tr
                    key={doc.id}
                    style={{
                      background: idx % 2 === 0 ? "#fff" : "#f9fafb",
                      transition: "background 0.2s",
                      borderRadius: 8,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                    onMouseOut={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f9fafb")}
                  >
                    <td style={{ padding: "10px 16px", verticalAlign: "middle", border: "none" }}>{doc.document_name}</td>
                    <td style={{ padding: "10px 16px", verticalAlign: "middle", border: "none" }}>{doc.document_no || "-"}</td>
                    <td style={{ padding: "10px 16px", verticalAlign: "middle", border: "none" }}>{doc.document_expiry || "-"}</td>
                    <td style={{ padding: "10px 16px", verticalAlign: "middle", border: "none" }}>
                      {doc.file ? (
                        <a href={`${apiURL}staff_documents/${doc.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View file"
                          style={{
                            color: "#0A7C6E",
                            fontSize: 20,
                            background: "#eaf1fb",
                            borderRadius: 6,
                            padding: 6,
                            display: "inline-block",
                            transition: "background 0.2s",
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = "#dbeafe")}
                          onMouseOut={(e) => (e.currentTarget.style.background = "#eaf1fb")}
                        >
                          <i className="fa fa-eye" aria-hidden="true"></i>
                        </a>
                      ) : (
                        <button
                          type="button"
                          title="Add file"
                          style={{
                            background: "#eafbe7",
                            border: "none",
                            color: "#28a745",
                            fontSize: 20,
                            cursor: "pointer",
                            borderRadius: 6,
                            padding: 6,
                            display: "inline-block",
                            transition: "background 0.2s",
                          }}
                          onClick={() => onAddFile(doc)}
                          onMouseOver={(e) => (e.currentTarget.style.background = "#d1fae5")}
                          onMouseOut={(e) => (e.currentTarget.style.background = "#eafbe7")}
                        >
                          <i className="fa fa-plus" aria-hidden="true"></i>
                        </button>
                      )}
                    </td>
                    <td style={{ padding: "10px 16px", verticalAlign: "middle", border: "none" }}>
                      {isStaffEditingExisting ? (
                        <button
                          type="button"
                          title="Uploaded documents cannot be edited directly."
                          style={{
                            background: "#f3f4f6",
                            border: "none",
                            color: "#9ca3af",
                            fontSize: 20,
                            cursor: "not-allowed",
                            borderRadius: 6,
                            padding: 6,
                          }}
                          disabled
                        >
                          <i className="fa fa-lock" aria-hidden="true"></i>
                        </button>
                      ) : (
                        <button
                          type="button"
                          title="Upload document"
                          style={{
                            background: "#f3f4f6",
                            border: "none",
                            color: "#0A7C6E",
                            fontSize: 20,
                            cursor: "pointer",
                            borderRadius: 6,
                            padding: 6,
                            transition: "background 0.2s",
                          }}
                          onClick={() => onAddFile(doc)}
                          onMouseOver={(e) => (e.currentTarget.style.background = "#e0e7ef")}
                          onMouseOut={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                        >
                          <i className="fa fa-pencil" aria-hidden="true"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center" style={{ padding: 32, color: "#888", fontSize: 16, background: "#f9fafb", border: "none" }}>
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}