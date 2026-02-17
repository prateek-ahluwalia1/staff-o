import React, { memo, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logOut } from "../store/slices/authSlice";

const Header = memo(function Header() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
            <img src="/assets/images/jobs-portal-logo.png" alt="Jobs Portal" />
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
            className={`collapse navbar-collapse mobile-menu ${
              isMobileOpen ? "show" : ""
            }`}
            id="navMain"
          >
            {/* Close button for mobile */}
            <button
              className="mobile-menu-close"
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <i className="fa fa-times" aria-hidden="true"></i>
            </button>

            <ul className="navbar-nav mx-auto align-items-lg-center main-menu">
              {/* Home Dropdown */}
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
                  aria-expanded="false"
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
                  aria-expanded="false"
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
                  aria-expanded="false"
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
                  {/* ... add remaining items ... */}
                </ul>
              </li>

              {/* Blog Dropdown */}
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
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
                  aria-expanded="false"
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

            {/* Right side buttons + user dropdown */}
            <div className="navbar-actions d-flex align-items-center gap-2">
              {!token && (
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
              )}

              {/* Logged-in user dropdown (you can show conditionally) */}
              <div className="dropdown user-dropdown">
                <button
                  className="btn btn-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src="/assets/images/candidates/01.jpg"
                    alt="Candidate Profile"
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
                      className="dropdown-item"
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
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
});

export default Header;
