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

const BRAND = "#1C9A7E";
const BRAND_DARK = "#12735A";
const NAVY_DEEP = "#0A0A0A";
const NAVY = "#111111";
const NAVY_CARD = "#141414";
const NAVY_BORDER = "#262626";
const TEXT_MUTED = "#9CA3AF";

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
      <section
        className="position-relative overflow-hidden auth-page-dark"
        style={{
          minHeight: "100vh",
          paddingTop: "160px",
          paddingBottom: "64px",
          background: `radial-gradient(900px 480px at 12% 10%, rgba(28, 154, 126, 0.14), transparent 60%), ${NAVY_DEEP}`,
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <div
          className="position-absolute top-0 end-0 d-none d-lg-block"
          style={{
            width: "480px",
            height: "480px",
            background: "radial-gradient(circle, rgba(28,154,126,0.10) 0%, transparent 70%)",
            transform: "translate(25%, -35%)",
            pointerEvents: "none",
          }}
        ></div>

        <div className="container position-relative" style={{ maxWidth: "1140px" }}>
          <div className="row align-items-center g-5">
            {/* LEFT: BRAND / HERO COPY */}
            <div className="col-lg-6 d-none d-lg-block text-white position-relative">
              <div
                className="position-absolute"
                style={{
                  top: "-24px",
                  left: "-8px",
                  width: "32px",
                  height: "32px",
                  borderTop: `2px solid ${BRAND}`,
                  borderLeft: `2px solid ${BRAND}`,
                  opacity: 0.8,
                }}
              ></div>

              <h1 className="display-3 fw-bold mb-4" style={{ lineHeight: 1.08 }}>
                Secure your work.
                <br />
                <span style={{ color: BRAND }}>Access trusted shifts.</span>
              </h1>

              <p className="fs-5 mb-5" style={{ maxWidth: "440px", color: TEXT_MUTED }}>
                Sign in to manage your profile, assignments, and verified
                opportunities from one secure platform.
              </p>

              <ul className="list-unstyled d-flex flex-column gap-3 mb-5">
                <li className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "36px", height: "36px", backgroundColor: "rgba(15, 191, 166, 0.14)" }}
                  >
                    <i className="fa-solid fa-check" style={{ color: BRAND }}></i>
                  </span>
                  <span style={{ color: "#D7DEE8" }}>Verified shifts and trusted clients</span>
                </li>
                <li className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "36px", height: "36px", backgroundColor: "rgba(15, 191, 166, 0.14)" }}
                  >
                    <i className="fa-solid fa-bolt" style={{ color: BRAND }}></i>
                  </span>
                  <span style={{ color: "#D7DEE8" }}>Instant access to live job updates</span>
                </li>
                <li className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "36px", height: "36px", backgroundColor: "rgba(15, 191, 166, 0.14)" }}
                  >
                    <i className="fa-solid fa-gauge-high" style={{ color: BRAND }}></i>
                  </span>
                  <span style={{ color: "#D7DEE8" }}>Smart tools for your daily workflow</span>
                </li>
              </ul>
            </div>

            {/* FORM */}
            <div className="col-lg-6">
              <div
                className="card rounded-4 mx-auto"
                style={{
                  maxWidth: "460px",
                  backgroundColor: NAVY_CARD,
                  border: `1px solid ${NAVY_BORDER}`,
                  boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(15,191,166,0.05)",
                }}
              >
                <div className="card-body p-4 p-md-5">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style={{ width: "48px", height: "48px", backgroundColor: "rgba(15, 191, 166, 0.12)" }}
                  >
                    <i className="fa-solid fa-user-lock" style={{ color: BRAND, fontSize: "20px" }}></i>
                  </div>

                  <h5 className="fw-bold mb-1 text-white">Sign in</h5>
                  <p className="small mb-4" style={{ color: TEXT_MUTED }}>
                    Please enter your email and password.
                  </p>

                  <form onSubmit={handleSubmit} noValidate suggestions="off" autoComplete="off">
                    <div className="mb-3">
                      <label className="form-label small fw-medium mb-1 text-white">
                        Email address <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{
                            backgroundColor: NAVY,
                            borderColor: errors.email ? undefined : NAVY_BORDER,
                            borderRight: "none",
                          }}
                        >
                          <i className="fa-solid fa-envelope" style={{ color: BRAND }}></i>
                        </span>
                        <input
                          type="email"
                          autoComplete="off"
                          className={`form-control py-2 border-start-0 ${errors.email ? "is-invalid" : ""}`}
                          name="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          style={{
                            backgroundColor: NAVY,
                            borderColor: errors.email ? undefined : NAVY_BORDER,
                            borderLeft: "none",
                            color: "#fff",
                          }}
                        />
                        {errors.email && (
                          <div className="invalid-feedback" style={{ fontSize: "12px" }}>
                            {errors.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-medium mb-0 text-white">
                          Password <span className="text-danger">*</span>
                        </label>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-medium small"
                          style={{ color: BRAND }}
                          onClick={() => {
                            setForgotEmail(formData.email);
                            setForgotError("");
                            setShowForgotModal(true);
                          }}
                        >
                          Forgot password?
                        </button>
                      </div>

                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{
                            backgroundColor: NAVY,
                            borderColor: errors.password ? undefined : NAVY_BORDER,
                            borderRight: "none",
                          }}
                        >
                          <i className="fa-solid fa-lock" style={{ color: BRAND }}></i>
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control py-2 border-start-0 border-end-0 ${errors.password ? "is-invalid" : ""}`}
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                          minLength={8}
                          style={{ backgroundColor: NAVY, borderColor: errors.password ? undefined : NAVY_BORDER, color: "#fff" }}
                        />
                        <span
                          className="input-group-text"
                          role="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            backgroundColor: NAVY,
                            borderColor: errors.password ? undefined : NAVY_BORDER,
                            borderLeft: "none",
                          }}
                        >
                          <i
                            style={{ color: BRAND }}
                            className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                          ></i>
                        </span>
                        {errors.password && (
                          <div className="invalid-feedback d-block" style={{ fontSize: "12px" }}>
                            {errors.password}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                        border: "none",
                        borderRadius: "8px",
                      }}
                      disabled={loading}
                    >
                      {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                      {loading ? "Signing in..." : "Sign in"}
                    </button>
                  </form>

                  <div className="d-flex align-items-center gap-3 my-4">
                    <hr className="flex-grow-1 m-0" style={{ borderColor: NAVY_BORDER, opacity: 1 }} />
                    <span className="small" style={{ color: TEXT_MUTED }}>OR</span>
                    <hr className="flex-grow-1 m-0" style={{ borderColor: NAVY_BORDER, opacity: 1 }} />
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                    style={{
                      borderRadius: "8px",
                      backgroundColor: NAVY,
                      border: `1px solid ${NAVY_BORDER}`,
                      color: "#fff",
                    }}
                  >
                    <img src={googleIcon} alt="Google" width={16} />
                    <span className="fw-medium small">Continue with Google</span>
                  </button>

                  <p className="text-center mt-4 mb-0 small" style={{ color: TEXT_MUTED }}>
                    Don't have an account?{" "}
                    <NavLink to="/register" className="fw-bold text-decoration-none" style={{ color: BRAND }}>
                      Sign up
                    </NavLink>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FORGOT PASSWORD MODAL --- */}
      {showForgotModal && (
        <div
          className="modal show d-block auth-page-dark"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.7)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content rounded-4"
              style={{ backgroundColor: NAVY_CARD, border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
            >
              <div className="modal-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: "80px", height: "80px", backgroundColor: "rgba(15, 191, 166, 0.12)" }}
                  >
                    <i className="fa-solid fa-key" style={{ fontSize: "32px", color: BRAND }}></i>
                  </div>
                  <h3 className="fw-bold mb-2 text-white">Reset password</h3>
                  <p className="small mb-0" style={{ color: TEXT_MUTED }}>
                    Enter your registered email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} noValidate>
                  <div className="mb-4">
                    <label className="form-label small fw-medium mb-1 text-white">
                      Email address <span className="text-danger">*</span>
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
                      style={{ backgroundColor: NAVY, borderColor: forgotError ? undefined : NAVY_BORDER, color: "#fff" }}
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
                      className="btn py-2 fw-semibold w-50"
                      style={{ borderRadius: "8px", backgroundColor: NAVY, border: `1px solid ${NAVY_BORDER}`, color: "#fff" }}
                      onClick={() => setShowForgotModal(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn py-2 fw-semibold w-50 text-white d-flex justify-content-center align-items-center gap-2"
                      style={{ borderRadius: "8px", background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, border: "none" }}
                      disabled={loading}
                    >
                      {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                      {loading ? "Sending..." : "Send link"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ROLE SELECTION MODAL --- */}
      {showRoleModal && (
        <div
          className="modal show d-block auth-page-dark"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.7)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content rounded-4"
              style={{ backgroundColor: NAVY_CARD, border: `1px solid ${NAVY_BORDER}`, boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)" }}
            >
              <div className="modal-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <h3 className="fw-bold mb-2 text-white">Complete your setup</h3>
                  <p className="small mb-0" style={{ color: TEXT_MUTED }}>
                    It looks like you don't have an account yet. Please select your account type to securely create your profile and continue.
                  </p>
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                  {[
                    { key: "customer", label: "Client", desc: "I want to hire security professionals.", icon: "fa-user-tie" },
                    { key: "staff", label: "Staff", desc: "I am looking for security shifts and jobs.", icon: "fa-user-shield" },
                    { key: "contractor", label: "Resource Partner", desc: "I provide resources and contractor services.", icon: "fa-handshake" },
                  ].map((role) => {
                    const isActive = selectedRole === role.key;
                    return (
                      <button
                        key={role.key}
                        type="button"
                        className="btn w-100 text-start d-flex align-items-center gap-3 p-3 rounded-3"
                        onClick={() => setSelectedRole(role.key)}
                        style={{
                          border: isActive ? `2px solid ${BRAND}` : `1px solid ${NAVY_BORDER}`,
                          backgroundColor: isActive ? "rgba(15, 191, 166, 0.08)" : NAVY,
                        }}
                      >
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                          style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: isActive ? BRAND : "#1B2A40",
                            color: isActive ? "#0A1120" : TEXT_MUTED,
                          }}
                        >
                          <i className={`fa-solid ${role.icon} fs-5`}></i>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-bold" style={{ color: isActive ? BRAND : "#fff" }}>
                            {role.label}
                          </h6>
                          <p className="mb-0 small" style={{ color: TEXT_MUTED }}>{role.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="d-flex gap-3">
                  <button
                    type="button"
                    className="btn py-2 fw-semibold w-50"
                    style={{ borderRadius: "8px", backgroundColor: NAVY, border: `1px solid ${NAVY_BORDER}`, color: "#fff" }}
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
                    style={{
                      borderRadius: "8px",
                      background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                      border: "none",
                      opacity: !selectedRole || loading ? 0.6 : 1,
                      cursor: !selectedRole || loading ? "not-allowed" : "pointer",
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
          </div>
        </div>
      )}

      <style>{`
        .auth-page-dark .form-control::placeholder {
          color: ${TEXT_MUTED};
          opacity: 1;
        }
        .auth-page-dark .form-control:focus {
          background-color: ${NAVY} !important;
          border-color: ${BRAND} !important;
          box-shadow: 0 0 0 0.2rem rgba(15, 191, 166, 0.18) !important;
          color: #fff !important;
        }
      `}</style>
    </>
  );
}