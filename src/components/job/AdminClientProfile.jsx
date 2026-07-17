import React, { useMemo } from "react";
import Select from "react-select";
import { apiURL } from "../../utils/exports";
import { Link } from "react-router-dom";

const BRAND = "#0A7C6E";
const BRAND_LIGHT = "#E6F4F2";
const BRAND_DARK = "#065E54";

const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${d.getFullYear()}`;
};

export default function AdminClientProfile({
    customerDetails,
    customerTotalHours,
    siteOptions,
    selectedSiteId,
    onSiteSelect,
    loadingSites,
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

    const currentSelectedOption =
        siteOptions.find((s) => String(s.value) === String(selectedSiteId)) || null;

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: "42px",
            borderRadius: "10px",
            borderColor: state.isFocused ? BRAND : "#e2e8f0",
            boxShadow: state.isFocused ? `0 0 0 3px ${BRAND}22` : "none",
            fontSize: "0.875rem",
            transition: "border-color 0.15s, box-shadow 0.15s",
            "&:hover": { borderColor: BRAND },
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? BRAND
                : state.isFocused
                    ? BRAND_LIGHT
                    : "white",
            color: state.isSelected ? "white" : "#1e293b",
            fontSize: "0.875rem",
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (base) => ({
            ...base,
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
        }),
        placeholder: (base) => ({ ...base, color: "#94a3b8", fontSize: "0.875rem" }),
        singleValue: (base) => ({ ...base, color: "#1e293b" }),
    };

    const statTiles = [
        {
            icon: "fa-solid fa-envelope",
            label: "Email",
            value: customerDetails?.email,
            href: customerDetails?.email ? `mailto:${customerDetails.email}` : null,
        },
        {
            icon: "fa-solid fa-phone",
            label: "Phone",
            value: customerDetails?.phone || "N/A",
            href: customerDetails?.phone ? `tel:${customerDetails.phone}` : null,
        },
        {
            icon: "fa-solid fa-location-dot",
            label: "Location",
            value: `${customerDetails?.city || "N/A"}, ${customerDetails?.state || "N/A"}`,
        },
        {
            icon: "fa-regular fa-calendar",
            label: "Member Since",
            value: customerDetails?.created_at
                ? formatDateToDDMMYYYY(customerDetails.created_at)
                : "N/A",
        },
    ];

    return (
        <div className="row g-4 mb-4">
            {/* ---------- Shared card styling ---------- */}
            <style>{`
                .acp-card {
                    background: #fff;
                    border-radius: 18px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 14px rgba(15,23,42,0.06);
                    overflow: visible;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .acp-card-header {
                    background: #f9fafb;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 1rem 1.5rem;
                    font-weight: 700;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .acp-card-header i {
                    color: #0A7C6E;
                    font-size: 1rem;
                }
                .acp-card-body {
                    padding: 1.5rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .acp-avatar {
                    width: 58px; height: 58px;
                    border-radius: 50%;
                    border: 2.5px solid #0A7C6E;
                    overflow: hidden;
                    background: #E6F4F2;
                }
                .acp-avatar img {
                    width: 100%; height: 100%; object-fit: cover;
                }
                .acp-avatar-initials {
                    width: 100%; height: 100%;
                    background: #0A7C6E;
                    color: white;
                    font-weight: 700;
                    font-size: 20px;
                    display: flex; align-items: center; justify-content: center;
                }
                .acp-stat-chip {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 12px;
                    padding: 10px 12px;
                }
                .acp-stat-chip .acp-icon {
                    width: 30px; height: 30px;
                    border-radius: 8px;
                    background: #E6F4F2;
                    color: #0A7C6E;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    font-size: 12px;
                }
                .acp-badge {
                    font-size: 10px; font-weight: 600;
                    padding: 2px 8px; border-radius: 20px;
                }
            `}</style>

            {/* ----- Client Profile Card (50%) ----- */}
            <div className="col-lg-6 d-flex">
                <div className="acp-card" style={{ width: "100%" }}>
                    <div className="acp-card-header">
                        <i className="fa-solid fa-address-card"></i>
                        <span>Client Profile</span>
                    </div>
                    <div className="acp-card-body">
                        {/* Avatar + Name + Badges */}
                        <div
                            className="d-flex align-items-center gap-3 mb-3 pb-3"
                            style={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <div className="acp-avatar">
                                    {profileImage ? (
                                        <img
                                            src={
                                                profileImage.startsWith("http")
                                                    ? profileImage
                                                    : `${apiURL}storage/${profileImage}`
                                            }
                                            alt="Profile"
                                        />
                                    ) : (
                                        <div className="acp-avatar-initials">{initials}</div>
                                    )}
                                </div>
                                {isOnline && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 2,
                                            right: 2,
                                            width: 13,
                                            height: 13,
                                            borderRadius: "50%",
                                            background: "#22c55e",
                                            border: "2.5px solid white",
                                        }}
                                    />
                                )}
                            </div>
                            <div className="flex-grow-1 min-w-0">
                                <p
                                    className="fw-bold text-truncate"
                                    style={{ color: "#0f172a", margin: "0 0 5px", fontSize: "0.97rem" }}
                                >
                                    {customerDetails?.name || "Client"}
                                </p>
                                <div className="d-flex flex-wrap gap-1">
                                    <span
                                        className="acp-badge"
                                        style={{
                                            background: isVerified ? "#dcfce7" : "#fef9c3",
                                            color: isVerified ? "#15803d" : "#a16207",
                                        }}
                                    >
                                        {isVerified ? "Email Verified" : "Email Unverified"}
                                    </span>
                                    <span
                                        className="acp-badge"
                                        style={{
                                            background: isOnline ? "#dcfce7" : "#f1f5f9",
                                            color: isOnline ? "#15803d" : "#64748b",
                                        }}
                                    >
                                        {isOnline ? "● Online" : "○ Offline"}
                                    </span>
                                    {customerDetails?.is_active !== undefined && (
                                        <span
                                            className="acp-badge"
                                            style={{
                                                background: customerDetails.is_active ? "#E6F4F2" : "#fee2e2",
                                                color: customerDetails.is_active ? "#065E54" : "#b91c1c",
                                            }}
                                        >
                                            {customerDetails.is_active ? "Active" : "Inactive"}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Hours pill */}
                            <div
                                style={{
                                    flexShrink: 0,
                                    textAlign: "center",
                                    background: "#E6F4F2",
                                    borderRadius: 10,
                                    padding: "6px 10px",
                                    minWidth: 58,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 9,
                                        fontWeight: 700,
                                        color: "#0A7C6E",
                                        letterSpacing: "0.05em",
                                    }}
                                >
                                    Hours
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.95rem",
                                        fontWeight: 700,
                                        color: "#065E54",
                                        lineHeight: 1.2,
                                    }}
                                >
                                    {customerTotalHours ? Number(customerTotalHours).toFixed(2) : "0.00"}
                                </div>
                            </div>
                        </div>

                        {/* Company name (optional) */}
                        {customerDetails?.customer?.company_name && (
                            <div className="acp-stat-chip mb-2">
                                <span className="acp-icon">
                                    <i className="fa-solid fa-building"></i>
                                </span>
                                <div style={{ minWidth: 0 }}>
                                    <span
                                        style={{
                                            fontSize: 9,
                                            fontWeight: 700,
                                            color: "#94a3b8",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            display: "block",
                                        }}
                                    >
                                        Company
                                    </span>
                                    <span
                                        className="text-truncate d-block"
                                        style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: 600 }}
                                    >
                                        {customerDetails.customer.company_name}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Contact tiles */}
                        <div className="row g-2 mt-auto">
                            {statTiles.map((s) => (
                                <div className="col-6" key={s.label}>
                                    <div className="acp-stat-chip h-100">
                                        <span className="acp-icon">
                                            <i className={s.icon}></i>
                                        </span>
                                        <div style={{ minWidth: 0 }}>
                                            <span
                                                style={{
                                                    fontSize: 9,
                                                    fontWeight: 700,
                                                    color: "#94a3b8",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.05em",
                                                    display: "block",
                                                }}
                                            >
                                                {s.label}
                                            </span>
                                            {s.href ? (
                                                <Link
                                                    to={s.href}
                                                    className="text-truncate d-block"
                                                    style={{
                                                        fontSize: "0.78rem",
                                                        color: "#0A7C6E",
                                                        textDecoration: "none",
                                                        fontWeight: 600,
                                                        textTransform: "none",
                                                    }}
                                                >
                                                    {s.value}
                                                </Link>
                                            ) : (
                                                <span
                                                    className="text-truncate d-block"
                                                    style={{ fontSize: "0.78rem", color: "#1e293b", fontWeight: 600 }}
                                                >
                                                    {s.value}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ----- Site Selection Card (50%) – full width fix ----- */}
            <div className="col-lg-6 d-flex">
                <div className="acp-card" style={{ width: "100%" }}>
                    <div
                        className="acp-card-header d-flex justify-content-between align-items-center"
                    >
                        <div className="d-flex align-items-center gap-2">
                            <i className="fa-solid fa-map-location-dot"></i>
                            <span>Select Response Site</span>
                        </div>
                        <span
                            className="acp-badge"
                            style={{
                                background: "#E6F4F2",
                                color: "#065E54",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {siteOptions.filter((s) => !s.isManual).length} Sites Available
                        </span>
                    </div>
                    <div className="acp-card-body" style={{ minWidth: 0 }}>
                        {/* Dropdown – full width */}
                        <div className="mb-3 w-100">
                            <label
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.06em",
                                    color: "#94a3b8",
                                    display: "block",
                                    marginBottom: 8,
                                }}
                            >
                                Search &amp; Choose Location
                            </label>
                            <div style={{ width: "100%" }}>
                                <Select
                                    options={siteOptions}
                                    value={currentSelectedOption}
                                    onChange={(selected) => onSiteSelect(selected)}
                                    placeholder="Type to search sites..."
                                    isDisabled={loadingSites}
                                    isSearchable={true}
                                    menuPortalTarget={document.body}
                                    styles={selectStyles}
                                    formatOptionLabel={(option) => {
                                        if (option.isManual) {
                                            return (
                                                <div
                                                    style={{
                                                        fontSize: "0.875rem",
                                                        fontWeight: 600,
                                                        color: "#0A7C6E",
                                                    }}
                                                >
                                                    <i className="fa-solid fa-location-crosshairs me-2"></i>
                                                    {option.label}
                                                </div>
                                            );
                                        }
                                        return (
                                            <div
                                                className="d-flex align-items-center justify-content-between"
                                                style={{ fontSize: "0.875rem" }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 600, color: "#0f172a" }}>
                                                        {option.siteData?.site_name || "Unnamed Site"}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.75rem",
                                                            color: "#94a3b8",
                                                            whiteSpace: "nowrap",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            maxWidth: "300px",
                                                        }}
                                                    >
                                                        {option.siteData?.address}
                                                    </div>
                                                </div>
                                                {option.siteData?.job_roster?.length > 0 && (
                                                    <span
                                                        style={{
                                                            fontSize: "0.7rem",
                                                            padding: "2px 8px",
                                                            borderRadius: 12,
                                                            background: "#dcfce7",
                                                            color: "#15803d",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-briefcase me-1"></i>
                                                        {option.siteData.job_roster.length}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        </div>

                        {/* Selected site summary */}
                        <div style={{ marginTop: "auto" }}>
                            {currentSelectedOption && !currentSelectedOption.isManual && (
                                <div
                                    style={{
                                        padding: "12px 16px",
                                        background: "#E6F4F2",
                                        borderRadius: 10,
                                        border: "1px solid rgba(10,124,110,0.2)",
                                    }}
                                >
                                    <p
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.875rem",
                                            color: "#065E54",
                                            margin: "0 0 4px",
                                        }}
                                    >
                                        <i
                                            className="fa-solid fa-check-circle me-2"
                                            style={{ color: "#22c55e" }}
                                        ></i>
                                        {currentSelectedOption.siteData?.site_name || "Unnamed Site"}
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "0.78rem",
                                            color: "#64748b",
                                            margin: 0,
                                            paddingLeft: 24,
                                        }}
                                    >
                                        {currentSelectedOption.siteData?.address}
                                    </p>
                                </div>
                            )}

                            {currentSelectedOption?.isManual && (
                                <div
                                    style={{
                                        padding: "12px 16px",
                                        background: "#E6F4F2",
                                        borderRadius: 10,
                                        border: "1px solid rgba(10,124,110,0.3)",
                                    }}
                                >
                                    <p
                                        style={{
                                            fontWeight: 600,
                                            fontSize: "0.875rem",
                                            color: "#065E54",
                                            margin: "0 0 4px",
                                        }}
                                    >
                                        <i className="fa-solid fa-location-crosshairs me-2"></i>
                                        Manual Entry Selected
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "0.78rem",
                                            color: "#475569",
                                            margin: 0,
                                            paddingLeft: 24,
                                        }}
                                    >
                                        Use the map below to drop a pin and define your custom address.
                                    </p>
                                </div>
                            )}

                            {!currentSelectedOption && (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "16px 0",
                                        color: "#94a3b8",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: "50%",
                                            background: "#f8fafc",
                                            border: "1px solid #e2e8f0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto 10px",
                                        }}
                                    >
                                        <i
                                            className="fa-solid fa-map"
                                            style={{ fontSize: 20, color: "#cbd5e1" }}
                                        ></i>
                                    </div>
                                    <p
                                        style={{
                                            fontSize: "0.82rem",
                                            margin: 0,
                                            color: "#94a3b8",
                                            textTransform: "none",
                                        }}
                                    >
                                        Select a site from the dropdown to continue
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}