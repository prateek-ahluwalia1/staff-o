import React, { useMemo } from "react";
import Select from "react-select";
import { apiURL } from "../../utils/exports";
import { Link } from 'react-router-dom';

export default function AdminClientProfile({
    customerDetails,
    customerTotalHours,
    siteOptions,
    selectedSiteId,
    onSiteSelect,
    loadingSites
}) {
    const initials = useMemo(() => {
        if (!customerDetails?.name) return "C";
        return customerDetails.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    }, [customerDetails]);

    const profileImage = customerDetails?.customer?.profile_image;
    const isVerified = customerDetails?.is_email_approved;
    const isOnline = customerDetails?.is_online;

    const currentSelectedOption = siteOptions.find((s) => String(s.value) === String(selectedSiteId)) || null;

    return (
        <div className="row g-3 mb-4">
            {/* LEFT: PROFILE INFO */}
            <div className="col-lg-4">
                <div className="card shadow-sm border-0 rounded-3 h-100">
                    <div className="card-body p-4">
                        {/* AVATAR */}
                        <div className="mb-4 text-center">
                            <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto", border: "3px solid #111", borderRadius: "50%", overflow: "hidden" }}>
                                {profileImage ? (
                                    <img
                                        src={`${profileImage.startsWith("http") ? profileImage : `${apiURL}storage/${profileImage}`}`}
                                        alt="Profile"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            borderRadius: "12px",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="bg-primary bg-opacity-10 text-white fw-bold rounded d-flex align-items-center justify-content-center"
                                        style={{ width: "100%", height: "100%", fontSize: 32, }}
                                    >
                                        {initials}
                                    </div>
                                )}
                                {isOnline && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            width: 24,
                                            height: 24,
                                            borderRadius: "50%",
                                            background: "#10b981",
                                            border: "2px solid white",
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* NAME & BADGES */}
                        <h6 className="fw-bold text-center text-dark mb-2">{customerDetails?.name || "Client"}</h6>
                        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                            {isVerified ? (
                                <span className="badge bg-success text-white px-2 py-1" style={{ fontSize: "11px" }}>
                                    <i className="fa-solid fa-check-circle me-1"></i> Verified
                                </span>
                            ) : (
                                <span className="badge bg-warning text-dark px-2 py-1" style={{ fontSize: "11px" }}>
                                    <i className="fa-solid fa-clock me-1"></i> Unverified
                                </span>
                            )}
                            <span className={`badge ${isOnline ? "bg-success" : "bg-secondary"} text-white px-2 py-1`} style={{ fontSize: "11px" }}>
                                {isOnline ? "Online" : "Offline"}
                            </span>
                            {customerDetails?.is_active !== undefined && (
                                <span className={`badge ${customerDetails?.is_active ? "bg-primary" : "bg-danger"} text-white px-2 py-1`} style={{ fontSize: "11px" }}>
                                    {customerDetails?.is_active ? "Active Account" : "Inactive Account"}
                                </span>
                            )}
                        </div>

                        {/* TOTAL HOURS */}
                        <div className="mb-3 pb-3 border-bottom text-center">
                            <small className="text-muted fw-bold d-block mb-2">Total Logged Hours</small>
                            <span className="badge bg-dark bg-opacity-10 text-dark px-3 py-2 fs-6 rounded-pill border">
                                <i className="fa-solid fa-clock text-primary me-2"></i>
                                {customerTotalHours ? Number(customerTotalHours).toFixed(2) : "0.00"} Hrs
                            </span>
                        </div>

                        {/* FULL CONTACT & PROFILE INFO */}
                        {customerDetails?.customer?.company_name && (
                            <div className="mb-3 pb-3 border-bottom">
                                <small className="text-muted fw-bold d-block mb-1">Company</small>
                                <span className="text-dark small">{customerDetails.customer.company_name}</span>
                            </div>
                        )}

                        <div className="mb-3 pb-3 border-bottom">
                            <small className="text-muted fw-bold d-block mb-1">Email</small>
                            <Link to={`mailto:${customerDetails?.email}`} className="text-primary text-decoration-none small fw-medium">
                                {customerDetails?.email}
                            </Link>
                        </div>

                        <div className="mb-3 pb-3 border-bottom">
                            <small className="text-muted fw-bold d-block mb-1">Phone</small>
                            <Link to={`tel:${customerDetails?.phone}`} className="text-primary text-decoration-none small fw-medium">
                                {customerDetails?.phone || "N/A"}
                            </Link>
                        </div>

                        <div className="mb-3 pb-3 border-bottom">
                            <small className="text-muted fw-bold d-block mb-1">Location</small>
                            <small className="text-dark">
                                {customerDetails?.city || "N/A"}, {customerDetails?.state || "N/A"}
                            </small>
                        </div>

                        {customerDetails?.created_at && (
                            <div>
                                <small className="text-muted fw-bold d-block mb-1">Member Since</small>
                                <small className="text-dark">
                                    {new Date(customerDetails.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: SITES SELECTOR */}
            <div className="col-lg-8">
                <div className="card shadow-sm border-0 rounded-3 h-100">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                            <h6 className="fw-bold text-dark mb-0">
                                <i className="fa-solid fa-map-location-dot text-primary me-2"></i>
                                Select Response Site
                            </h6>
                            <span className="badge bg-light text-dark" style={{ fontSize: "12px" }}>
                                {siteOptions.filter(s => !s.isManual).length} Sites Available
                            </span>
                        </div>

                        {/* REACT-SELECT IMPLEMENTATION (COMPACT SIZING) */}
                        <div className="mb-4">
                            <label className="form-label small text-muted fw-bold mb-2">Search & Choose Location</label>
                            <Select
                                options={siteOptions}
                                value={currentSelectedOption}
                                onChange={(selected) => onSiteSelect(selected)}
                                placeholder="Type to search sites..."
                                isDisabled={loadingSites}
                                isSearchable={true}
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '40px',
                                        borderRadius: '0.375rem',
                                        borderColor: '#dee2e6',
                                        boxShadow: 'none',
                                        fontSize: '0.9rem',
                                        '&:hover': { borderColor: '#0d6efd' }
                                    }),
                                    menu: (base) => ({ ...base, zIndex: 9999, borderRadius: '0.5rem' })
                                }}
                                formatOptionLabel={(option) => {
                                    if (option.isManual) {
                                        return (
                                            <div className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
                                                <i className="fa-solid fa-location-crosshairs me-2"></i>
                                                {option.label}
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="d-flex align-items-center justify-content-between" style={{ fontSize: '0.9rem' }}>
                                            <div>
                                                <div className="fw-bold text-dark">{option.siteData?.site_name || "Unnamed Site"}</div>
                                                <small className="text-muted d-block" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                                    {option.siteData?.address}
                                                </small>
                                            </div>
                                            {option.siteData?.job_roster?.length > 0 && (
                                                <span className="badge bg-success bg-opacity-10 text-success border border-success" style={{ fontSize: '0.75rem' }}>
                                                    <i className="fa-solid fa-briefcase me-1"></i> {option.siteData.job_roster.length}
                                                </span>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        {/* DISPLAY SELECTED SITE SUMMARY */}
                        {currentSelectedOption && !currentSelectedOption.isManual && (
                            <div className="p-3 bg-light rounded-3 border">
                                <h6 className="fw-bold text-dark mb-1">
                                    <i className="fa-solid fa-check-circle text-success me-2"></i>
                                    {currentSelectedOption.siteData?.site_name || "Unnamed Site"}
                                </h6>
                                <p className="small text-muted mb-0 ms-4">
                                    {currentSelectedOption.siteData?.address}
                                </p>
                            </div>
                        )}

                        {currentSelectedOption?.isManual && (
                            <div className="p-3 bg-primary bg-opacity-10 rounded-3 border border-primary">
                                <h6 className="fw-bold text-primary mb-1">
                                    <i className="fa-solid fa-location-crosshairs me-2"></i>
                                    Manual Entry Selected
                                </h6>
                                <p className="small text-dark mb-0 ms-4">
                                    Please use the map below to drop a pin and define your custom address.
                                </p>
                            </div>
                        )}

                        {!currentSelectedOption && (
                            <div className="text-center py-5 text-muted">
                                <i className="fa-solid fa-map d-block mb-3 opacity-50" style={{ fontSize: 32 }}></i>
                                <small>Please select a site from the dropdown to continue.</small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}