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
  const [selectedRole, setSelectedRole] = useState("");

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
    } else if (latestProfile?.user_type === "admin") {
      navigate("/dashboard");
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
                <span className="dot"></span>
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
                  <span className="auth-check-ic"><i className="fa-solid fa-check"></i></span>
                  <span>Verified shifts and trusted clients</span>
                </div>
                <div className="auth-check">
                  <span className="auth-check-ic"><i className="fa-solid fa-check"></i></span>
                  <span>Instant access to live job updates</span>
                </div>
                <div className="auth-check">
                  <span className="auth-check-ic"><i className="fa-solid fa-check"></i></span>
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

                <form onSubmit={handleSubmit} noValidate suggestions="off" autoComplete="off">
                  <div className="row g-3 mb-4">
                    <div className="col-12">
                      <label className="form-label small fw-medium mb-1">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        autoComplete="off"
                        className={`form-control py-2 auth-input ${errors.email ? "is-invalid" : ""}`}
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
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
                          className={`form-control py-2 pe-5 auth-input ${errors.password ? "is-invalid" : ""}`}
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                          minLength={8}
                        />
                        <button
                          type="button"
                          className="btn btn-sm border-0 position-absolute end-0 top-50 translate-middle-y text-muted"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex="-1"
                        >
                          <i
                            style={{ color: "#0A7C6E" }}
                            className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
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
                    className="btn w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2 auth-submit-btn"
                    disabled={loading}
                  >
                    {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </form>

                <div className="auth-divider">
                  <hr />
                  <span>OR</span>
                  <hr />
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="btn w-100 py-2 small d-flex align-items-center justify-content-center gap-2 auth-google-btn"
                  disabled={loading}
                >
                  <img src={googleIcon} alt="Google" width={16} />
                  <span className="fw-medium" style={{ fontSize: "14px" }}>
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
            backgroundColor: "rgba(10, 20, 35, 0.62)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="modal-content-custom bg-white rounded-4 p-4 p-md-5 shadow-lg mx-3"
            style={{ maxWidth: "450px", width: "100%", animation: "fadeIn 0.3s ease", borderRadius: 20 }}
          >
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: "72px", height: "72px", backgroundColor: "rgba(10, 124, 110, 0.1)" }}
              >
                <i className="fa-solid fa-key" style={{ fontSize: "28px", color: "#0A7C6E" }}></i>
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
                  className={`form-control py-2 auth-input ${forgotError ? "is-invalid" : ""}`}
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (forgotError) setForgotError("");
                  }}
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
                  className="btn py-2 fw-semibold w-50 auth-btn-ghost"
                  onClick={() => setShowForgotModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn py-2 fw-semibold w-50 text-white d-flex justify-content-center align-items-center gap-2 auth-submit-btn"
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
            backgroundColor: "rgba(10, 20, 35, 0.62)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="modal-content-custom bg-white rounded-4 p-4 p-md-5 shadow-lg mx-3"
            style={{ maxWidth: "500px", width: "100%", animation: "fadeIn 0.3s ease", borderRadius: 20 }}
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
                    className={`btn w-100 text-start d-flex align-items-center gap-3 p-3 auth-role-card ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedRole(role.key)}
                  >
                    <div className={`auth-role-ic ${isActive ? "active" : ""}`}>
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
                className="btn py-2 fw-semibold w-50 auth-btn-ghost"
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
                className="btn py-2 fw-semibold w-50 text-white d-flex justify-content-center align-items-center gap-2 auth-submit-btn"
                style={{
                  opacity: (!selectedRole || loading) ? 0.6 : 1,
                  cursor: (!selectedRole || loading) ? "not-allowed" : "pointer"
                }}
                onClick={handleRoleSelectionSubmit}
                disabled={loading || !selectedRole}
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

        :root {
          --auth-navy-950: #0a1930;
          --auth-navy-900: #0e2340;
          --auth-teal: #0A7C6E;
          --auth-teal-dark: #075e53;
          --auth-teal-tint: #f0fdf9;
          --auth-teal-border: #d1fae5;
          --auth-ink: #0f172a;
          --auth-muted: #64748b;
          --auth-line: #e2e8f0;
        }

        .auth-page {
          background-color: #f6f8fa;
          background-image:
            radial-gradient(rgba(10, 124, 110, 0.07) 1px, transparent 1px),
            radial-gradient(circle at 6% 10%, rgba(10, 124, 110, 0.08) 0%, transparent 38%),
            radial-gradient(circle at 94% 88%, rgba(10, 25, 48, 0.07) 0%, transparent 38%);
          background-size: 24px 24px, 100% 100%, 100% 100%;
          background-repeat: repeat, no-repeat, no-repeat;
          padding: 72px 0;
          min-height: calc(100vh - 90px);
          display: flex;
          align-items: center;
        }

        .auth-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          margin-bottom: 18px;
        }
        .auth-eyebrow .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--auth-teal); box-shadow: 0 0 0 4px rgba(10,124,110,0.18); }
        .auth-eyebrow .label {
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: var(--auth-teal-dark);
        }

        .auth-title {
          font-size: 2.5rem; font-weight: 800; color: var(--auth-ink); letter-spacing: -0.5px; line-height: 1.15;
        }
        .auth-line { color: var(--auth-teal); }

        .auth-description {
          margin-top: 18px; font-size: 15.5px; color: var(--auth-muted); line-height: 1.6; max-width: 420px;
        }

        .auth-checks { margin-top: 30px; display: flex; flex-direction: column; gap: 14px; }
        .auth-check { display: flex; align-items: center; gap: 12px; font-size: 14.5px; color: var(--auth-ink); font-weight: 500; }
        .auth-check-ic {
          width: 26px; height: 26px; border-radius: 50%; background: var(--auth-teal-tint); color: var(--auth-teal);
          display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0;
          border: 1px solid var(--auth-teal-border);
        }

        .auth-card {
          background: #fff; border-radius: 20px; border: 1px solid #eef1f1;
          box-shadow: 0 20px 50px -16px rgba(15,23,42,0.16);
          padding: 36px 34px; position: relative; overflow: hidden;
        }
        .auth-card::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, var(--auth-teal), var(--auth-navy-900) 60%, var(--auth-navy-950));
        }

        .auth-input {
          border: 1.5px solid var(--auth-line) !important;
          border-radius: 10px !important;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .auth-input:focus {
          border-color: var(--auth-teal) !important;
          box-shadow: 0 0 0 3px rgba(10,124,110,0.12) !important;
        }
        .auth-input.is-invalid { border-color: #dc3545 !important; }

        .auth-submit-btn {
          background: var(--auth-teal) !important;
          border: none !important;
          border-radius: 10px !important;
          color: #fff !important;
          box-shadow: 0 8px 18px -6px rgba(10,124,110,0.45);
          transition: transform 0.12s, background 0.15s, box-shadow 0.15s;
        }
        .auth-submit-btn:hover:not(:disabled) { background: var(--auth-teal-dark) !important; box-shadow: 0 10px 22px -6px rgba(10,124,110,0.5); }
        .auth-submit-btn:active:not(:disabled) { transform: scale(0.98); }

        .auth-btn-ghost {
          background: #fff !important; border: 1.5px solid var(--auth-line) !important; border-radius: 10px !important;
          color: #475569 !important; transition: background 0.15s;
        }
        .auth-btn-ghost:hover { background: #f8fafc !important; }

        .auth-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
        .auth-divider hr { flex: 1; margin: 0; border-top: 1px solid var(--auth-line); }
        .auth-divider span { font-size: 11.5px; font-weight: 700; color: var(--auth-muted); letter-spacing: 0.5px; }

        .auth-google-btn {
          background: #fff !important; border: 1.5px solid var(--auth-line) !important; border-radius: 10px !important;
          color: var(--auth-ink) !important; transition: all 0.15s;
        }
        .auth-google-btn:hover:not(:disabled) { background: #f8fafc !important; border-color: #cbd5e1 !important; }

        .auth-role-card {
          border: 1.5px solid var(--auth-line) !important; background: #fff !important; border-radius: 14px !important;
          transition: all 0.18s;
        }
        .auth-role-card:hover { border-color: var(--auth-teal-border) !important; }
        .auth-role-card.active { border: 2px solid var(--auth-teal) !important; background: var(--auth-teal-tint) !important; }
        .auth-role-ic {
          width: 48px; height: 48px; border-radius: 50%; background: #f1f5f9; color: #64748b;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.18s;
        }
        .auth-role-ic.active { background: var(--auth-teal); color: #fff; }

        @media (max-width: 991.98px) {
          .auth-page { padding: 40px 0; }
          .auth-card { padding: 28px 22px; }
        }
      `}</style>
    </>
  );
}