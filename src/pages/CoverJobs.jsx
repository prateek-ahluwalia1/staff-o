import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { toast } from 'react-toastify';
import useFetch from '../hooks/useFetch';
import useSubmit from '../hooks/useSubmit';
import Loader from '../components/Loader';
import confetti from 'canvas-confetti';

const InfoRow = ({ label, value, icon, transform = true }) => {
    const displayValue =
        transform && value && typeof value === 'string'
            ? value.charAt(0).toUpperCase() + value.slice(1)
            : value;
    return (
        <div className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: '#f1f5f9' }}>
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

const getPageNumbers = (currentPage, totalPages) => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
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
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const { data, loading, error } = useFetch(
        `api/jobs/available/${staffContractorId}?page=${currentPage}`,
        { isAuth: true }
    );

    const { submit } = useSubmit({ isAuth: true });
    const { data: staffData, loading: staffLoading } = useFetch(
        userRole === 'contractor' && userId ? `api/get-contractor-active-staff/${userId}` : null,
        { isAuth: true, immediate: Boolean(userRole === 'contractor' && userId) }
    );

    // --- UPDATED DATA EXTRACTION for new response structure ---
    const jobs = data?.data?.jobs?.data || [];
    const totalJobs = data?.data?.jobs?.total || 0;
    const lastPage = data?.data?.jobs?.last_page || 1;

    const contractorStaffOptions = (staffData?.guards || []).map((staff) => ({
        value: String(staff.id),
        label: staff.name || 'Unnamed staff',
    }));
    const visibleJobs = useMemo(() => jobs.filter((job) => !removedJobIds.includes(job.id)), [jobs, removedJobIds]);

    useEffect(() => {
        if (selectedJob && removedJobIds.includes(selectedJob.id)) setSelectedJob(null);
    }, [removedJobIds, selectedJob]);

    const successAudio = new Audio('/sounds/notification.wav');

    // Date / time helpers
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '--:--';
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const isSameDay = (d1, d2) => {
        if (!d1 || !d2) return false;
        const date1 = new Date(d1);
        const date2 = new Date(d2);
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const calculateHours = (start, end) => {
        if (!start || !end) return null;
        const ms = new Date(end) - new Date(start);
        if (ms <= 0) return null;
        const hrs = ms / (1000 * 60 * 60);
        return Math.round(hrs * 10) / 10;
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > lastPage || page === currentPage) return;
        setCurrentPage(page);
    };

    const openModal = (job) => {
        // Clear staff selection when opening a new job.
        // If contractor_invoice is 0, we won't show the dropdown at all.
        setSelectedStaffId("");
        let documents = [];
        try {
            if (job.document_list) {
                const parsed = JSON.parse(job.document_list);
                if (Array.isArray(parsed)) documents = parsed.map(doc => doc.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
            }
        } catch (e) { }
        setSelectedJob({ ...job, documents });
    };
    const closeModal = () => { setSelectedStaffId(""); setSelectedJob(null); };

    const getAcceptEndpoint = () => {
        if (userRole === 'staff') return `api/asap-jobs/accept/${userId}`;
        return `api/contractor/jobs/accept/${userId}`;
    };

    const handleAcceptJob = async (jobId) => {
        setLoadingIds(prev => [...prev, jobId]);
        try {
            // Only include guard_id if contractor_invoice !== 0 and a staff is selected
            const includeGuardId = selectedJob?.contractor_invoice === 1 && selectedStaffId;
            const payload = includeGuardId
                ? { roster_id: jobId, guard_id: Number(selectedStaffId) }
                : { roster_id: jobId };

            const endpoint = getAcceptEndpoint();
            const result = await submit(endpoint, payload, { method: 'POST' });
            if (result && !result.error) {
                setRemovedJobIds(prev => (prev.includes(jobId) ? prev : [...prev, jobId]));
                closeModal();
                if (selectedJob?.contractor_invoice === 0) {
                    setSuccessMessage('Please wait for the client to give further confirmation. We will notify you shortly and the job will appear on your Roster page.');
                    setShowSuccessPopup(true);
                } else {
                    toast.success(
                        includeGuardId
                            ? '🎉 Job assigned successfully!'
                            : '🎉 Cover job accepted! You are all set.'
                    );
                }

                // 🎊 Confetti + sound celebration
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#0A7C6E', '#d97706', '#16a34a', '#fbbf24'],
                });
                setTimeout(() => {
                    confetti({
                        particleCount: 80,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                    });
                    confetti({
                        particleCount: 80,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                    });
                }, 200);

                // 🔊 Play local success sound
                successAudio.play().catch(() => { });
            }
        } catch (err) {
            console.error('Accept job failed:', err);
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== jobId));
        }
    };

    const pageNumbers = useMemo(() => getPageNumbers(currentPage, lastPage), [currentPage, lastPage]);

    if (loading) return <Loader />;
    if (error) return <div className="alert alert-danger m-3">Error: {error.message}</div>;

    return (
        <>
            <style>{`
                :root {
                    --navy-950: #0a1930;
                    --navy-900: #0e2340;
                    --teal: #0A7C6E;
                    --teal-dark: #075e53;
                    --teal-tint: #f0fdf9;
                    --teal-border: #d1fae5;
                    --amber: #d97706;
                    --success: #16a34a;
                    --danger: #dc2626;
                    --ink: #0f172a;
                    --slate: #1e293b;
                    --muted: #64748b;
                    --faint: #94a3b8;
                    --line: #e2e8f0;
                    --line-soft: #f1f5f9;
                    --surface: #ffffff;
                    --canvas: #f8fafc;
                }

                .cover-jobs-page { min-height: 100vh; }

                .cover-hero {
                    position: relative;
                    background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
                    border-radius: 22px;
                    padding: 34px 36px 46px;
                    overflow: hidden;
                    isolation: isolate;
                    margin-bottom: 2rem;
                }
                .cover-hero::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
                    background-size: 22px 22px;
                    opacity: 0.35;
                    z-index: -1;
                }
                .cover-hero::after {
                    content: "";
                    position: absolute;
                    top: -60px;
                    right: -60px;
                    width: 260px;
                    height: 260px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(10,124,110,0.45) 0%, rgba(10,124,110,0) 70%);
                    z-index: -1;
                }
                .cover-hero-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.6px;
                    text-transform: uppercase;
                    color: #6ee7d8;
                    margin-bottom: 10px;
                }
                .cover-hero-eyebrow .dot {
                    width: 7px; height: 7px; border-radius: 50%;
                    background: #34d399;
                    box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
                }
                .cover-hero h1 {
                    color: #fff;
                    font-size: 28px;
                    font-weight: 800;
                    letter-spacing: -0.4px;
                    margin: 0 0 6px;
                }
                .cover-hero p {
                    color: rgba(255,255,255,0.62);
                    font-size: 14px;
                    margin: 0;
                    text-transform: none;
                }

                .cover-card {
                    border-radius: 18px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid var(--line-soft);
                    background: #fff;
                }
                .cover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 35px -10px rgba(15, 23, 42, 0.14), 0 8px 14px -8px rgba(15,23,42,0.08);
                    border-color: transparent;
                }
                .card-accent-bar {
                    position: absolute; top: 0; left: 0; right: 0; height: 4px;
                    border-radius: 18px 18px 0 0;
                    background: linear-gradient(90deg, #d97706, #f59e0b);
                }

                .status-badge {
                    font-size: 11.5px; font-weight: 700; border-radius: 30px; padding: 5px 13px;
                    text-transform: capitalize; display: inline-flex; align-items: center; gap: 6px;
                    letter-spacing: 0.2px;
                }

                .shift-meta-row {
                    background: var(--teal-tint);
                    border: 1px solid var(--teal-border);
                    border-radius: 12px;
                    padding: 12px 14px;
                    display: flex;
                    align-items: center;
                    margin: 14px 0 2px;
                }
                .shift-meta-item {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    flex: 1;
                    min-width: 0;
                }
                .shift-meta-item + .shift-meta-item {
                    border-left: 1px solid var(--teal-border);
                    padding-left: 12px;
                    margin-left: 12px;
                }
                .shift-meta-label {
                    font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
                    color: var(--teal-dark); opacity: 0.75; display: flex; align-items: center; gap: 4px;
                }
                .shift-meta-label i { font-size: 9.5px; }
                .shift-meta-value {
                    font-size: 13.5px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }
                .shift-meta-item.hours-meta { flex: 0 0 auto; align-items: flex-end; }

                .accept-btn {
                    border-radius: 30px !important;
                    padding: 8px 16px !important;
                    font-size: 12.5px !important;
                    font-weight: 700 !important;
                    height: 36px;
                    background: var(--teal) !important;
                    border-color: var(--teal) !important;
                    box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4);
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                .accept-btn:hover { transform: translateX(1px); box-shadow: 0 6px 14px -2px rgba(10,124,110,0.45); }

                .page-btn {
                    width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--line); background: #fff;
                    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13.5px;
                    color: var(--slate); transition: all 0.15s;
                }
                .page-btn:hover { background: var(--line-soft); border-color: #cbd5e1; }
                .page-btn.active { background: var(--teal); color: #fff; border-color: var(--teal); box-shadow: 0 4px 10px -2px rgba(10,124,110,0.4); }
                .page-btn:disabled { opacity: 0.45; pointer-events: none; }
                .page-btn.ellipsis { border: none; background: transparent; cursor: default; pointer-events: none; }

                .modal-overlay { backdrop-filter: blur(2px); }
                .modal-header-custom {
                    background: linear-gradient(120deg, var(--navy-950), var(--navy-900) 70%, #10345a);
                    position: relative;
                    overflow: hidden;
                }
                .modal-header-custom::after {
                    content: ""; position: absolute; top: -40px; right: -40px; width: 160px; height: 160px;
                    border-radius: 50%; background: radial-gradient(circle, rgba(10,124,110,0.5), transparent 70%);
                }
                .modal-close-btn {
                    background: rgba(255,255,255,0.14); border: none; color: #fff; border-radius: 50%;
                    width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
                    transition: background 0.15s; position: relative; z-index: 1;
                }
                .modal-close-btn:hover { background: rgba(255,255,255,0.26); }

                @media (max-width: 767.98px) {
                    .cover-hero { padding: 26px 20px 40px; border-radius: 18px; }
                    .cover-hero h1 { font-size: 22px; }
                }
            `}</style>

            <div className="dashboard-main cover-jobs-page px-3 px-md-4">
                <div className="cover-hero">
                    <span className="cover-hero-eyebrow">
                        <span className="dot"></span> Available
                    </span>
                    <h1>Cover Jobs</h1>
                    <p>{totalJobs} open job{totalJobs !== 1 ? 's' : ''} waiting for you</p>
                </div>

                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
                    {visibleJobs.length === 0 ? (
                        <div className="col-12">
                            <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light ">
                                <i className="fa-solid fa-briefcase mb-3 d-block" style={{ fontSize: '2.5rem', color: '#94a3b8' }}></i>
                                <h5 className="text-muted">No cover jobs available</h5>
                                <p className="text-muted small" style={{ textTransform: 'none' }}>Check back later for new jobs.</p>
                            </div>
                        </div>
                    ) : (
                        visibleJobs.map((job) => {
                            const isProcessing = loadingIds.includes(job.id);
                            const startDt = job.start_time || job.startTime;
                            const endDt = job.end_time || job.endTime;
                            const sameDay = isSameDay(startDt, endDt);
                            const dateDisplay = sameDay
                                ? formatDate(startDt)
                                : `${formatDate(startDt)} – ${formatDate(endDt)}`;
                            const timeWindow = startDt && endDt
                                ? `${formatTime(startDt)} – ${formatTime(endDt)}`
                                : 'Time not available';
                            const totalHours = calculateHours(startDt, endDt);
                            const hoursDisplay = totalHours !== null
                                ? `${totalHours} ${totalHours === 1 ? 'hr' : 'hrs'}`
                                : 'N/A';

                            return (
                                <div className="col" key={job.id}>
                                    <div className="card h-100 border-0 shadow-sm cover-card position-relative overflow-hidden">
                                        <div className="card-accent-bar"></div>
                                        <div className="card-body p-4 pt-4 d-flex flex-column">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <span className="status-badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25">
                                                    <i className="fa-solid fa-hourglass-half"></i>
                                                    {job.job_status || 'pending'}
                                                </span>
                                                <div className="text-muted text-end" style={{ fontSize: '11px', fontWeight: 600 }}>
                                                    <i className="fa-regular fa-clock me-1"></i>
                                                    {new Date(job.created_at || Date.now()).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>

                                            <h5 className="fw-bold mb-2" style={{ color: '#0f172a', letterSpacing: '-0.3px' }}>
                                                {job.site_name || job.siteName || 'Untitled Job'}
                                            </h5>
                                            <p className="text-muted mb-3 d-flex align-items-start" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                                <i className="fa-solid fa-location-dot mt-1 me-2" style={{ color: '#0A7C6E', opacity: 0.8, minWidth: '14px' }}></i>
                                                {job.site_address || job.address || 'Address not available'}
                                            </p>

                                            <div className="shift-meta-row mt-auto mb-3">
                                                <div className="shift-meta-item">
                                                    <span className="shift-meta-label">
                                                        <i className="fa-regular fa-calendar-days"></i> Date
                                                    </span>
                                                    <span className="shift-meta-value">{dateDisplay}</span>
                                                </div>
                                                <div className="shift-meta-item">
                                                    <span className="shift-meta-label">
                                                        <i className="fa-regular fa-clock"></i> Time
                                                    </span>
                                                    <span className="shift-meta-value">{timeWindow}</span>
                                                </div>
                                                <div className="shift-meta-item hours-meta">
                                                    <span className="shift-meta-label">
                                                        <i className="fa-solid fa-hourglass-half"></i> Hours
                                                    </span>
                                                    <span className="shift-meta-value">{hoursDisplay}</span>
                                                </div>
                                            </div>

                                            <div
                                                className="d-flex justify-content-between align-items-center pt-3 border-top"
                                                style={{ borderColor: '#f1f5f9' }}
                                            >
                                                <button
                                                    className="btn accept-btn d-flex align-items-center justify-content-center gap-1 text-white w-100"
                                                    onClick={() => openModal(job)}
                                                    disabled={isProcessing}
                                                >
                                                    {isProcessing ? (
                                                        <span
                                                            className="spinner-border spinner-border-sm me-1"
                                                            role="status"
                                                        ></span>
                                                    ) : (
                                                        <i className="fa-solid fa-check"></i>
                                                    )}
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {lastPage > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
                        <button className="page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        {pageNumbers.map((page, idx) =>
                            page === '...' ? (
                                <span key={`ellipsis-${idx}`} className="page-btn ellipsis">…</span>
                            ) : (
                                <button key={page} className={`page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => handlePageChange(page)}>
                                    {page}
                                </button>
                            )
                        )}
                        <button className="page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === lastPage}>
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedJob && (
                <div
                    className="modal-overlay"
                    onClick={closeModal}
                    style={{ zIndex: 9999, backgroundColor: 'rgba(10,20,35,0.62)', position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                >
                    <div
                        className="modal-content border-0"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '750px',
                            maxHeight: '90vh',
                            background: '#f8fafc',
                            borderRadius: '18px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: '0 30px 60px -18px rgba(10,25,48,0.4)',
                        }}
                    >
                        <div className="modal-header-custom d-flex justify-content-between align-items-center" style={{ padding: '20px 24px' }}>
                            <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '700', color: '#fff', position: 'relative', zIndex: 1 }}>
                                <i className="fa-solid fa-clipboard-check me-2 opacity-75"></i> Job Details
                            </h3>
                            <button onClick={closeModal} className="modal-close-btn">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="p-4 bg-white rounded-4 shadow-sm border border-light">
                                        <h5 className="fw-bold d-flex align-items-center mb-3 pb-2 border-bottom" style={{ fontSize: '16px', color: '#1e293b' }}>
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '36px', height: '36px', background: '#e0f2fe', color: '#0ea5e9' }}>
                                                <i className="fa-solid fa-building"></i>
                                            </div>
                                            Location Info
                                        </h5>
                                        <InfoRow icon="fa-signature" label="Site Name" value={selectedJob.site_name || selectedJob.siteName} />
                                        <InfoRow icon="fa-map-pin" label="Address" value={selectedJob.site_address || selectedJob.address} transform={false} />
                                        <InfoRow icon="fa-map" label="State" value={selectedJob.state} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-4 bg-white rounded-4 shadow-sm border border-light">
                                        <h5 className="fw-bold d-flex align-items-center mb-3 pb-2 border-bottom" style={{ fontSize: '16px', color: '#1e293b' }}>
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '36px', height: '36px', background: '#fef3c7', color: '#d97706' }}>
                                                <i className="fa-solid fa-clock-rotate-left"></i>
                                            </div>
                                            Job Info
                                        </h5>
                                        <InfoRow icon="fa-circle-info" label="Status" value={selectedJob.job_status} />
                                        <InfoRow icon="fa-play" label="Start Time" value={formatDateTime(selectedJob.start_time || selectedJob.startTime)} transform={false} />
                                        <InfoRow icon="fa-stop" label="End Time" value={formatDateTime(selectedJob.end_time || selectedJob.endTime)} transform={false} />
                                    </div>
                                </div>
                            </div>
                            {/* Description & Required Documents – side by side when both exist */}
                            {(selectedJob.description || (selectedJob.documents && selectedJob.documents.length > 0)) && (
                                <div className="row g-4 mt-1">
                                    {selectedJob.description && (
                                        <div className={selectedJob.documents && selectedJob.documents.length > 0 ? "col-md-6" : "col-12"}>
                                            <div className="p-4 bg-white rounded-4 shadow-sm border border-light h-100">
                                                <h5 className="fw-bold d-flex align-items-center mb-3 pb-2 border-bottom" style={{ fontSize: '16px', color: '#1e293b' }}>
                                                    <i className="fa-solid fa-align-left me-2" style={{ color: '#0A7C6E' }}></i>
                                                    Description
                                                </h5>
                                                <p className="mb-0" style={{ fontSize: '14px', color: '#334155', textTransform: 'none', lineHeight: '1.6' }}>
                                                    {selectedJob.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedJob.documents && selectedJob.documents.length > 0 && (
                                        <div className={selectedJob.description ? "col-md-6" : "col-12"}>
                                            <div className="p-4 bg-white rounded-4 shadow-sm border border-light h-100">
                                                <h5 className="fw-bold d-flex align-items-center mb-3 pb-2 border-bottom" style={{ fontSize: '16px', color: '#1e293b' }}>
                                                    <i className="fa-solid fa-file-lines me-2" style={{ color: '#0A7C6E' }}></i>
                                                    Required Documents
                                                </h5>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {selectedJob.documents.map((doc) => (
                                                        <span key={doc} className="badge rounded-pill px-3 py-2" style={{ backgroundColor: 'rgba(10, 124, 110, 0.1)', color: '#0A7C6E', border: '1px solid rgba(10, 124, 110, 0.3)', fontSize: '12px', fontWeight: 700 }}>
                                                            {doc}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="modal-footer" style={{ background: '#fff', padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Show assign-to-staff only when contractor_invoice is not 0 */}
                            {userRole === 'contractor' && selectedJob.contractor_invoice === 1 && (
                                <div className="w-100">
                                    <label className="form-label fw-semibold" style={{ fontSize: '13px', color: '#334155' }}>Assign to staff</label>
                                    <Select
                                        className="react-select-container"
                                        options={[{ value: '', label: 'Select staff' }, ...contractorStaffOptions]}
                                        value={
                                            contractorStaffOptions.find(o => o.value === selectedStaffId)
                                                ? contractorStaffOptions.find(o => o.value === selectedStaffId)
                                                : { value: '', label: 'Select staff' }
                                        }
                                        onChange={(option) => setSelectedStaffId(option?.value || '')}
                                        isLoading={staffLoading}
                                        isClearable={false}
                                        classNamePrefix="react-select"
                                        placeholder="Select staff"
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        styles={{
                                            control: (base) => ({ ...base, borderRadius: 10, borderColor: '#cbd5e1', boxShadow: 'none', minHeight: 44 }),
                                            menuPortal: (base) => ({ ...base, zIndex: 99999 }),
                                        }}
                                    />
                                    <div className="text-muted mt-2" style={{ fontSize: '12px' }}>Leave this blank to accept the job immediately. You can assign it to the roster later.</div>
                                </div>
                            )}
                            <div className="d-flex gap-2 ms-auto">
                                <button
                                    className="btn accept-btn text-white rounded-pill px-4 fw-semibold shadow-sm"
                                    onClick={() => handleAcceptJob(selectedJob.id)}
                                    disabled={loadingIds.includes(selectedJob.id)}
                                >
                                    {loadingIds.includes(selectedJob.id) ? (
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    ) : (
                                        <i className="fa-solid fa-check me-2"></i>
                                    )}
                                    {/* Button text depends on contractor_invoice and selected staff */}
                                    {selectedJob.contractor_invoice === 0
                                        ? 'Accept'
                                        : selectedStaffId
                                            ? 'Assign'
                                            : 'Accept'
                                    }
                                </button>
                                <button onClick={closeModal} className="btn btn-outline-secondary rounded-pill px-4 fw-semibold shadow-sm">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Popup */}
            {showSuccessPopup && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(10, 25, 47, 0.75)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                    }}
                    onClick={() => setShowSuccessPopup(false)}
                >
                    <div
                        className="modal-content-premium position-relative"
                        style={{
                            background: '#fff', borderRadius: '28px', width: '90%', maxWidth: '420px',
                            boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.4)', overflow: 'hidden',
                            animation: 'modalSlideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Premium Header Decoration */}
                        <div style={{
                            background: 'linear-gradient(135deg, #0A7C6E 0%, #0d9685 100%)',
                            height: '110px', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0,
                        }}>
                            <svg width="100%" height="100%" style={{ opacity: 0.1 }}>
                                <defs>
                                    <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                                        <line x1="0" y1="0" x2="0" y2="10" stroke="#ffffff" strokeWidth="2" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#diagonalHatch)" />
                            </svg>
                        </div>

                        <div className="text-center position-relative" style={{ zIndex: 1, padding: '60px 32px 36px' }}>
                            {/* Icon Wrapper */}
                            <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{
                                width: '84px', height: '84px', borderRadius: '50%',
                                background: '#fff', padding: '8px',
                                boxShadow: '0 8px 24px rgba(10, 124, 110, 0.25)'
                            }}>
                                <div style={{
                                    width: '100%', height: '100%', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #0A7C6E 0%, #16a34a 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className="fa-solid fa-check text-white" style={{ fontSize: '32px' }}></i>
                                </div>
                            </div>

                            <h3 className="fw-bolder mb-2" style={{ color: '#0a1930', letterSpacing: '-0.5px' }}>Success!</h3>
                            <p className="text-muted mb-4" style={{ fontSize: '15.5px', lineHeight: '1.5' }}>
                                {successMessage}
                            </p>

                            <button
                                className="btn w-100 rounded-pill text-white fw-bold py-3 shadow"
                                style={{
                                    background: 'linear-gradient(135deg, #0A7C6E 0%, #086b5e 100%)',
                                    fontSize: '15px', border: 'none', transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(10, 124, 110, 0.4)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.15)'; }}
                                onClick={() => setShowSuccessPopup(false)}
                            >
                                <i className="fa-solid fa-thumbs-up me-2"></i> Awesome, Thanks!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CoverJobs;