import React, { useEffect, useState, useCallback } from "react";
import PDFGenerator from "../../utils/PDFGenerator";
import useFetch from "../../hooks/useFetch";
import { toast } from "react-toastify";

export default function DownloadShiftReport({ rosterId, guardId, shift, site }) {
    // 1. Construct the URL with query parameters for the GET request
    const url = `api/guard/all-reports?guard_id=${guardId}&roster_id=${rosterId}`;

    // 2. Use useFetch. immediate: true (default) fetches as soon as the component mounts.
    const { data: apiData, loading, refetch } = useFetch(url, { isAuth: true, immediate: true });

    const [isGenerating, setIsGenerating] = useState(false);
    const [hasInitialDownloaded, setHasInitialDownloaded] = useState(false);

    // Make this function async
    const createAndDownloadPDF = useCallback(async (reportApiData) => {
        try {
            setIsGenerating(true);
            const reportData = {
                siteName: site?.displayName || site?.site_name,
                siteAddress: site?.address,
                guardName: shift?.guards?.name || "Unassigned",
                shiftStart: shift?.start,
                shiftEnd: shift?.end,
                totalHours: shift?.hours,
                jobStatus: shift?.job_status,
                signinDetails: reportApiData?.data || reportApiData || null,
            };

            // CRITICAL: Add "await" here!
            const doc = await PDFGenerator.generateShiftReportPDF(reportData);

            PDFGenerator.downloadPDF(doc, `Shift_Report_${shift?.id || 'Doc'}.pdf`);
            toast.success("Report downloaded successfully!");
        } catch (error) {
            toast.error(error?.message || "Failed to generate report. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    }, [site, shift]);

    // 3. Auto-download once the data successfully arrives from the hook
    useEffect(() => {
        if (apiData && !loading && !hasInitialDownloaded) {
            createAndDownloadPDF(apiData);
            setHasInitialDownloaded(true);
        }
    }, [apiData, loading, hasInitialDownloaded, createAndDownloadPDF]);

    // 4. Handle "Download Again" click
    const handleDownloadAgain = async () => {
        // If we already have the data in memory, reuse it instantly without hitting the server
        if (apiData) {
            createAndDownloadPDF(apiData);
        } else {
            // Fallback just in case data was lost
            await refetch();
            setHasInitialDownloaded(false); // Reset to allow the useEffect to trigger
        }
    };

    // Calculate if we should show the loading spinner
    const isBusy = loading || isGenerating || (apiData && !loading && !hasInitialDownloaded);

    return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 p-4">
            {isBusy ? (
                <>
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
                        <span className="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
                    </div>
                    <h4 className="fw-bold mb-3">Generating Report...</h4>
                    <p className="text-muted text-center">Your PDF is being generated and will download automatically.</p>
                </>
            ) : (
                <>
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
                        <i className="fa fa-check-circle" style={{ fontSize: "36px" }}></i>
                    </div>
                    <h4 className="fw-bold mb-3">Report Downloaded!</h4>
                    <p className="text-muted text-center mb-4" style={{ maxWidth: "400px" }}>
                        Your  end shift report has been successfully downloaded.
                    </p>
                    <button
                        onClick={handleDownloadAgain}
                        disabled={isBusy}
                        className="btn btn-success d-flex align-items-center gap-2 px-4 py-2"
                        style={{ fontWeight: "600", fontSize: "15px" }}
                    >
                        <i className="fa fa-download"></i>
                        Download Again
                    </button>
                </>
            )}
        </div>
    );
}