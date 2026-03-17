import React, { useMemo, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import Loader from "../components/Loader";
import useFetch from "../hooks/useFetch";

function formatDateTime(value) {
  if (!value) return "-";

  const normalized = String(value).replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LatestJobs() {
  const { data: jobsResponse, loading } = useFetch("api/get-all-jobs");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedJob, setSelectedJob] = useState(null);

  const jobs = useMemo(() => {
    return Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];
  }, [jobsResponse]);

  const handleOpenModal = (job) => {
    setSelectedJob(job);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    document.body.style.overflow = "auto";
  };

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <>
      {/* Custom Styles for Animations, Polish, and Modal */}
      <style>{`
        .bg-light-grey { background-color: #f8f9fa; }
        .job-card { transition: all 0.3s ease; border: 1px solid rgba(0,0,0,0.05); }
        .job-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important; border-color: rgba(13, 110, 253, 0.2); }
        .view-toggle-btn { border-radius: 30px; padding: 0.4rem 1.2rem; font-weight: 500; transition: all 0.2s ease; }
        .icon-box { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #e9ecef; border-radius: 8px; color: #0d6efd; }
        .badge-soft-primary { background-color: rgba(13, 110, 253, 0.1); color: #0d6efd; border-radius: 6px; padding: 6px 10px; font-weight: 600; font-size: 0.8rem; }
        .table-custom-header th { background-color: #f1f3f5; color: #495057; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; padding: 1rem; }
        .table td { padding: 1rem; vertical-align: middle; }
        
        /* Modal Styles */
        .custom-modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 1050; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease-in-out; padding: 1rem; }
        .custom-modal-content { background: white; border-radius: 16px; width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: slideUp 0.3s ease-out; display: flex; flex-direction: column; }
        .custom-modal-header { padding: 1.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: white; z-index: 10; border-radius: 16px 16px 0 0; }
        .custom-modal-body { padding: 1.5rem; }
        .custom-modal-footer { padding: 1.5rem; border-top: 1px solid #eee; display: flex; justify-content: flex-end; position: sticky; bottom: 0; background: white; border-radius: 0 0 16px 16px; z-index: 10; }
        .close-btn { background: none; border: none; font-size: 1.5rem; color: #6c757d; cursor: pointer; transition: color 0.2s; }
        .close-btn:hover { color: #dc3545; }
        .detail-group { background: #f8f9fa; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid #eee; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <Header />

      <section
        className="section bg-light-grey py-5"
        style={{ minHeight: "80vh" }}
      >
        <div className="container">
          {/* Header Area */}
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4 mb-5">
            <div>
              <span
                className="text-primary fw-bold text-uppercase tracking-wide"
                style={{ letterSpacing: "1px", fontSize: "0.85rem" }}
              >
                Discover Opportunities
              </span>
              <h2 className="mb-1 fw-bold text-dark mt-1">
                Latest Available Jobs
              </h2>
              <p className="text-secondary mb-0">
                Showing{" "}
                <span className="fw-semibold text-dark">{jobs.length}</span> of{" "}
                {jobsResponse?.total || jobs.length} total jobs
              </p>
            </div>

            {/* View Mode Toggles */}
            <div className="bg-white p-1 rounded-pill shadow-sm border">
              <div className="btn-group" role="group" aria-label="View mode">
                <button
                  type="button"
                  className={`btn view-toggle-btn border-0 ${viewMode === "grid" ? "btn-primary text-white" : "text-secondary"}`}
                  onClick={() => setViewMode("grid")}
                >
                  <i className="fa fa-th-large me-2"></i> Grid
                </button>
                <button
                  type="button"
                  className={`btn view-toggle-btn border-0 ${viewMode === "list" ? "btn-primary text-white" : "text-secondary"}`}
                  onClick={() => setViewMode("list")}
                >
                  <i className="fa fa-list me-2"></i> List
                </button>
                <button
                  type="button"
                  className={`btn view-toggle-btn border-0 ${viewMode === "compact" ? "btn-primary text-white" : "text-secondary"}`}
                  onClick={() => setViewMode("compact")}
                >
                  <i className="fa fa-table me-2"></i> Compact
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {!jobs.length ? (
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body text-center py-5">
                <div className="display-4 text-muted mb-3">
                  <i className="fa fa-folder-open-o"></i>
                </div>
                <h4 className="fw-bold text-dark">No jobs found</h4>
                <p className="text-secondary mb-0">
                  Try changing your filters or check back again later.
                </p>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* GRID VIEW */
            <div className="row g-4">
              {jobs.map((job) => (
                <div className="col-12 col-md-6 col-xl-4" key={job.id}>
                  <div className="card h-100 job-card bg-white rounded-4 p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span className="badge-soft-primary">Job #{job.id}</span>
                      <span className="badge bg-light text-dark border">
                        <i className="fa fa-clock-o me-1"></i>{" "}
                        {Number(job.hours || 0)}h
                      </span>
                    </div>

                    <h4 className="fw-bold mb-3 text-dark">
                      Site #{job.site_id || "N/A"}
                    </h4>

                    <div className="d-flex flex-column gap-2 mb-4 text-secondary small">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="icon-box"
                          style={{ width: "28px", height: "28px" }}
                        >
                          <i className="fa fa-calendar"></i>
                        </div>
                        <span>
                          <strong>Starts:</strong> {formatDateTime(job.start)}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="icon-box"
                          style={{ width: "28px", height: "28px" }}
                        >
                          <i className="fa fa-flag-checkered"></i>
                        </div>
                        <span>
                          <strong>Ends:</strong> {formatDateTime(job.end)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                      <div className="d-flex flex-column">
                        <span
                          className="text-muted"
                          style={{
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                          }}
                        >
                          Status
                        </span>
                        <span className="fw-semibold small text-dark text-capitalize">
                          {job.job_status || "Pending"}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-primary rounded-pill px-3 btn-sm fw-semibold"
                        onClick={() => handleOpenModal(job)}
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === "list" ? (
            /* LIST VIEW */
            <div className="d-flex flex-column gap-3">
              {jobs.map((job) => (
                <div
                  className="card job-card bg-white rounded-4 p-4 border-0 shadow-sm"
                  key={job.id}
                >
                  <div className="row align-items-center g-3">
                    <div className="col-12 col-lg-4 d-flex align-items-center gap-3">
                      <div
                        className="icon-box"
                        style={{
                          width: "50px",
                          height: "50px",
                          fontSize: "1.2rem",
                        }}
                      >
                        <i className="fa fa-briefcase"></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1 text-dark">
                          Site #{job.site_id || "N/A"}
                        </h5>
                        <span className="badge-soft-primary d-inline-block">
                          Job #{job.id}
                        </span>
                      </div>
                    </div>

                    <div className="col-12 col-lg-5">
                      <div className="d-flex flex-column flex-sm-row gap-4 text-secondary small">
                        <div>
                          <div
                            className="text-muted mb-1"
                            style={{
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                            }}
                          >
                            Start Time
                          </div>
                          <div className="fw-medium text-dark">
                            <i className="fa fa-calendar text-primary me-1"></i>{" "}
                            {formatDateTime(job.start)}
                          </div>
                        </div>
                        <div>
                          <div
                            className="text-muted mb-1"
                            style={{
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                            }}
                          >
                            End Time
                          </div>
                          <div className="fw-medium text-dark">
                            <i className="fa fa-clock-o text-primary me-1"></i>{" "}
                            {formatDateTime(job.end)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-lg-3 d-flex flex-row flex-lg-column justify-content-between align-items-lg-end gap-2 border-start-lg ps-lg-4">
                      <div className="fw-bold text-dark text-end">
                        <span className="text-muted fw-normal small me-1">
                          Duration:
                        </span>
                        {Number(job.hours || 0)} hrs
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-primary rounded-pill px-4 btn-sm fw-semibold w-100 w-lg-auto"
                        onClick={() => handleOpenModal(job)}
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* COMPACT VIEW (TABLE) */
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-custom-header">
                    <tr>
                      <th scope="col" className="ps-4">
                        Job ID
                      </th>
                      <th scope="col">Site</th>
                      <th scope="col">Start Schedule</th>
                      <th scope="col">End Schedule</th>
                      <th scope="col">Duration</th>
                      <th scope="col" className="text-end pe-4">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {jobs.map((job) => (
                      <tr
                        key={job.id}
                        style={{ transition: "background-color 0.2s" }}
                      >
                        <td className="ps-4">
                          <span className="badge-soft-primary">#{job.id}</span>
                        </td>
                        <td className="fw-bold text-dark">
                          {job.site_id || "N/A"}
                        </td>
                        <td className="text-secondary small">
                          <i className="fa fa-calendar-o me-1"></i>{" "}
                          {formatDateTime(job.start)}
                        </td>
                        <td className="text-secondary small">
                          <i className="fa fa-clock-o me-1"></i>{" "}
                          {formatDateTime(job.end)}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {Number(job.hours || 0)}h
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button
                            type="button"
                            className="btn btn-outline-primary rounded-pill btn-sm px-3 fw-medium"
                            onClick={() => handleOpenModal(job)}
                          >
                            View Full Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div className="custom-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="custom-modal-header">
              <div>
                <h4 className="mb-0 fw-bold">Job Details</h4>
                <div className="text-muted small mt-1">
                  Job #{selectedJob.id} | Site #{selectedJob.site_id}
                </div>
              </div>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <div className="custom-modal-body">
              <div className="detail-group">
                <h6 className="text-primary fw-bold mb-3">
                  <i className="fa fa-calendar me-2"></i>Schedule & Timing
                </h6>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <span className="text-muted d-block small text-uppercase">
                      Start
                    </span>
                    <strong className="text-dark">
                      {formatDateTime(selectedJob.start)}
                    </strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block small text-uppercase">
                      End
                    </span>
                    <strong className="text-dark">
                      {formatDateTime(selectedJob.end)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="detail-group">
                <h6 className="text-primary fw-bold mb-3">
                  <i className="fa fa-clock-o me-2"></i>Hours Breakdown
                </h6>
                <div className="row g-3">
                  <div className="col-4 col-sm-3">
                    <span className="text-muted d-block small">Total</span>
                    <strong>{selectedJob.hours || 0}h</strong>
                  </div>
                  <div className="col-4 col-sm-3">
                    <span className="text-muted d-block small">Morning</span>
                    <strong>{selectedJob.morning_hours || 0}h</strong>
                  </div>
                  <div className="col-4 col-sm-3">
                    <span className="text-muted d-block small">Night</span>
                    <strong>{selectedJob.night_hours || 0}h</strong>
                  </div>
                </div>
              </div>

              <div className="detail-group mb-0">
                <h6 className="text-primary fw-bold mb-3">
                  <i className="fa fa-info-circle me-2"></i>Job Requirements &
                  Info
                </h6>
                <div className="row g-3">
                  <div className="col-sm-4">
                    <span className="text-muted d-block small">Status</span>
                    <span className="badge bg-secondary text-capitalize">
                      {selectedJob.job_status || "N/A"}
                    </span>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block small">
                      Shift Payable
                    </span>
                    <span className="text-dark fw-medium text-capitalize">
                      {selectedJob.shift_payable || "No"}
                    </span>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block small">
                      ASAP Required
                    </span>
                    <span
                      className={`fw-medium ${selectedJob.asap ? "text-danger" : "text-dark"}`}
                    >
                      {selectedJob.asap ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="custom-modal-footer">
              <button
                type="button"
                className="btn btn-secondary rounded-pill px-4"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
