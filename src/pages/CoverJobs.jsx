import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import useFetch from '../hooks/useFetch';
import useSubmit from '../hooks/useSubmit';
import Loader from '../components/Loader';

// Helper to display modal rows
const InfoRow = ({ label, value, icon, transform = true }) => {
    const displayValue =
        transform && value && typeof value === 'string'
            ? value.charAt(0).toUpperCase() + value.slice(1)
            : value;
    return (
        <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: '#f8f9fa' }}>
            <span className="text-muted d-flex align-items-center" style={{ fontSize: '14px', fontWeight: 500 }}>
                {icon && <i className={`fa-solid ${icon} me-2`} style={{ width: '18px', textAlign: 'center', color: '#0A7C6E', opacity: 0.8 }}></i>}
                {label}
            </span>
            <span className="text-dark fw-semibold text-end" style={{ fontSize: '14px', maxWidth: '60%' }}>
                {transform ? displayValue || 'N/A' : <span style={{ textTransform: 'none' }}>{value || 'N/A'}</span>}
            </span>
        </div>
    );
};

const CoverJobs = () => {
    const { userdata } = useSelector((state) => state.auth);
    const userId = userdata?.data?.id || userdata?.id;
    const userRole = userdata?.data?.user_type || userdata?.user_type;

    const staffContractorId = userRole === 'admin' ? 1 : userId;

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loadingIds, setLoadingIds] = useState([]);
    const [removedJobIds, setRemovedJobIds] = useState([]);
    const [selectedStaffId, setSelectedStaffId] = useState("");

    const { data, loading, error } = useFetch(
        `api/jobs/available/${staffContractorId}?page=${currentPage}`,
        { isAuth: true }
    );

    const { submit } = useSubmit({ isAuth: true });
    const { data: staffData, loading: staffLoading } = useFetch(
        userRole === 'contractor' && userId ? `api/get-contractor-active-staff/${userId}` : null,
        { isAuth: true, immediate: Boolean(userRole === 'contractor' && userId) }
    );

    const jobs = data?.data?.jobs?.data || [];
    const contractorStaffOptions = (staffData?.guards || []).map((staff) => ({
        value: String(staff.id),
        label: staff.name || 'Unnamed staff',
    }));
    const visibleJobs = useMemo(
        () => jobs.filter((job) => !removedJobIds.includes(job.id)),
        [jobs, removedJobIds]
    );

    const paginationLinks = data?.data?.jobs?.links || [];
    const totalJobs = data?.data?.jobs?.total || 0;

    useEffect(() => {
        if (selectedJob && removedJobIds.includes(selectedJob.id)) {
            setSelectedJob(null);
        }
    }, [removedJobIds, selectedJob]);

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const handlePageChange = (url) => {
        if (!url) return;
        const pageMatch = url.match(/page=(\d+)/);
        if (pageMatch) setCurrentPage(Number(pageMatch[1]));
    };

    const openModal = (job) => {
        setSelectedStaffId("");
        setSelectedJob(job);
    };
    const closeModal = () => {
        setSelectedStaffId("");
        setSelectedJob(null);
    };

    const getAcceptEndpoint = () => {
        if (userRole === 'staff') {
            return `api/asap-jobs/accept/${userId}`;
        }
        return `api/contractor/jobs/accept/${userId}`;
    };

    const handleAcceptJob = async (jobId) => {
        setLoadingIds((prev) => [...prev, jobId]);
        try {
            const payload = selectedStaffId
                ? { roster_id: jobId, guard_id: Number(selectedStaffId) }
                : { roster_id: jobId };
            const endpoint = getAcceptEndpoint();
            const result = await submit(
                endpoint,
                payload,
                { method: 'POST' }
            );

            if (result && !result.error) {
                setRemovedJobIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
                toast.success(selectedStaffId ? 'Job assigned successfully!' : (userRole === 'staff' ? 'Cover job accepted successfully!' : 'Job accepted successfully!'));
                closeModal();
            }
        } catch (err) {
            console.error('Accept job failed:', err);
        } finally {
            setLoadingIds((prev) => prev.filter((id) => id !== jobId));
        }
    };

    const renderJobCard = (job) => {
        const isProcessing = loadingIds.includes(job.id);
        return (
            <div className="col" key={job.id}>
                <div className="card h-100 border-0 shadow-sm job-card-hover" style={{ borderRadius: '16px' }}>
                    <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <span
                                className={`badge rounded-pill px-3 py-2 fw-medium ${job.job_status === 'pending'
                                    ? 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25'
                                    : 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25'
                                    }`}
                                style={{ fontSize: '12px', textTransform: 'capitalize' }}
                            >
                                <i className="fa-solid fa-hourglass-half me-1"></i>
                                {job.job_status || 'pending'}
                            </span>
                            <div className="text-muted text-end" style={{ fontSize: '11px', fontWeight: 600 }}>
                                <i className="fa-regular fa-clock me-1"></i>
                                Added: {new Date(job.created_at || Date.now()).toLocaleDateString()}
                            </div>
                        </div>

                        <h5 className="card-title fw-bold text-dark mb-2" style={{ fontSize: '1.15rem' }}>
                            {job.site_name || job.siteName || 'Untitled Shift'}
                        </h5>
                        <p className="card-text text-muted mb-3 d-flex align-items-start" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                            <i className="fa-solid fa-location-dot mt-1 me-2 text-primary" style={{ opacity: 0.8 }}></i>
                            {job.site_address || job.address || 'Address not available'}
                        </p>

                        <div className="mt-auto">
                            <div className="d-flex align-items-center mb-4 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '32px', height: '32px', backgroundColor: '#e0f2fe', color: '#0ea5e9' }}>
                                    <i className="fa-solid fa-calendar-day"></i>
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fw-semibold text-dark" style={{ fontSize: '12px' }}>
                                        {formatDateTime(job.start_time || job.startTime)}
                                    </span>
                                    <span className="text-muted" style={{ fontSize: '12px' }}>
                                        To: {formatDateTime(job.end_time || job.endTime)}
                                    </span>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ borderColor: '#f8f9fa' }}>
                                <div className="d-flex flex-column">
                                    <span className="text-muted mb-1" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>State</span>
                                    <span className="fw-bold text-dark" style={{ fontSize: '13px', textTransform: 'capitalize' }}>{job.state || 'N/A'}</span>
                                </div>
                                <button
                                    className="btn rounded-pill fw-semibold d-flex align-items-center justify-content-center"
                                    style={{
                                        backgroundColor: '#0A7C6E',
                                        color: 'white',
                                        border: 'none',
                                        height: '36px',
                                        fontSize: '12px',
                                        minWidth: '100px',
                                    }}
                                    onClick={() => openModal(job)}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <i className="fa-solid fa-check me-1"></i>
                                    )}
                                    Accept
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <Loader />;
    if (error) return <div className="alert alert-danger mx-3 mt-3">Error: {error.message}</div>;

    return (
        <>
            <style>
                {`
                    .job-card-hover {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .job-card-hover:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                    }
                    .pagination .page-item.active .page-link {
                        background-color: #0A7C6E;
                        border-color: #0A7C6E;
                        color: white;
                    }
                    .pagination .page-link {
                        color: #0A7C6E;
                        border-radius: 8px;
                        margin: 0 4px;
                        border: 1px solid #e2e8f0;
                    }
                    .pagination .page-item.disabled .page-link {
                        color: #94a3b8;
                        background-color: #f8fafc;
                        border-color: #e2e8f0;
                    }
                    @media (max-width: 767.98px) {
                        .dashboard-page-header h1 { font-size: 1.5rem; }
                        .job-card-hover .btn { font-size: 12px; padding: 0.35rem 0.75rem; }
                        .modal-content {
                            width: 100% !important; max-width: 100% !important;
                            height: 100vh; max-height: 100vh; border-radius: 0 !important;
                        }
                    }
                `}
            </style>

            <div className="dashboard-main p-4">
                <div className="dashboard-page-header mb-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="fw-bold mb-1">Cover Jobs</h1>
                        <p className="text-muted mb-0">
                            Showing {visibleJobs.length} available shifts
                        </p>
                    </div>
                </div>

                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 application-grid">
                    {visibleJobs.length === 0 ? (
                        <div className="col-12 text-center py-5 text-muted bg-light rounded shadow-sm w-100">
                            <i className="fa-solid fa-briefcase mb-3 d-block" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                            No cover jobs available at the moment.
                        </div>
                    ) : (
                        visibleJobs.map((job) => renderJobCard(job))
                    )}
                </div>

                {paginationLinks.length > 3 && (
                    <nav className="d-flex justify-content-center mt-5">
                        <ul className="pagination shadow-sm rounded-pill p-2 bg-white">
                            {paginationLinks.map((link, index) => (
                                <li key={index} className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link border-0 shadow-none bg-transparent"
                                        style={{ fontWeight: link.active ? 'bold' : 'normal' }}
                                        onClick={() => handlePageChange(link.url)}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </div>

            {selectedJob && (
                <div className="modal-overlay" onClick={closeModal} style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="modal-content shadow-lg border-0" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', background: '#f8fafc', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div className="modal-header d-flex justify-content-between align-items-center" style={{ background: '#0A7C6E', color: '#fff', padding: '20px 24px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                                <i className="fa-solid fa-clipboard-check me-2 opacity-75"></i> Job Details
                            </h3>
                            <button onClick={closeModal} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px' }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                                        <h5 className="mb-4 d-flex align-items-center pb-3 border-bottom" style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '36px', height: '36px', background: '#e0f2fe', color: '#0ea5e9' }}>
                                                <i className="fa-solid fa-building"></i>
                                            </div>
                                            Location Info
                                        </h5>
                                        <div className="d-flex flex-column gap-1">
                                            <InfoRow icon="fa-signature" label="Site Name" value={selectedJob.site_name || selectedJob.siteName} />
                                            <InfoRow icon="fa-map-pin" label="Address" value={selectedJob.site_address || selectedJob.address} transform={false} />
                                            <InfoRow icon="fa-map" label="State" value={selectedJob.state} />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="p-4 bg-white rounded-4 h-100 shadow-sm border border-light">
                                        <h5 className="mb-4 d-flex align-items-center pb-3 border-bottom" style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '36px', height: '36px', background: '#fef3c7', color: '#d97706' }}>
                                                <i className="fa-solid fa-clock-rotate-left"></i>
                                            </div>
                                            Shift Info
                                        </h5>
                                        <div className="d-flex flex-column gap-1">
                                            <InfoRow icon="fa-circle-info" label="Status" value={selectedJob.job_status} />
                                            <InfoRow icon="fa-play" label="Start Time" value={formatDateTime(selectedJob.start_time || selectedJob.startTime)} transform={false} />
                                            <InfoRow icon="fa-stop" label="End Time" value={formatDateTime(selectedJob.end_time || selectedJob.endTime)} transform={false} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ background: '#fff', padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {userRole === 'contractor' && (
                                <div className="w-100">
                                    <label className="form-label fw-semibold" style={{ fontSize: '13px', color: '#334155' }}>Assign to active staff (optional)</label>
                                    <select
                                        className="form-select"
                                        value={selectedStaffId}
                                        onChange={(e) => setSelectedStaffId(e.target.value)}
                                        disabled={staffLoading}
                                    >
                                        <option value="">Accept directly for myself</option>
                                        {contractorStaffOptions.map((staff) => (
                                            <option key={staff.value} value={staff.value}>{staff.label}</option>
                                        ))}
                                    </select>
                                    <div className="text-muted mt-2" style={{ fontSize: '12px' }}>Leave this empty to accept the job directly.</div>
                                </div>
                            )}
                            <div className="d-flex gap-2 ms-auto">
                                <button
                                    className="btn btn-success rounded-pill px-4 fw-semibold shadow-sm"
                                    onClick={() => handleAcceptJob(selectedJob.id)}
                                    disabled={loadingIds.includes(selectedJob.id)}
                                >
                                    {loadingIds.includes(selectedJob.id) ? (
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <i className="fa-solid fa-check me-2"></i>
                                    )}
                                    {selectedStaffId ? 'Confirm Assign' : 'Confirm Accept'}
                                </button>
                                <button onClick={closeModal} className="btn btn-outline-secondary rounded-pill px-4 fw-semibold shadow-sm">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CoverJobs;