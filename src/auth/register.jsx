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
import googleIcon from "../assets/images/google-color.svg";

const BRAND = "#1C9A7E";
const BRAND_DARK = "#12735A";
const NAVY_DEEP = "#0A0A0A";
const NAVY = "#111111";
const NAVY_CARD = "#141414";
const NAVY_BORDER = "#262626";
const TEXT_MUTED = "#9CA3AF";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { submit, loading } = useSubmit();

  const incomingRole = location.state?.role?.toLowerCase();
  const validRoles = ["customer", "staff", "contractor"];

  const [userType, setUserType] = useState(
    validRoles.includes(incomingRole) ? incomingRole : ""
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Single popup states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingAuthAction, setPendingAuthAction] = useState(null); // 'form' or 'google'
  const [tempGoogleToken, setTempGoogleToken] = useState(null); // Holds token until role is selected
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
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

  // 1. Triggered when clicking the main 'Sign up' form button
  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setPendingAuthAction("form");
    setShowRoleModal(true);
  };

  // 2. Google Login flow
  const handleGoogleRegister = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      const googleToken = tokenResponse?.access_token || tokenResponse?.code;

      if (!googleToken) {
        toast.error("Invalid Google response.");
        return;
      }

      setIsGoogleLoading(true);

      try {
        // We do a silent fetch first to see if they are an existing user
        const checkRes = await fetch(`${apiURL}api/auth/google/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ credential: googleToken }),
        });

        const data = await checkRes.json();

        // If the backend accepts it and logs them in, bypass the popup entirely
        if (checkRes.ok) {
          const normalized = normalizeAuthResponse(data);

          if (normalized?.token) {
            dispatch(setToken({ token: normalized.token }));
            const latestProfile = await fetchLatestUserProfile(
              normalized.token,
              normalized.user
            );
            dispatch(setUser({ userdata: latestProfile }));
            toast.success("Logged in successfully!");
            setIsGoogleLoading(false);
            return;
          }
        }

        // If the response is not OK (e.g. requires role for new user), we show the popup
        setTempGoogleToken(googleToken);
        setPendingAuthAction("google");
        setShowRoleModal(true);

      } catch (error) {
        // Fallback: If the check fails, assume they are new and show the popup
        console.error("User check failed, proceeding to registration:", error);
        setTempGoogleToken(googleToken);
        setPendingAuthAction("google");
        setShowRoleModal(true);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google authentication failed.");
    }
  });

  // 3. Executes the respective registration based on the popup's Continue button
  const executeRegistration = async () => {
    setShowRoleModal(false);

    if (pendingAuthAction === "form") {
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
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'CompleteRegistration');
      }
      setShowVerifyModal(true);

    } else if (pendingAuthAction === "google") {
      try {
        const res = await submit("api/auth/google/callback", {
          credential: tempGoogleToken,
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
        console.error("Server connection error during Google signup.");
      }
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
                Build your identity.
                <br />
                <span style={{ color: BRAND }}>Join trusted teams.</span>
              </h1>

              <p className="fs-5 mb-5" style={{ maxWidth: "440px", color: TEXT_MUTED }}>
                Create your profile, connect with verified clients, and grow
                your opportunities with one secure platform.
              </p>

              <ul className="list-unstyled d-flex flex-column gap-3 mb-5">
                <li className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "36px", height: "36px", backgroundColor: "rgba(28, 154, 126, 0.14)" }}
                  >
                    <i className="fa-solid fa-check" style={{ color: BRAND }}></i>
                  </span>
                  <span style={{ color: "#D7DEE8" }}>Verified jobs and trusted clients</span>
                </li>
                <li className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "36px", height: "36px", backgroundColor: "rgba(28, 154, 126, 0.14)" }}
                  >
                    <i className="fa-solid fa-bolt" style={{ color: BRAND }}></i>
                  </span>
                  <span style={{ color: "#D7DEE8" }}>Smart matching for every shift</span>
                </li>
                <li className="d-flex align-items-center gap-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: "36px", height: "36px", backgroundColor: "rgba(28, 154, 126, 0.14)" }}
                  >
                    <i className="fa-solid fa-gauge-high" style={{ color: BRAND }}></i>
                  </span>
                  <span style={{ color: "#D7DEE8" }}>Fast onboarding and secure access</span>
                </li>
              </ul>
            </div>

            {/* FORM */}
            <div className="col-lg-6">
              <div
                className="card rounded-4 mx-auto"
                style={{
                  maxWidth: "480px",
                  backgroundColor: NAVY_CARD,
                  border: `1px solid ${NAVY_BORDER}`,
                  boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(28,154,126,0.05)",
                }}
              >
                <div className="card-body p-4 p-md-5">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
                    style={{ width: "48px", height: "48px", backgroundColor: "rgba(28, 154, 126, 0.12)" }}
                  >
                    <i className="fa-solid fa-user-plus" style={{ color: BRAND, fontSize: "20px" }}></i>
                  </div>

                  <h5 className="fw-bold mb-1 text-white">Sign up</h5>
                  <p className="small mb-4" style={{ color: TEXT_MUTED }}>
                    It only takes a few seconds.
                  </p>

                  <form onSubmit={handleInitialSubmit} noValidate>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label small fw-medium mb-1 text-white">
                          Full name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control py-2 ${errors.name ? "is-invalid" : ""}`}
                          name="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={handleChange}
                          style={{ backgroundColor: NAVY, borderColor: errors.name ? undefined : NAVY_BORDER, color: "#fff" }}
                        />
                        {errors.name && <div className="invalid-feedback" style={{ fontSize: "12px" }}>{errors.name}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-medium mb-1 text-white">
                          Phone number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          className={`form-control py-2 ${errors.phone ? "is-invalid" : ""}`}
                          name="phone"
                          placeholder="+61 400 000 000"
                          value={formData.phone}
                          onChange={handleChange}
                          maxLength={20}
                          required
                          style={{ backgroundColor: NAVY, borderColor: errors.phone ? undefined : NAVY_BORDER, color: "#fff" }}
                        />
                        {errors.phone && <div className="invalid-feedback" style={{ fontSize: "12px" }}>{errors.phone}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-medium mb-1 text-white">
                          Email address <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className={`form-control py-2 ${errors.email ? "is-invalid" : ""}`}
                          name="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          style={{ backgroundColor: NAVY, borderColor: errors.email ? undefined : NAVY_BORDER, color: "#fff" }}
                        />
                        {errors.email && <div className="invalid-feedback" style={{ fontSize: "12px" }}>{errors.email}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-medium mb-1 text-white">
                          Password <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            className={`form-control py-2 border-end-0 ${errors.password ? "is-invalid" : ""}`}
                            name="password"
                            placeholder="Min. 8 chars"
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
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                        border: "none",
                        borderRadius: "8px",
                      }}
                      disabled={loading || isGoogleLoading}
                    >
                      {loading && pendingAuthAction === "form" && <i className="fa-solid fa-spinner fa-spin"></i>}
                      {loading && pendingAuthAction === "form" ? "Please wait..." : "Sign up"}
                    </button>
                  </form>

                  <div className="d-flex align-items-center gap-3 my-4">
                    <hr className="flex-grow-1 m-0" style={{ borderColor: NAVY_BORDER, opacity: 1 }} />
                    <span className="small" style={{ color: TEXT_MUTED }}>OR</span>
                    <hr className="flex-grow-1 m-0" style={{ borderColor: NAVY_BORDER, opacity: 1 }} />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGoogleRegister()}
                    className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading || isGoogleLoading}
                    style={{
                      borderRadius: "8px",
                      backgroundColor: NAVY,
                      border: `1px solid ${NAVY_BORDER}`,
                      color: "#fff",
                    }}
                  >
                    {isGoogleLoading ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <img src={googleIcon} alt="Google" width={16} />
                    )}
                    <span className="fw-medium small">
                      {isGoogleLoading ? "Checking account..." : "Continue with Google"}
                    </span>
                  </button>

                  <p className="text-center mt-4 mb-0 small" style={{ color: TEXT_MUTED }}>
                    Already have an account?{" "}
                    <NavLink to="/login" className="fw-bold text-decoration-none" style={{ color: BRAND }}>
                      Sign in
                    </NavLink>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Role Selection Popup Overlay */}
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
                  <h3 className="fw-bold mb-2 text-white">Select account type</h3>
                  <p className="small mb-0" style={{ color: TEXT_MUTED }}>
                    Choose the profile type that best describes you to continue.
                  </p>
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                  {[
                    { key: "customer", label: "Client", desc: "I want to hire security professionals.", icon: "fa-user-tie" },
                    { key: "staff", label: "Staff", desc: "I am looking for security shifts and jobs.", icon: "fa-user-shield" },
                    { key: "contractor", label: "Resource Partner", desc: "I provide resources and contractor services.", icon: "fa-handshake" },
                  ].map((role) => {
                    const isActive = userType === role.key;
                    return (
                      <button
                        key={role.key}
                        type="button"
                        className="btn w-100 text-start d-flex align-items-center gap-3 p-3 rounded-3"
                        onClick={() => setUserType(role.key)}
                        style={{
                          border: isActive ? `2px solid ${BRAND}` : `1px solid ${NAVY_BORDER}`,
                          backgroundColor: isActive ? "rgba(28, 154, 126, 0.08)" : NAVY,
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
                      setPendingAuthAction(null);
                      setTempGoogleToken(null);
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
                      opacity: !userType || loading ? 0.6 : 1,
                      cursor: !userType || loading ? "not-allowed" : "pointer",
                    }}
                    onClick={executeRegistration}
                    disabled={loading || !userType}
                  >
                    {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                    {loading ? "Processing..." : "Continue"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Email Popup Overlay */}
      {showVerifyModal && (
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
                    style={{ width: "80px", height: "80px", backgroundColor: "rgba(28, 154, 126, 0.12)" }}
                  >
                    <i className="fa-solid fa-envelope-open-text" style={{ fontSize: "36px", color: BRAND }}></i>
                  </div>
                  <h3 className="fw-bold mb-2 text-white">Verify your email</h3>
                  <p className="small mb-0" style={{ color: TEXT_MUTED }}>
                    We've sent a verification link to{" "}
                    <strong className="text-white">{formData.email}</strong>.
                    Please check your inbox and click the link to activate your account.
                  </p>
                </div>

                <div className="d-flex flex-column gap-3">
                  <button
                    type="button"
                    className="btn py-2 fw-bold w-100"
                    style={{ borderRadius: "8px", backgroundColor: NAVY, border: `1px solid ${NAVY_BORDER}`, color: "#fff" }}
                    onClick={() => navigate("/login")}
                  >
                    Go to login page
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
          box-shadow: 0 0 0 0.2rem rgba(28, 154, 126, 0.18) !important;
          color: #fff !important;
        }
      `}</style>
    </>
  );
}