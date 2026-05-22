import React, { useMemo } from 'react'
import "../../styles/staffoo.css"
import { Link } from 'react-router-dom'
import useFetch from '../../hooks/useFetch'
import useScrollReveal from '../../hooks/useScrollReveal'

// ── Helpers outside component (stable references, no stale closures) ──────────

function formatDate(value) {
  if (!value) return "-";
  const normalized = String(value).replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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

function mapJobToCard(job, index) {
  const status = String(job?.job_status || "pending").toLowerCase();
  const badgeClass =
    status === "completed"
      ? "fulltime"
      : status === "assigned"
        ? "freelance"
        : "parttime";

  return {
    id: job?.id || `job-${index}`,
    type: status.charAt(0).toUpperCase() + status.slice(1),
    badgeClass,
    title: `Job #${job?.id || "N/A"}`,
    company: `Site #${job?.site_id || "N/A"}`,
    schedule: `${formatDateTime(job?.start)} - ${formatDateTime(job?.end)}`,
    hours: Number(job?.hours || 0),
    posted: formatDate(job?.updated_at || job?.created_at || job?.start),
    raw: job,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

function Jobs() {
  const { data: jobsResponse, loading, error } = useFetch("api/get-all-jobs");
  
  // Trigger scroll reveal animations
  useScrollReveal();

  const latestJobs = useMemo(() => {
    const jobs = Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];
    return jobs.slice(0, 3).map((job, index) => mapJobToCard(job, index));
  }, [jobsResponse]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="jobs-sec">
        <div className="sec-head">
          <div className="sec-head-left">
            <div className="label">Discover Opportunities</div>
            <h2>Latest Jobs</h2>
          </div>
        </div>
        <div className="jobs-grid" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--off)' }}>Loading jobs...</p>
        </div>
      </section>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <section className="jobs-sec">
        <div className="sec-head">
          <div className="sec-head-left">
            <div className="label">Discover Opportunities</div>
            <h2>Latest Jobs</h2>
          </div>
        </div>
        <div className="jobs-grid" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--red)' }}>Error loading jobs. Please try again later.</p>
        </div>
      </section>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div>
      <section className="jobs-sec">
        <div className="sec-head">
          <div className="sec-head-left">
            <div className="label">Discover Opportunities</div>
            <h2>Latest Jobs</h2>
          </div>
          <Link to="/" className="btn-ghost-sm">View All Jobs →</Link>
        </div>

        <div className="jobs-grid">
          {latestJobs.length > 0 ? (
            latestJobs.map((job, index) => (
              <div
                key={job.id}
                className={`job-card reveal ${
                  index === 1 ? 'reveal-d1' : index === 2 ? 'reveal-d2' : ''
                }`}
              >
                <div className="step-border-top"></div>
                <div className="jc-top">
                  <span className="jc-id">{job.type.toUpperCase()}</span>
                  <span className={`tag ${job.badgeClass === 'fulltime' ? 'tag-green' : ''}`}>
                    {job.badgeClass}
                  </span>
                </div>
                <div className="jc-title">{job.title}</div>
                <div className="jc-meta">
                  <div className="jc-row"><span className="jc-icon">◈</span> {job.company}</div>
                  <div className="jc-row"><span className="jc-icon">◈</span> {job.schedule}</div>
                </div>
                <div className="jc-pay">${job.hours}h</div>
                <button className="jc-btn">View Details</button>
              </div>
            ))
          ) : (
            <div
              className="job-card reveal"
              style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}
            >
              <div className="jc-title">No jobs available</div>
            </div>
          )}
        </div>

        <div className="jobs-footer">
          <Link to="/" className="btn-amber-sm">View All Latest Jobs</Link>
        </div>
      </section>
    </div>
  );
}

export default Jobs