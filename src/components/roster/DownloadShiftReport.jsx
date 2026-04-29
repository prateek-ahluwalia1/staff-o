import React from "react";
import PDFGenerator from "../../utils/PDFGenerator";
import useSubmit from "../../hooks/useSubmit";
import { toast } from "react-toastify";

export default function DownloadShiftReport({ rosterId, guardId, shift, site }) {
    const { submit, loading } = useSubmit({ isAuth: true });

    const handleDownload = async () => {
        try {
            const response = await submit("api/get-jobSignIn-jobSignOut", {
                guard_id: guardId,
                roster_id: rosterId,
            });

            const reportData = {
                siteName: site?.displayName || site?.site_name,
                siteAddress: site?.address,
                guardName: shift?.guards?.name || "Unassigned",
                shiftStart: shift?.start,
                shiftEnd: shift?.end,
                totalHours: shift?.hours,
                jobStatus: shift?.job_status,
                signinDetails: response?.data || null,
            };
            const doc = PDFGenerator.generateShiftReportPDF(reportData);
            PDFGenerator.downloadPDF(doc, `Shift_Report_${shift?.id || 'Doc'}.pdf`);

        } catch (error) {
            toast.error(error?.message || "Failed to generate report. Please try again.");
        }
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
            <div
                style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#e8f5e9",
                    color: "#2e7d32",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem"
                }}
            >
                <i className="fa fa-file-pdf-o" style={{ fontSize: "36px" }}></i>
            </div>

            <h4 className="fw-bold mb-3">Download Shift Report</h4>
            <p className="text-muted text-center mb-4" style={{ maxWidth: "400px" }}>
                Generate a comprehensive PDF report containing shift schedule, site details, and verified sign-in/out logs.
            </p>

            <button
                onClick={handleDownload}
                disabled={loading}
                className="btn btn-success d-flex align-items-center gap-2 px-4 py-2"
                style={{ fontWeight: "600", fontSize: "15px" }}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Generating PDF...
                    </>
                ) : (
                    <>
                        <i className="fa fa-download"></i>
                        Download PDF Report
                    </>
                )}
            </button>
        </div>
    );
}