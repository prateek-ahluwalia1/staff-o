import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../store/slices/authSlice";
import useSubmit from "../hooks/useSubmit";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import Header from "../components/newHome/Header";
import { apiURL } from "../utils/exports";
import {
  normalizeAuthResponse,
  extractUserId,
} from "../utils/authResponseNormalizer";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { submit, loading } = useSubmit();

  // FIX: Normalize incoming role to lowercase to ensure it matches your keys perfectly
  const incomingRole = location.state?.role?.toLowerCase();
  const validRoles = ["customer", "staff", "contractor"];
  const [userType, setUserType] = useState(
    validRoles.includes(incomingRole) ? incomingRole : "contractor"
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const fetchLatestUserProfile = async (token, authUser) => {
    const userId = extractUserId(authUser);
    if (!userId) return authUser;

    try {
      const res = await fetch(`${apiURL}api/user-edit/${userId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("Profile fetch error:", json);
        return authUser;
      }

      return json?.data || authUser;
    } catch (error) {
      console.error("Profile fetch error:", error);
      return authUser;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "name") {
      newValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phone") {
      newValue = value.replace(/[^\d+\s-]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Full name must be at least 2 characters.";
    }

    if (formData.phone.trim()) {
      const pureDigits = formData.phone.replace(/[\s-]/g, '');
      if (!/^\+?\d{10,15}$/.test(pureDigits)) {
        newErrors.phone = "Please enter a valid phone number (10-15 digits).";
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one letter and one number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      ...formData,
      password_confirmation: formData.password,
      user_type: userType,
    };

    const res = await submit("api/register/user", payload);
    if (!res) return;

    const normalized = normalizeAuthResponse(res);

    if (!normalized?.token) {
      console.error("Registration error response:", res);
      return;
    }

    toast.success("Account created successfully!");
    setShowVerifyModal(true);
  };

  const handleGoogleRegister = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const googleToken =
          tokenResponse?.access_token || tokenResponse?.code;

        if (!googleToken) {
          toast.error("Invalid Google response.");
          return;
        }

        const res = await submit("api/auth/google/callback", {
          credential: googleToken,
          user_type: userType,
        });

        if (!res) return;

        const normalized = normalizeAuthResponse(res);

        if (normalized?.token) {
          dispatch(setToken({ token: normalized.token }));

          const latestProfile = await fetchLatestUserProfile(
            normalized.token,
            normalized.user
          );

          dispatch(setUser({ userdata: latestProfile }));

          toast.success("Google signup successful!");
        } else {
          console.error("Google signup error response:", res);
        }
      } catch {
        toast.error("Server connection error during Google signup.");
      }
    },
  });

  return (
    <>
      <Header />

      <section className="auth-page">
        <div className="container" style={{ maxWidth: "1000px" }}>
          <div className="row align-items-center g-4">

            <div className="col-lg-6 d-none d-lg-block auth-hero-copy">
              <div className="auth-eyebrow">
                <span className="label">Australia's #1 Security Platform</span>
              </div>
              <h1 className="auth-title">
                Build your identity.<br />
                <span className="auth-line">Join trusted teams.</span>
              </h1>
              <p className="auth-description">
                Create your profile, connect with verified clients, and grow your opportunities with one secure platform.
              </p>

              <div className="auth-checks">
                <div className="auth-check">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Verified jobs and trusted clients</span>
                </div>
                <div className="auth-check">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Smart matching for every shift</span>
                </div>
                <div className="auth-check">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Fast onboarding and secure access</span>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="col-lg-6">
              <div className="auth-card">
                <h5 className="fw-bold mb-1">Create an account</h5>
                <p className="text-muted small mb-3">It only takes a few seconds.</p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-medium mb-1">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        maxLength={50}
                        disabled={loading}
                        style={{ border: "1px solid #0A7C6E" }}
                      />
                      {errors.name && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{errors.name}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-medium mb-1">
                        Phone Number <span className="text-muted fw-normal ms-1" style={{ fontSize: '0.85em' }}>(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        name="phone"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={20}
                        disabled={loading}
                        style={{ border: "1px solid #0A7C6E" }}
                      />
                      {errors.phone && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{errors.phone}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-medium mb-1">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={100}
                        disabled={loading}
                        style={{ border: "1px solid #0A7C6E" }}
                      />
                      {errors.email && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{errors.email}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-medium mb-1">
                        Password <span className="text-danger">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control pe-5 ${errors.password ? 'is-invalid' : ''}`}
                          name="password"
                          placeholder="Min. 8 chars"
                          value={formData.password}
                          onChange={handleChange}
                          minLength={8}
                          disabled={loading}
                          style={{ border: "1px solid #0A7C6E" }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm border-0 position-absolute end-0 top-50 translate-middle-y text-muted"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex="-1"
                        >
                          <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                      {errors.password && (
                        <div className="invalid-feedback d-block" style={{ fontSize: '12px', marginTop: '0.25rem' }}>
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FIX: Improved Radio Buttons for Account Type */}
                  <div className="mb-3 mt-1">
                    <label className="form-label small fw-medium mb-2">
                      Account Type <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-2 auth-account-types" role="radiogroup">
                      {[
                        { key: "customer", label: "Client" },
                        { key: "staff", label: "Staff" },
                        { key: "contractor", label: "Resource Partner" },
                      ].map((role) => {
                        const isActive = userType === role.key;

                        return (
                          <label
                            key={role.key}
                            className={`btn btn-sm rounded-pill px-3 py-1 auth-role-button ${isActive ? "active" : ""}`}
                            style={{
                              cursor: loading ? "not-allowed" : "pointer",
                              transition: "all 0.2s",
                              fontSize: "13px",
                              border: isActive ? "1px solid #0A7C6E" : "1px solid #6c757d",
                              backgroundColor: isActive ? "rgba(10, 124, 110, 0.1)" : "transparent",
                              color: isActive ? "#0A7C6E" : "#6c757d",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                          >
                            <input
                              type="radio"
                              name="userRole"
                              className="visually-hidden"
                              value={role.key}
                              checked={isActive}
                              onChange={() => !loading && setUserType(role.key)}
                              disabled={loading}
                            />
                            {isActive && <i className="fa-solid fa-circle-check"></i>}
                            {role.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2 mt-2"
                    style={{
                      background: "#0A7C6E",
                      border: "none",
                      borderRadius: "6px",
                      color: "#fff",
                      transition: "transform 0.1s",
                    }}
                    disabled={loading}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </form>

                <div className="auth-divider">
                  <hr />
                  <span>or</span>
                  <hr />
                </div>

                <button
                  onClick={handleGoogleRegister}
                  className="btn border auth-google-btn w-100 py-2 small d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                  style={{ borderRadius: "6px" }}
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    width={16}
                  />
                  <span className="text-white fw-medium" style={{ fontSize: "14px" }}>Google</span>
                </button>

                <p className="text-center mt-3 mb-0" style={{ fontSize: "13px" }}>
                  Already have an account?{" "}
                  <NavLink to="/login" className="fw-bold text-decoration-none" style={{ color: "#0A7C6E" }}>
                    Sign in
                  </NavLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verify Email Popup Overlay */}
      {showVerifyModal && (
        <div
          className="modal-backdrop-custom"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="modal-content-custom bg-white rounded-4 p-4 p-md-5 shadow-lg mx-3"
            style={{ maxWidth: "450px", width: "100%", animation: "fadeIn 0.3s ease" }}
          >
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: "80px", height: "80px", backgroundColor: "rgba(10, 124, 110, 0.1)" }}
              >
                <i className="fa-solid fa-envelope-open-text" style={{ fontSize: "36px", color: "#0A7C6E" }}></i>
              </div>
              <h3 className="fw-bold text-dark mb-2">Verify your email</h3>
              <p className="text-muted small mb-0">
                We've sent a verification link to <strong className="text-dark">{formData.email}</strong>.
                Please check your inbox to activate your account.
              </p>
            </div>

            <div className="d-flex flex-column gap-3">
              <button
                className="btn py-2 fw-bold w-100 d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: "#0A7C6E", color: "#fff", borderRadius: "8px" }}
                onClick={() => window.open("https://mail.google.com", "_blank")}
              >
                <i className="fa-brands fa-google"></i> Open Gmail
              </button>

              <button
                className="btn btn-light py-2 fw-bold border w-100"
                style={{ borderRadius: "8px", color: "#475569" }}
                onClick={() => navigate("/login")}
              >
                Go to Login Page
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}