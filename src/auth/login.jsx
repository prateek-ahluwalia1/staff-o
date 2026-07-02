import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
import googleIcon from "../assets/images/google-color.svg";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submit, loading } = useSubmit();

  // Login State
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  // Google Login State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [selectedRole, setSelectedRole] = useState("contractor");

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");

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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const res = await submit("api/login", formData);
    if (!res) return;

    const normalized = normalizeAuthResponse(res);

    if (!normalized?.token) {
      console.error("Login error response:", res);
      return;
    }

    dispatch(setToken({ token: normalized.token }));

    const latestProfile = await fetchLatestUserProfile(
      normalized.token,
      normalized.user
    );

    dispatch(setUser({ userdata: latestProfile }));

    toast.success("Logged in successfully!");

    if (latestProfile?.user_type === "customer") {
      navigate("/add-job");
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const googleToken = tokenResponse?.access_token || tokenResponse?.code;

        if (!googleToken) {
          toast.error("Invalid Google response.");
          return;
        }

        const res = await submit(
          "api/auth/google/callback",
          {
            credential: googleToken,
          },
          { silentErrorToast: true }
        );

        const normalized = normalizeAuthResponse(res);

        if (normalized?.token) {
          dispatch(setToken({ token: normalized.token }));

          const latestProfile = await fetchLatestUserProfile(
            normalized.token,
            normalized.user
          );

          dispatch(setUser({ userdata: latestProfile }));

          toast.success("Google sign in successful!");

          if (latestProfile?.user_type === "customer") {
            navigate("/add-job");
          }
        } else {
          // --- NEW USER (OR LOGIN FAILED): OPEN REGISTRATION MODAL ---
          setPendingGoogleToken(googleToken);
          setShowRoleModal(true);
        }
      } catch (err) {
        console.error("Google Login Error:", err);
      }
    },
  });

  const handleRoleSelectionSubmit = async () => {
    try {
      const res = await submit(
        "api/auth/google/callback",
        {
          credential: pendingGoogleToken,
          user_type: selectedRole,
        },
        { silentErrorToast: true }
      );

      if (!res) return;

      const normalized = normalizeAuthResponse(res);

      if (normalized?.token) {
        dispatch(setToken({ token: normalized.token }));

        const latestProfile = await fetchLatestUserProfile(
          normalized.token,
          normalized.user
        );

        dispatch(setUser({ userdata: latestProfile }));

        toast.success("Account created and logged in successfully!");
        setShowRoleModal(false);
        setPendingGoogleToken(null);

        if (latestProfile?.user_type === "customer") {
          navigate("/add-job");
        }
      }
    } catch {
      console.error("Server connection error during account creation.");
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim()) {
      setForgotError("Email address is required.");
      return;
    } else if (!emailRegex.test(forgotEmail)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    setForgotError("");

    try {
      const res = await submit("api/password-reset-email", {
        email: forgotEmail,
      });

      if (res && res.success !== false) {
        toast.success(res.message || "Password reset link sent successfully!");
        setShowForgotModal(false);
        setForgotEmail("");
      }
    } catch (error) {
      console.error("Server error. Could not send reset link.", error);
    }
  };

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
                Secure your work.
                <br />
                <span className="auth-line">Access trusted shifts.</span>
              </h1>
              <p className="auth-description" style={{ textTransform: "none" }}>
                Sign in to manage your profile, assignments, and verified
                opportunities from one secure platform.
              </p>

              <div className="auth-checks" style={{ textTransform: "none" }}>
                <div className="auth-check">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Verified shifts and trusted clients</span>
                </div>
                <div className="auth-check">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Instant access to live job updates</span>
                </div>
                <div className="auth-check">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>Smart tools for your daily workflow</span>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="col-lg-6">
              <div className="auth-card">
                <h5 className="fw-bold mb-1">Sign in</h5>
                <p className="text-muted small mb-4" style={{ textTransform: "none" }}>
                  Please enter your email and password.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3 mb-4">
                    <div className="col-12">
                      <label className="form-label small fw-medium mb-1">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className={`form-control py-2 ${errors.email ? "is-invalid" : ""}`}
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={100}
                        style={{ border: "1px solid #0A7C6E" }}
                      />
                      {errors.email && (
                        <div className="invalid-feedback" style={{ fontSize: "12px" }}>
                          {errors.email}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-medium mb-0">
                          Password <span className="text-danger">*</span>
                        </label>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-medium"
                          style={{ color: "#0A7C6E", fontSize: "13px" }}
                          onClick={() => {
                            setForgotEmail(formData.email);
                            setForgotError("");
                            setShowForgotModal(true);
                          }}
                        >
                          Forgot password?
                        </button>
                      </div>

                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control py-2 pe-5 ${errors.password ? "is-invalid" : ""}`}
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                          minLength={8}
                          style={{ border: "1px solid #0A7C6E" }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm border-0 position-absolute end-0 top-50 translate-middle-y text-muted"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex="-1"
                        >
                          <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                      </div>

                      {errors.password && (
                        <div className="invalid-feedback d-block" style={{ fontSize: "12px", marginTop: "0.25rem" }}>
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2"
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
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <div className="auth-divider">
                  <hr />
                  <span>OR</span>
                  <hr />
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="btn border auth-google-btn w-100 py-2 small d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                  style={{ borderRadius: "6px" }}
                >
                  <img src={googleIcon} alt="Google" width={16} />
                  <span className="text-white fw-medium" style={{ fontSize: "14px" }}>
                    Continue with Google
                  </span>
                </button>

                <p className="text-center mt-4 mb-0" style={{ fontSize: "13px", textTransform: "none" }}>
                  Don't have an account?{" "}
                  <NavLink to="/register" className="fw-bold text-decoration-none" style={{ color: "#0A7C6E" }}>
                    Sign up
                  </NavLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FORGOT PASSWORD MODAL --- */}
      {showForgotModal && (
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
                <i className="fa-solid fa-key" style={{ fontSize: "32px", color: "#0A7C6E" }}></i>
              </div>
              <h3 className="fw-bold text-dark mb-2">Reset Password</h3>
              <p className="text-muted small mb-0" style={{ textTransform: "none" }}>
                Enter your registered email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} noValidate>
              <div className="mb-4">
                <label className="form-label small fw-medium mb-1">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control py-2 ${forgotError ? "is-invalid" : ""}`}
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (forgotError) setForgotError("");
                  }}
                  style={{ border: "1px solid #0A7C6E" }}
                />
                {forgotError && (
                  <div className="invalid-feedback" style={{ fontSize: "12px" }}>
                    {forgotError}
                  </div>
                )}
              </div>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-light py-2 fw-semibold w-50"
                  style={{ borderRadius: "8px", color: "#475569" }}
                  onClick={() => setShowForgotModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn py-2 fw-semibold w-50 text-white d-flex justify-content-center align-items-center gap-2"
                  style={{ borderRadius: "8px", backgroundColor: "#0A7C6E" }}
                  disabled={loading}
                >
                  {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                  {loading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ROLE SELECTION MODAL --- */}
      {showRoleModal && (
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
            style={{ maxWidth: "500px", width: "100%", animation: "fadeIn 0.3s ease" }}
          >
            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark mb-2">Complete your setup</h3>
              <p className="text-muted small mb-0" style={{ textTransform: "none" }}>
                It looks like you don't have an account yet. Please select your account type to securely create your profile and continue.
              </p>
            </div>

            <div className="d-flex flex-column gap-3 mb-4">
              {[
                { key: "customer", label: "Client", desc: "I want to hire security professionals.", icon: "fa-user-tie" },
                { key: "staff", label: "Staff", desc: "I am looking for security shifts & jobs.", icon: "fa-user-shield" },
                { key: "contractor", label: "Resource Partner", desc: "I provide resources and contractor services.", icon: "fa-handshake" },
              ].map((role) => {
                const isActive = selectedRole === role.key;
                return (
                  <button
                    key={role.key}
                    type="button"
                    className="btn w-100 text-start d-flex align-items-center gap-3 p-3"
                    onClick={() => setSelectedRole(role.key)}
                    style={{
                      border: isActive ? "2px solid #0A7C6E" : "1px solid #e2e8f0",
                      backgroundColor: isActive ? "rgba(10, 124, 110, 0.05)" : "#fff",
                      borderRadius: "10px",
                      transition: "all 0.2s"
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: "48px", height: "48px",
                        backgroundColor: isActive ? "#0A7C6E" : "#f1f5f9",
                        color: isActive ? "#fff" : "#64748b"
                      }}
                    >
                      <i className={`fa-solid ${role.icon} fs-5`}></i>
                    </div>
                    <div>
                      <h6 className="mb-1 fw-bold" style={{ color: isActive ? "#0A7C6E" : "#334155" }}>
                        {role.label}
                      </h6>
                      <p className="mb-0 small text-muted" style={{ textTransform: "none" }}>{role.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="d-flex gap-3">
              <button
                type="button"
                className="btn btn-light py-2 fw-semibold w-50"
                style={{ borderRadius: "8px", color: "#475569" }}
                onClick={() => {
                  setShowRoleModal(false);
                  setPendingGoogleToken(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn py-2 fw-semibold w-50 text-white d-flex justify-content-center align-items-center gap-2"
                style={{ borderRadius: "8px", backgroundColor: "#0A7C6E" }}
                onClick={handleRoleSelectionSubmit}
                disabled={loading}
              >
                {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                {loading ? "Creating..." : "Sign up"}
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