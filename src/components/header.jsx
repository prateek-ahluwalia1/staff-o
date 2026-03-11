import React, { memo, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logOut } from "../store/slices/authSlice";
import { clearUnreadCount } from "../store/slices/notificationSlice";
import useSubmit from "../hooks/useSubmit";
import staffologo from "../assets/images/staffo.png";

const Header = memo(function Header() {
  const { token } = useSelector((state) => state.auth);
  const { items, unreadCount } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { submit: markAsReadApi } = useSubmit({ isAuth: true });

  const toggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);

    // If opening the dropdown and there are unread items, clear count and notify backend
    if (nextState && unreadCount > 0) {
      dispatch(clearUnreadCount());
      await markAsReadApi("/notifications/mark-read", {});
    }
  };

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return (
    <div className="header">
      <div
        className={`mobile-menu-overlay ${isMobileOpen ? "show" : ""}`}
        onClick={closeMobileMenu}
      ></div>

      <nav className="navbar navbar-expand-lg navbar-light main-navbar">
        <div className="container">
          {/* Logo */}
          <Link to="/" className="navbar-brand logo d-flex align-items-center">
            <img src={staffologo} alt="Staffo" style={{ height: "50px" }} />
          </Link>

          {/* Mobile toggle */}
          <button
            className="navbar-toggler mobile-menu-toggle"
            type="button"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu + actions */}
          <div
            className={`collapse navbar-collapse mobile-menu ${isMobileOpen ? "show" : ""}`}
            id="navMain"
          >
            <button
              className="mobile-menu-close"
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>

            <ul className="navbar-nav mx-auto align-items-lg-center main-menu">
              {/* Home */}
              <li className="nav-item">
                <Link className="nav-link" to="/home">
                  Home
                </Link>
              </li>

              {/* Jobs Dropdown */}
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  Jobs
                </button>
                <ul className="dropdown-menu dropdown-menu-lg">
                  <li>
                    <Link className="dropdown-item" to="/job-grid">
                      Jobs Grid View
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/job-listing">
                      Jobs List View
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/job-detail">
                      Job Single
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Employer Dropdown */}
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  Employer
                </button>
                <ul className="dropdown-menu dropdown-menu-lg">
                  <li>
                    <Link className="dropdown-item" to="/employer-listing">
                      Employer List
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/employer-grid">
                      Employer Grid
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/company-detail">
                      Employer Single
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/company-dashboard">
                      Employer Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/post-job">
                      Post Job
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Candidate Dropdown */}
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  Candidate
                </button>
                <ul className="dropdown-menu dropdown-menu-lg">
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/candidate-listing-list"
                    >
                      Candidate List
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/candidate-listing">
                      Candidate Grid View
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/candidate-detail">
                      Candidate Single
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/dashboard">
                      Candidate Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/edit-profile">
                      Edit Profile
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Blog Dropdown */}
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  Blog
                </button>
                <ul className="dropdown-menu dropdown-menu-lg">
                  <li>
                    <Link className="dropdown-item" to="/blog-grid">
                      Blog Grid
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/blog">
                      Blog List
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/blog-full-width">
                      Blog Full Width
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/blog-detail">
                      Blog Detail
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/contact-us">
                  Contact Us
                </Link>
              </li>

              {/* Pages Dropdown */}
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  Pages
                </button>
                <ul className="dropdown-menu dropdown-menu-lg">
                  <li>
                    <Link className="dropdown-item" to="/about-us">
                      About Us
                    </Link>
                  </li>
                  {!token && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/login">
                          Login
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/register">
                          Register
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link className="dropdown-item" to="/packages">
                      Packages
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/faqs">
                      FAQs
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/404">
                      404 Page
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/typography">
                      Typography
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>

            <div className="navbar-actions d-flex align-items-center gap-3">
              {!token ? (
                <>
                  <Link
                    to="/login"
                    className="btn btn-outline-primary signin-btn"
                  >
                    Sign in
                  </Link>
                  <Link to="/register" className="btn btn-primary register-btn">
                    Register
                  </Link>
                </>
              ) : (
                <>
                  {/* REAL-TIME NOTIFICATION BELL */}
                  <div className="notification-wrapper position-relative">
                    <button
                      className="btn position-relative p-0 border-0 bg-transparent"
                      onClick={toggleNotifications}
                      style={{ fontSize: "20px", color: "#666" }}
                    >
                      <i className="fa fa-bell"></i>
                      {unreadCount > 0 && (
                        <span
                          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                          style={{ fontSize: "10px" }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div
                        className="dropdown-menu dropdown-menu-end show shadow"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "40px",
                          width: "280px",
                          display: "block",
                          padding: "0",
                        }}
                      >
                        <div className="p-2 border-bottom fw-bold text-center">
                          Notifications
                        </div>
                        <ul
                          className="list-unstyled mb-0"
                          style={{ maxHeight: "300px", overflowY: "auto" }}
                        >
                          {items.length > 0 ? (
                            items.map((notif, index) => (
                              <li
                                key={notif.id || index}
                                className="p-3 border-bottom dropdown-item"
                                style={{ whiteSpace: "normal" }}
                              >
                                <div className="small text-dark fw-semibold">
                                  {notif.title || notif.data?.title}
                                </div>
                                <div className="small text-muted">
                                  {notif.message || notif.data?.message}
                                </div>
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "11px" }}
                                >
                                  {notif.created_at || "Just now"}
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="p-3 text-center text-muted small">
                              No new notifications
                            </li>
                          )}
                        </ul>
                        <div className="p-2 text-center border-top">
                          <Link
                            to="/notifications"
                            className="small text-primary text-decoration-none"
                            onClick={() => setShowNotifications(false)}
                          >
                            View All
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logged-in user dropdown */}
                  <div className="dropdown user-dropdown">
                    <button
                      className="btn btn-secondary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                    >
                      <img
                        src="/assets/images/candidates/01.jpg"
                        alt="Profile"
                      />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link className="dropdown-item" to="/dashboard">
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/edit-profile">
                          Edit Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/payment-history">
                          Payment History
                        </Link>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="dropdown-item text-danger"
                          onClick={() => {
                            dispatch(logOut());
                            navigate("/login");
                          }}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
});

export default Header;
