import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Card } from "../components/Card";
import Loader from "../components/Loader";
import TablePagination from "../components/TablePagination";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import leaveimg from "../assets/images/leave.png";
import publicHolidayImg from "../assets/images/public-holiday.png";
import staffoostaffimg from "../assets/images/capital-security-staff.png";
import sitesimg from "../assets/images/sites.png";

const MIN_SIGNIN_RADIUS = 300;

const WFMTools = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const { isExpanded } = useSelector((state) => state.sidebar);
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";

  const [showSitesModal, setShowSitesModal] = useState(false);
  const [sitesPage, setSitesPage] = useState(1);
  const [sitesPerPage, setSitesPerPage] = useState(20);
  const [radiusInputs, setRadiusInputs] = useState({});
  const [savingSiteId, setSavingSiteId] = useState(null);

  const sitesFetchEndpoint = useMemo(() => {
    if (!showSitesModal) return null;
    const params = new URLSearchParams();
    params.set("page", sitesPage);
    params.set("per_page", sitesPerPage);
    params.set("limit", sitesPerPage);
    return `api/get-sites?${params.toString()}`;
  }, [showSitesModal, sitesPage, sitesPerPage]);

  const {
    data: sitesResponse,
    loading: sitesLoading,
    refetch: refetchSites,
  } = useFetch(sitesFetchEndpoint, { isAuth: true });

  const { submit: submitSiteRadius } = useSubmit({ isAuth: true });

  const sites = useMemo(() => {
    if (!sitesResponse) return [];
    const arr = sitesResponse.data?.data ?? sitesResponse.data;
    return Array.isArray(arr) ? arr : [];
  }, [sitesResponse]);

  const sitesTotalPages = sitesResponse?.data?.last_page || sitesResponse?.last_page || 1;
  const sitesTotalItems = sitesResponse?.data?.total ?? sitesResponse?.total ?? sites.length;

  useEffect(() => {
    const map = {};
    sites.forEach((site) => {
      map[site.id] = site.signin_radius ?? "";
    });
    setRadiusInputs(map);
  }, [sites]);

  const openSitesModal = () => {
    setSitesPage(1);
    setShowSitesModal(true);
  };

  const closeSitesModal = () => {
    setShowSitesModal(false);
  };

  // Lock background scroll when the Sites modal is open
  useEffect(() => {
    document.body.style.overflow = showSitesModal ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showSitesModal]);

  const handleRadiusInputChange = (siteId, value) => {
    setRadiusInputs((prev) => ({ ...prev, [siteId]: value }));
  };

  const handleUpdateSiteRadius = async (site) => {
    const rawValue = radiusInputs[site.id];
    const value = Number(rawValue);

    if (!rawValue || isNaN(value) || value < MIN_SIGNIN_RADIUS) {
      toast.error(`Signin radius cannot be less than ${MIN_SIGNIN_RADIUS}.`);
      setRadiusInputs((prev) => ({ ...prev, [site.id]: site.signin_radius ?? "" }));
      return;
    }

    setSavingSiteId(site.id);
    const res = await submitSiteRadius(
      `api/update_site_radius/${site.id}`,
      { signin_radius: value },
      { method: "POST", headers: { id: site.id } }
    );
    setSavingSiteId(null);

    if (!res || res.success === false) return;

    toast.success("Signin radius updated successfully!");
    refetchSites();
  };

  return (
    <div className="dashboard-main">
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

        .wfm-hero {
          position: relative;
          background: linear-gradient(135deg, var(--navy-950) 0%, var(--navy-900) 65%, #0f2f52 100%);
          border-radius: 22px;
          padding: 34px 36px 46px;
          overflow: hidden;
          isolation: isolate;
          margin-bottom: 2rem;
        }
        .wfm-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px);
          background-size: 22px 22px;
          opacity: 0.35;
          z-index: -1;
        }
        .wfm-hero::after {
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
        .wfm-hero-eyebrow {
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
        .wfm-hero-eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.18);
        }
        .wfm-hero h1 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.4px;
          margin: 0 0 6px;
        }
        .wfm-hero p {
          color: rgba(255,255,255,0.62);
          font-size: 14px;
          margin: 0;
          text-transform: none;
        }

        .wfm-empty-state {
          text-align: center;
          padding: 3rem 2rem;
          background: #fff;
          border-radius: 18px;
          border: 1px solid var(--line-soft);
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          color: var(--muted);
          font-size: 0.95rem;
        }
        .wfm-empty-state i {
          font-size: 1.8rem;
          margin-right: 0.5rem;
          vertical-align: middle;
          color: var(--teal);
        }

        @media (max-width: 767.98px) {
          .wfm-hero { padding: 26px 20px 40px; border-radius: 18px; }
          .wfm-hero h1 { font-size: 22px; }
        }
      `}</style>

      {/* Hero header */}
      <div className="wfm-hero">
        <span className="wfm-hero-eyebrow">
          <span className="dot"></span> Tools
        </span>
        <h1>WFM Tools</h1>
        <p style={{ textTransform: "none" }}>
          Leave tools and registered staff are managed here.
        </p>
      </div>

      {isAdmin ? (
        <div className={`row row-cols-1 row-cols-md-2 row-cols-lg-3 ${isExpanded ? "row-cols-xl-3" : "row-cols-xl-4"} g-4`}>
          <div className="col">
            <Card
              title="Leave Management"
              description="Used to display the detailed overview of staff leave requests."
              accent="linear-gradient(135deg, #16a34a, #22c55e)"
              image={leaveimg}
              type="leave"
              onClick={() => navigate("/leave")}
            />
          </div>
          <div className="col">
            <Card
              title="Public Holidays"
              description="Used to display the detailed overview of public holidays."
              accent="linear-gradient(135deg, #d97706, #f59e0b)"
              image={publicHolidayImg}
              type="holidays"
              onClick={() => navigate("/holidays")}
            />
          </div>
          <div className="col">
            <Card
              title="Staffoo Staff"
              description="Used to display the detailed overview of staff members."
              accent="linear-gradient(135deg, #0ea5e9, #38bdf8)"
              image={staffoostaffimg}
              type="staff"
              onClick={() => navigate("/staff-management")}
            />
          </div>
          <div className="col">
            <Card
              title="Sites"
              description="Used to display the list of sites and manage their signin radius."
              accent="linear-gradient(135deg, #7c3aed, #a78bfa)"
              image={sitesimg}
              icon="fa-solid fa-map-location-dot"
              type="sites"
              onClick={openSitesModal}
            />
          </div>
        </div>
      ) : (
        <div className="wfm-empty-state">
          <i className="fa fa-info-circle"></i>
          Leave management is currently available for admin users only.
        </div>
      )}

      {showSitesModal && (
        <div className="sites-modal-overlay-premium" onClick={closeSitesModal} role="dialog" aria-modal="true">
          <div className="sites-modal-content-premium" onClick={(e) => e.stopPropagation()}>
            <div className="sites-modal-header-premium">
              <h3 className="sites-modal-title">Sites</h3>
              <button className="sites-modal-close-btn" onClick={closeSitesModal} type="button">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="sites-modal-body">
              <div className="sites-table-card">
                <div className="table-responsive position-relative" style={{ overflowX: "auto", minHeight: "200px" }}>
                  {sitesLoading && (
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255, 255, 255, 0.65)",
                        backdropFilter: "blur(3px)",
                        zIndex: 20,
                      }}
                    >
                      <Loader />
                    </div>
                  )}
                  <table className="sites-table-modern m-0">
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left" }}>Site Name</th>
                        <th style={{ textAlign: "left" }}>Description</th>
                        <th style={{ textAlign: "left" }}>Address</th>
                        <th style={{ textAlign: "left" }}>State</th>
                        <th style={{ textAlign: "center", width: "180px" }}>Signin Radius</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sites.length > 0 ? (
                        sites.map((site) => (
                          <tr key={site.id}>
                            <td>
                              <div className="fw-bold text-dark">{site.site_name || "—"}</div>
                            </td>
                            <td>
                              <div className="text-muted small" style={{ textTransform: "none" }}>
                                {site.site_description || "—"}
                              </div>
                            </td>
                            <td>
                              <div className="text-muted small" style={{ textTransform: "none" }}>
                                {site.address || "—"}
                              </div>
                            </td>
                            <td>
                              <div className="text-muted small">{site.state || "—"}</div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                <input
                                  type="number"
                                  min={MIN_SIGNIN_RADIUS}
                                  className="form-control form-control-sm sites-radius-input"
                                  value={radiusInputs[site.id] ?? ""}
                                  disabled={savingSiteId === site.id}
                                  onChange={(e) => handleRadiusInputChange(site.id, e.target.value)}
                                  onBlur={() => handleUpdateSiteRadius(site)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.target.blur();
                                    }
                                  }}
                                />
                                {savingSiteId === site.id && (
                                  <i className="fa-solid fa-spinner fa-spin text-muted"></i>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-5 text-muted" style={{ textTransform: "none" }}>
                            <i className="fa-solid fa-map-location-dot d-block fs-3 mb-2 opacity-50"></i>
                            No sites found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={sitesPage}
                  totalPages={sitesTotalPages}
                  totalItems={sitesTotalItems}
                  perPage={sitesPerPage}
                  showRecordCount
                  loading={sitesLoading}
                  onPageChange={(p) => setSitesPage(p)}
                  onPerPageChange={(pp) => {
                    setSitesPerPage(pp);
                    setSitesPage(1);
                  }}
                />
              </div>
            </div>
          </div>
          <style>{`
            .sites-modal-overlay-premium {
              position: fixed;
              inset: 0;
              background: rgba(10,20,35,0.62);
              backdrop-filter: blur(6px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
              padding: 1.5rem;
              animation: sitesModalFadeIn 0.25s ease-out;
            }
            @keyframes sitesModalFadeIn { from { opacity: 0; } to { opacity: 1; } }
            .sites-modal-content-premium {
              background: #ffffff;
              border-radius: 22px;
              box-shadow: 0 30px 60px -18px rgba(10,25,48,0.5);
              max-width: 1000px;
              width: 100%;
              max-height: 90vh;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              border: 1px solid rgba(255,255,255,0.2);
              animation: sitesModalPopIn 0.35s cubic-bezier(0.16,1,0.3,1);
            }
            @keyframes sitesModalPopIn {
              from { opacity: 0; transform: scale(0.96) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .sites-modal-header-premium {
              position: relative;
              background: linear-gradient(120deg, var(--navy-950), var(--navy-900) 70%, #10345a);
              padding: 16px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-shrink: 0;
              overflow: hidden;
            }
            .sites-modal-title {
              margin: 0;
              font-size: 19px;
              font-weight: 700;
              letter-spacing: 0.2px;
              color: #fff;
              position: relative;
              z-index: 1;
            }
            .sites-modal-close-btn {
              position: relative;
              z-index: 2;
              width: 34px;
              height: 34px;
              border-radius: 50%;
              border: none;
              background: rgba(255,255,255,0.08);
              color: #fff;
              font-size: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: background 0.2s, transform 0.2s;
              flex-shrink: 0;
              margin-left: auto;
            }
            .sites-modal-close-btn:hover {
              background: rgba(255,255,255,0.18);
              transform: rotate(90deg);
            }
            .sites-modal-body {
              padding: 20px;
              overflow-y: auto;
              flex: 1;
              color: var(--ink);
            }
            .sites-table-card {
              background: #fff;
              border-radius: 16px;
              border: 1px solid var(--line-soft);
              overflow: hidden;
            }
            .sites-table-modern { width: 100%; border-collapse: separate; border-spacing: 0; }
            .sites-table-modern thead th {
              background: var(--teal);
              color: #fff;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              padding: 14px 16px;
              border-bottom: none;
              border-right: 1px solid rgba(255,255,255,0.1);
            }
            .sites-table-modern thead th:last-child { border-right: none; }
            .sites-table-modern tbody tr { transition: background 0.15s; }
            .sites-table-modern tbody tr:hover { background: rgba(248,250,252,0.6); }
            .sites-table-modern tbody td { padding: 16px 16px; vertical-align: middle; border-bottom: 1px solid var(--line-soft); }
            .sites-table-modern tbody tr:last-child td { border-bottom: none; }
            .sites-radius-input { max-width: 120px; text-align: center; }
            @media (max-width: 576px) {
              .sites-modal-overlay-premium { padding: 0.75rem; }
              .sites-modal-body { padding: 16px; }
              .sites-modal-content-premium { border-radius: 18px; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default WFMTools;