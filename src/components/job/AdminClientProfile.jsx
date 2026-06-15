import React, { useMemo } from "react";
import Select from "react-select";
import { apiURL } from "../../utils/exports";
import { Link } from 'react-router-dom';

const BRAND = "#0A7C6E";
const BRAND_LIGHT = "#E6F4F2";
const BRAND_DARK = "#065E54";

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

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '40px',
            borderRadius: '8px',
            borderColor: state.isFocused ? BRAND : '#e2e8f0',
            boxShadow: state.isFocused ? `0 0 0 3px ${BRAND}22` : 'none',
            fontSize: '0.875rem',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            '&:hover': { borderColor: BRAND }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? BRAND : state.isFocused ? BRAND_LIGHT : 'white',
            color: state.isSelected ? 'white' : '#1e293b',
            fontSize: '0.875rem',
        }),
        menu: (base) => ({ ...base, zIndex: 9999, borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden' }),
        placeholder: (base) => ({ ...base, color: '#94a3b8', fontSize: '0.875rem' }),
        singleValue: (base) => ({ ...base, color: '#1e293b' }),
    };

    const labelStyle = {
        fontSize: "10px",
        fontWeight: 700,

        letterSpacing: "0.06em",
        color: "#94a3b8",
        display: "block",
        marginBottom: 4,
    };

    const valueStyle = { fontSize: "0.83rem", color: "#1e293b" };

    return (
        <div className="row g-3 mb-4">
            {/* ── LEFT: PROFILE CARD ── */}
            <div className="col-lg-4 d-flex">
                <div style={{
                    background: "white",
                    borderRadius: 14,
                    border: "1px solid #e8f0ef",
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(10,124,110,0.06)",
                    width: "100%",
                    height: "100%", // Ensures equal height with the right column
                    display: "flex",
                    flexDirection: "column"
                }}>
                    {/* Thin brand top bar */}
                    <div style={{ height: 4, background: `linear-gradient(90deg, ${BRAND}, ${BRAND_DARK})` }} />

                    <div style={{ padding: "20px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        {/* AVATAR + NAME + BADGES */}
                        <div className="d-flex align-items-center gap-3 mb-3 pb-3" style={{ borderBottom: "1px solid #f1f5f4" }}>
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <div style={{
                                    width: 58, height: 58, borderRadius: "50%",
                                    border: `2.5px solid ${BRAND}`,
                                    overflow: "hidden",
                                    background: BRAND_LIGHT,
                                }}>
                                    {profileImage ? (
                                        <img
                                            src={profileImage.startsWith("http") ? profileImage : `${apiURL}storage/${profileImage}`}
                                            alt="Profile"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: "100%", height: "100%",
                                            background: BRAND,
                                            color: "white",
                                            fontWeight: 700,
                                            fontSize: 20,
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                {isOnline && (
                                    <div style={{
                                        position: "absolute", bottom: 2, right: 2,
                                        width: 13, height: 13, borderRadius: "50%",
                                        background: "#22c55e", border: "2.5px solid white"
                                    }} />
                                )}
                            </div>

                            <div className="flex-grow-1 min-w-0">
                                <p style={{ fontWeight: 700, fontSize: "0.97rem", color: "#0f172a", margin: "0 0 5px", lineHeight: 1.2 }} className="text-truncate">
                                    {customerDetails?.name || "Client"}
                                </p>
                                <div className="d-flex flex-wrap gap-1">
                                    {isVerified ? (
                                        <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#dcfce7", color: "#15803d" }}>
                                            Email Verified
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#fef9c3", color: "#a16207" }}>
                                            Email Un Verified
                                        </span>
                                    )}
                                    <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: isOnline ? "#dcfce7" : "#f1f5f9", color: isOnline ? "#15803d" : "#64748b" }}>
                                        {isOnline ? "● Online" : "○ Offline"}
                                    </span>
                                    {customerDetails?.is_active !== undefined && (
                                        <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: customerDetails.is_active ? BRAND_LIGHT : "#fee2e2", color: customerDetails.is_active ? BRAND_DARK : "#b91c1c" }}>
                                            {customerDetails.is_active ? "Active" : "Inactive"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Hours pill */}
                            <div style={{ flexShrink: 0, textAlign: "center", background: BRAND_LIGHT, borderRadius: 10, padding: "6px 10px", minWidth: 58 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: BRAND, letterSpacing: "0.05em" }}>Hours</div>
                                <div style={{ fontSize: "0.95rem", fontWeight: 700, color: BRAND_DARK, lineHeight: 1.2 }}>
                                    {customerTotalHours ? Number(customerTotalHours).toFixed(2) : "0.00"}
                                </div>
                            </div>
                        </div>

                        {/* CONTACT GRID */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 12px", marginTop: "auto", marginBottom: "auto" }}>
                            {customerDetails?.customer?.company_name && (
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <span style={labelStyle}>Company</span>
                                    <span style={valueStyle}>{customerDetails.customer.company_name}</span>
                                </div>
                            )}
                            <div>
                                <span style={labelStyle}>Email</span>
                                <Link to={`mailto:${customerDetails?.email}`} className="text-truncate d-block" style={{ ...valueStyle, color: BRAND, textDecoration: "none", fontWeight: 500, textTransform: "none" }}>
                                    {customerDetails?.email}
                                </Link>
                            </div>
                            <div>
                                <span style={labelStyle}>Phone</span>
                                <Link to={`tel:${customerDetails?.phone}`} style={{ ...valueStyle, color: BRAND, textDecoration: "none", fontWeight: 500 }}>
                                    {customerDetails?.phone || "N/A"}
                                </Link>
                            </div>
                            <div>
                                <span style={labelStyle}>Location</span>
                                <span style={valueStyle}>{customerDetails?.city || "N/A"}, {customerDetails?.state || "N/A"}</span>
                            </div>
                            {customerDetails?.created_at && (
                                <div>
                                    <span style={labelStyle}>Member Since</span>
                                    <span style={valueStyle}>
                                        {new Date(customerDetails.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT: SITES SELECTOR ── */}
            <div className="col-lg-8 d-flex">
                <div style={{
                    background: "white",
                    borderRadius: 14,
                    border: "1px solid #e8f0ef",
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(10,124,110,0.06)",
                    width: "100%",
                    height: "100%", // Ensures equal height
                    display: "flex",
                    flexDirection: "column"
                }}>
                    <div style={{ height: 4, background: `linear-gradient(90deg, ${BRAND}, ${BRAND_DARK})` }} />

                    <div style={{ padding: "20px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        {/* Header */}
                        <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: "1px solid #f1f5f4" }}>
                            <div className="d-flex align-items-center gap-2">
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <i className="fa-solid fa-map-location-dot" style={{ color: BRAND, fontSize: 13 }}></i>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>Select Response Site</span>
                            </div>
                            <span style={{
                                fontSize: "11px", fontWeight: 600, padding: "3px 10px",
                                borderRadius: 20, background: BRAND_LIGHT, color: BRAND_DARK
                            }}>
                                {siteOptions.filter(s => !s.isManual).length} Sites Available
                            </span>
                        </div>

                        {/* Dropdown */}
                        <div className="mb-3">
                            <label style={{ ...labelStyle, marginBottom: 8 }}>Search &amp; Choose Location</label>
                            <Select
                                options={siteOptions}
                                value={currentSelectedOption}
                                onChange={(selected) => onSiteSelect(selected)}
                                placeholder="Type to search sites..."
                                isDisabled={loadingSites}
                                isSearchable={true}
                                classNamePrefix="react-select"
                                styles={selectStyles}
                                formatOptionLabel={(option) => {
                                    if (option.isManual) {
                                        return (
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: BRAND }}>
                                                <i className="fa-solid fa-location-crosshairs me-2"></i>
                                                {option.label}
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="d-flex align-items-center justify-content-between" style={{ fontSize: '0.875rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: "#0f172a" }}>{option.siteData?.site_name || "Unnamed Site"}</div>
                                                <div style={{ fontSize: '0.75rem', color: "#94a3b8", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                                    {option.siteData?.address}
                                                </div>
                                            </div>
                                            {option.siteData?.job_roster?.length > 0 && (
                                                <span style={{ fontSize: '0.7rem', padding: "2px 8px", borderRadius: 12, background: "#dcfce7", color: "#15803d", fontWeight: 600 }}>
                                                    <i className="fa-solid fa-briefcase me-1"></i>{option.siteData.job_roster.length}
                                                </span>
                                            )}
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        {/* Selected site summary */}
                        <div style={{ marginTop: "auto" }}>
                            {currentSelectedOption && !currentSelectedOption.isManual && (
                                <div style={{ padding: "12px 16px", background: BRAND_LIGHT, borderRadius: 10, border: `1px solid ${BRAND}33` }}>
                                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: BRAND_DARK, margin: "0 0 4px" }}>
                                        <i className="fa-solid fa-check-circle me-2" style={{ color: "#22c55e" }}></i>
                                        {currentSelectedOption.siteData?.site_name || "Unnamed Site"}
                                    </p>
                                    <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, paddingLeft: 24 }}>
                                        {currentSelectedOption.siteData?.address}
                                    </p>
                                </div>
                            )}

                            {currentSelectedOption?.isManual && (
                                <div style={{ padding: "12px 16px", background: BRAND_LIGHT, borderRadius: 10, border: `1px solid ${BRAND}55` }}>
                                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: BRAND_DARK, margin: "0 0 4px" }}>
                                        <i className="fa-solid fa-location-crosshairs me-2"></i>
                                        Manual Entry Selected
                                    </p>
                                    <p style={{ fontSize: "0.78rem", color: "#475569", margin: 0, paddingLeft: 24 }}>
                                        Use the map below to drop a pin and define your custom address.
                                    </p>
                                </div>
                            )}

                            {!currentSelectedOption && (
                                <div style={{ textAlign: "center", padding: "16px 0", color: "#94a3b8" }}>
                                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                                        <i className="fa-solid fa-map" style={{ fontSize: 20, color: "#cbd5e1" }}></i>
                                    </div>
                                    <p style={{ fontSize: "0.82rem", margin: 0, color: "#94a3b8", textTransform: "none" }}>Select a site from the dropdown to continue</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}