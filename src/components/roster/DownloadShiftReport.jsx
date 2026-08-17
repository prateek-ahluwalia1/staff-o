import React, { useEffect, useState, useCallback } from "react";
import useSubmit from "../../hooks/useSubmit";
import { toast } from "react-toastify";

const triggerUrlDownload = (fileUrl, filename) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
};

export default function DownloadShiftReport({ rosterId, guardId, shift }) {
    const { submit, loading } = useSubmit({ isAuth: true });
    const [hasInitialDownloaded, setHasInitialDownloaded] = useState(false);

    const downloadPDF = useCallback(async () => {
        const payload = { roster_id: rosterId, guard_id: guardId };

        // Use standard JSON submit
        const response = await submit("api/generate-shift-report", payload);

        // Check for the path in the JSON response
        if (response?.success && response?.path) {
            triggerUrlDownload(response.path, `Shift_Report_${shift?.id || 'Doc'}.pdf`);
            toast.success("Report downloaded successfully!");
        }
    }, [rosterId, guardId, shift, submit]);

    useEffect(() => {
        if (!hasInitialDownloaded) {
            downloadPDF();
            setHasInitialDownloaded(true);
        }
    }, [hasInitialDownloaded, downloadPDF]);

    return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
            {loading ? (
                <>
                    <div style={{ width: "80px", height: "80px", backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                        <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
                    </div>
                    <h4 className="fw-bold mb-3">Generating Report...</h4>
                    <p className="text-muted text-center">Your PDF is being generated and will download automatically.</p>
                </>
            ) : (
                <>
                    <div style={{ width: "80px", height: "80px", backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                        <i className="fa fa-check-circle" style={{ fontSize: "36px" }}></i>
                    </div>
                    <h4 className="fw-bold mb-3">Report Downloaded!</h4>
                    <p className="text-muted text-center mb-4" style={{ maxWidth: "400px" }}>
                        Your end job report has been successfully downloaded.
                    </p>
                    <button
                        onClick={downloadPDF}
                        disabled={loading}
                        className="btn btn-success d-flex align-items-center gap-2 px-4 py-2"
                        style={{ fontWeight: "600", fontSize: "15px" }}
                    >
                        <i className="fa fa-download"></i> Download Again
                    </button>
                </>
            )}
        </div>
    );
}