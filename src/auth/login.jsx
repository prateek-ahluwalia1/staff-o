import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../store/slices/authSlice";
import useSubmit from "../hooks/useSubmit";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import Header from "../components/header";
import { apiURL } from "../utils/exports";
import {
  normalizeAuthResponse,
  extractUserId,
} from "../utils/authResponseNormalizer";

export default function Login() {
  const dispatch = useDispatch();
  const { submit, loading } = useSubmit();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [selectedRole, setSelectedRole] = useState("contractor");

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
  };

  // --- UPDATED GOOGLE LOGIN HANDLER ---
  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const googleToken = tokenResponse?.access_token || tokenResponse?.code;

        if (!googleToken) {
          toast.error("Invalid Google response.");
          return;
        }

        const res = await submit("api/auth/google/callback", {
          credential: googleToken,
        }, { silentErrorToast: true });

        if (!res) return;

        if (res?.data?.success === false && res?.data?.message === "User not found.") {
          setPendingGoogleToken(googleToken);
          setShowRoleModal(true);
          return;
        }

        const normalized = normalizeAuthResponse(res);

        if (normalized?.token) {
          dispatch(setToken({ token: normalized.token }));

          const latestProfile = await fetchLatestUserProfile(
            normalized.token,
            normalized.user
          );

          dispatch(setUser({ userdata: latestProfile }));

          toast.success("Google login successful!");
        } else {
          console.error("Google login error response:", res);
        }
      } catch {
        toast.error("Server connection error during Google login.");
      }
    },
  });

  const handleRoleSelectionSubmit = async () => {
    try {
      const res = await submit("api/auth/google/callback", {
        credential: pendingGoogleToken,
        user_type: selectedRole,
      }, { silentErrorToast: true });

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
      } else {
        toast.error(res.message || "Could not complete account creation.");
      }
    } catch {
      toast.error("Server connection error during account creation.");
    }
  };

  return (
    <>
      <Header />

      <section
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "calc(100vh - 80px)",
          background: "#f8fafc",
          padding: "2rem 0",
        }}
      >
        <div className="container" style={{ maxWidth: "1000px" }}>
          <div className="row align-items-center g-4">
            {/* LEFT SIDE */}
            <div className="col-lg-6 d-none d-lg-block">
              <h1
                className="fw-bold mb-2"
                style={{ fontSize: "36px", lineHeight: "1.2" }}
              >
                Welcome back to your network
              </h1>
              <p className="text-muted mb-4 small">
                Log in to access your dashboard, manage your opportunities, and
                stay connected with your professional network.
              </p>

              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-primary fs-6"></i>
                  <span>Access your personalized dashboard</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-primary fs-6"></i>
                  <span>Review new opportunities & messages</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-primary fs-6"></i>
                  <span>Manage your active connections</span>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="col-lg-6">
              <div
                className="bg-white p-4 rounded-4"
                style={{
                  boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
                  border: "1px solid #f1f5f9",
                }}
              >
                <h5 className="fw-bold mb-1">Log in to your account</h5>
                <p className="text-muted small mb-4">
                  Enter your credentials to continue.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3 mb-4">
                    <div className="col-12">
                      <label className="form-label small fw-medium mb-1">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className={`form-control py-2 ${errors.email ? "is-invalid" : ""
                          }`}
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={100}
                        disabled={loading}
                      />
                      {errors.email && (
                        <div
                          className="invalid-feedback"
                          style={{ fontSize: "12px" }}
                        >
                          {errors.email}
                        </div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-medium mb-1">
                        Password <span className="text-danger">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className={`form-control py-2 pe-5 ${errors.password ? "is-invalid" : ""
                            }`}
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                          maxLength={50}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="btn btn-sm border-0 position-absolute end-0 top-50 translate-middle-y text-muted"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex="-1"
                        >
                          <i
                            className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"
                              }`}
                          ></i>
                        </button>
                        {errors.password && (
                          <div
                            className="invalid-feedback"
                            style={{ fontSize: "12px" }}
                          >
                            {errors.password}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#fff",
                      transition: "transform 0.1s",
                    }}
                    disabled={loading}
                    onMouseDown={(e) =>
                      (e.currentTarget.style.transform = "scale(0.98)")
                    }
                    onMouseUp={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    {loading && (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    )}
                    {loading ? "Logging in..." : "Log In"}
                  </button>
                </form>

                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1 text-muted opacity-25 m-0" />
                  <span
                    className="mx-2"
                    style={{ fontSize: "11px", color: "#9ca3af" }}
                  >
                    OR
                  </span>
                  <hr className="flex-grow-1 text-muted opacity-25 m-0" />
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="btn btn-light border w-100 py-2 small d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                  style={{ borderRadius: "6px" }}
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    width={16}
                  />
                  <span
                    className="text-dark fw-medium"
                    style={{ fontSize: "14px" }}
                  >
                    Continue with Google
                  </span>
                </button>

                <p
                  className="text-center mt-4 mb-0"
                  style={{ fontSize: "13px" }}
                >
                  Don't have an account?{" "}
                  <NavLink
                    to="/register"
                    className="fw-bold text-primary text-decoration-none"
                  >
                    Sign up
                  </NavLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ROLE SELECTION MODAL --- */}
      {showRoleModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040, backgroundColor: "rgba(0,0,0,0.5)" }}
          ></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Complete your setup</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowRoleModal(false);
                      setPendingGoogleToken(null);
                    }}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body pt-3 pb-4 px-4">
                  <p className="text-muted small mb-4">
                    It looks like you don't have an account yet. Please select
                    your account type to securely create your profile and
                    continue.
                  </p>

                  <label className="form-label small fw-medium mb-2">
                    Account Type <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex gap-2 flex-wrap mb-4" role="radiogroup">
                    {[
                      { key: "customer", label: "Book a Guard" },
                      { key: "staff", label: "Apply for a Job" },
                      { key: "contractor", label: "Resource Partner" },
                    ].map((role) => (
                      <label
                        key={role.key}
                        className={`btn btn-sm rounded-pill px-3 py-2 ${selectedRole === role.key
                          ? "btn-primary text-white"
                          : "btn-light text-muted border"
                          }`}
                        style={{
                          cursor: "pointer",
                          transition: "all 0.2s",
                          fontSize: "13px",
                        }}
                      >
                        <input
                          type="radio"
                          name="modalUserRole"
                          className="visually-hidden"
                          value={role.key}
                          checked={selectedRole === role.key}
                          onChange={() => !loading && setSelectedRole(role.key)}
                          disabled={loading}
                        />
                        {role.label}
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleRoleSelectionSubmit}
                    className="btn w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#fff",
                    }}
                    disabled={loading}
                  >
                    {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                    {loading ? "Creating..." : "Create Account & Login"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}