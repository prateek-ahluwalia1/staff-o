import React from "react";
import Loader from "./Loader";

export default function HistoryModal({
    open,
    onClose,
    historyLoading,
    historyError,
    historyTx,
    invoiceHistory,
    formatDate,
}) {
    if (!open) return null;

    const successfulShares = invoiceHistory.filter(
        (item) => item.status?.toLowerCase() === "sent"
    ).length;

    const uniqueRecipients = new Set(
        invoiceHistory.map((item) => item.email)
    ).size;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,42,0.65)",
                backdropFilter: "blur(6px)",
                zIndex: 9999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "24px",
            }}
        >
            <div
                style={{
                    width: "1100px",
                    maxWidth: "95vw",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    background: "#fff",
                    borderRadius: "24px",
                    padding: "32px",
                    boxShadow: "0 25px 60px rgba(0,0,0,.18)",
                    position: "relative",
                }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        border: "none",
                        background: "#f1f5f9",
                        cursor: "pointer",
                        fontSize: "18px",
                    }}
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>

                {/* Header */}
                <div
                    style={{
                        marginBottom: "28px",
                        paddingBottom: "20px",
                        borderBottom: "1px solid #e5e7eb",
                    }}
                >
                    <h2
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            margin: 0,
                            fontSize: "28px",
                            fontWeight: "700",
                            color: "#111827",
                        }}
                    >
                        <i
                            className="fa-solid fa-clock-rotate-left"
                            style={{ color: "#0A7C6E" }}
                        ></i>
                        Share History
                    </h2>

                    <div
                        style={{
                            marginTop: "16px",
                        }}
                    >
                        <div
                            style={{
                                color: "#64748b",
                                fontSize: "13px",
                                marginBottom: "6px",
                            }}
                        >
                            Transaction ID
                        </div>

                        <div
                            style={{
                                display: "inline-block",
                                padding: "10px 16px",
                                background: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "10px",
                                fontFamily: "monospace",
                                color: "#334155",
                            }}
                        >
                            {historyTx?.payment_intent_id || historyTx?.id}
                        </div>
                    </div>
                </div>

                {historyLoading ? (
                    <div style={{ padding: "80px 0", textAlign: "center" }}>
                        <Loader />
                    </div>
                ) : historyError ? (
                    <div className="alert alert-danger">
                        {historyError}
                    </div>
                ) : invoiceHistory.length === 0 ? (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "80px 0",
                        }}
                    >
                        <i
                            className="fa-solid fa-inbox"
                            style={{
                                fontSize: "60px",
                                color: "#cbd5e1",
                            }}
                        ></i>

                        <h5
                            style={{
                                marginTop: "20px",
                                color: "#64748b",
                            }}
                        >
                            No history records found
                        </h5>
                    </div>
                ) : (
                    <>
                        {/* Stats */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                                gap: "16px",
                                marginBottom: "32px",
                            }}
                        >
                            <div
                                style={{
                                    background: "#f8fafc",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "16px",
                                    padding: "20px",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "32px",
                                        fontWeight: "700",
                                        color: "#0A7C6E",
                                    }}
                                >
                                    {invoiceHistory.length}
                                </div>

                                <div style={{ color: "#64748b" }}>
                                    Total Shares
                                </div>
                            </div>

                            <div
                                style={{
                                    background: "#f8fafc",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "16px",
                                    padding: "20px",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "32px",
                                        fontWeight: "700",
                                        color: "#16a34a",
                                    }}
                                >
                                    {successfulShares}
                                </div>

                                <div style={{ color: "#64748b" }}>
                                    Successful
                                </div>
                            </div>

                            <div
                                style={{
                                    background: "#f8fafc",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "16px",
                                    padding: "20px",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "32px",
                                        fontWeight: "700",
                                        color: "#2563eb",
                                    }}
                                >
                                    {uniqueRecipients}
                                </div>

                                <div style={{ color: "#64748b" }}>
                                    Recipients
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div>
                            {invoiceHistory.map((item, index) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: "flex",
                                        gap: "18px",
                                        marginBottom: "20px",
                                    }}
                                >
                                    {/* Icon */}
                                    <div
                                        style={{
                                            minWidth: "46px",
                                            height: "46px",
                                            borderRadius: "14px",
                                            background:
                                                "linear-gradient(135deg,#0A7C6E,#0ea5a0)",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxShadow:
                                                "0 10px 20px rgba(10,124,110,.18)",
                                        }}
                                    >
                                        <i className="fa-solid fa-envelope"></i>
                                    </div>

                                    {/* Card */}
                                    <div
                                        style={{
                                            flex: 1,
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "18px",
                                            padding: "20px",
                                            background: "#fff",
                                            boxShadow:
                                                "0 4px 12px rgba(0,0,0,.04)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                gap: "20px",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: "17px",
                                                        fontWeight: "700",
                                                        color: "#111827",
                                                        textTransform: "none"
                                                    }}
                                                >
                                                    {item.email}
                                                </div>

                                                <div
                                                    style={{
                                                        marginTop: "6px",
                                                        color: "#64748b",
                                                        fontSize: "13px",
                                                    }}
                                                >
                                                    {formatDate(item.created_at)}
                                                    {" • "}
                                                    {new Date(
                                                        item.created_at
                                                    ).toLocaleTimeString(
                                                        "en-AU",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </div>
                                            </div>

                                            <span
                                                style={{
                                                    padding: "8px 14px",
                                                    borderRadius: "999px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    background:
                                                        item.status?.toLowerCase() ===
                                                            "sent"
                                                            ? "#dcfce7"
                                                            : "#fef3c7",
                                                    color:
                                                        item.status?.toLowerCase() ===
                                                            "sent"
                                                            ? "#166534"
                                                            : "#92400e",
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                {item.status}
                                            </span>
                                        </div>

                                        {item.response && (
                                            <div
                                                style={{
                                                    marginTop: "16px",
                                                    padding: "14px",
                                                    background: "#f8fafc",
                                                    borderLeft:
                                                        "4px solid #0A7C6E",
                                                    borderRadius: "10px",
                                                    color: "#475569",
                                                    fontSize: "14px",
                                                }}
                                            >
                                                {item.response}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div
                    style={{
                        marginTop: "28px",
                        paddingTop: "20px",
                        borderTop: "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        className="btn btn-outline-secondary px-4"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}