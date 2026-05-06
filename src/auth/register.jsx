import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { submit, loading } = useSubmit();

  const [userType, setUserType] = useState("contractor");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // State to hold validation errors
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // Clear error for a specific field when the user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";

    // Phone validation removed to make it optional

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run validation before submitting
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
    navigate("/login");
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
              <h1 className="fw-bold mb-2" style={{ fontSize: "36px", lineHeight: "1.2" }}>
                Build your professional identity
              </h1>
              <p className="text-muted mb-4 small">
                Join a trusted network of professionals and clients. Create
                your profile, connect, and grow your opportunities.
              </p>

              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-primary fs-6"></i>
                  <span>Verified jobs & trusted clients</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-primary fs-6"></i>
                  <span>Smart matching system</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-check text-primary fs-6"></i>
                  <span>Real-time collaboration</span>
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
                <h5 className="fw-bold mb-1">Create an account</h5>
                <p className="text-muted small mb-3">It only takes a few seconds.</p>

                <form onSubmit={handleSubmit} noValidate>
                  {/* 2x2 Grid to save vertical space */}
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-medium mb-1">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        name="name"
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {errors.name && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{errors.name}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-medium mb-1">
                        Phone Number <span className="text-muted fw-normal ms-1" style={{ fontSize: '0.85em' }}>(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        placeholder="e.g. +1234567890"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      {/* Removed error feedback for phone since it's optional */}
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
                        disabled={loading}
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
                          placeholder="Min. 8 characters"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="btn btn-sm border-0 position-absolute end-0 top-50 translate-middle-y text-muted"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex="-1"
                        >
                          <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                        {errors.password && <div className="invalid-feedback" style={{ fontSize: '12px' }}>{errors.password}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Compact Role Selection */}
                  <div className="mb-3 mt-1">
                    <label className="form-label small fw-medium mb-2">
                      Account Type <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-2 flex-wrap" role="radiogroup">
                      {[
                        { key: "customer", label: "Book a Guard" },
                        { key: "staff", label: "Apply for a Job" },
                        { key: "contractor", label: "Resource Partner" },
                      ].map((role) => (
                        <label
                          key={role.key}
                          className={`btn btn-sm rounded-pill px-3 py-1 ${userType === role.key
                            ? "btn-primary text-white"
                            : "btn-light text-muted border"
                            }`}
                          style={{ cursor: "pointer", transition: "all 0.2s", fontSize: "13px" }}
                        >
                          <input
                            type="radio"
                            name="userRole"
                            className="visually-hidden"
                            value={role.key}
                            checked={userType === role.key}
                            onChange={() => !loading && setUserType(role.key)}
                            disabled={loading}
                          />
                          {role.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-2 fw-semibold d-flex justify-content-center align-items-center gap-2 mt-2"
                    style={{
                      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#fff",
                    }}
                    disabled={loading}
                  >
                    {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </form>

                {/* Compact Divider */}
                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1 text-muted opacity-25 m-0" />
                  <span className="mx-2" style={{ fontSize: "11px", color: "#9ca3af" }}>OR</span>
                  <hr className="flex-grow-1 text-muted opacity-25 m-0" />
                </div>

                {/* Google Button */}
                <button
                  onClick={handleGoogleRegister}
                  className="btn btn-light border w-100 py-2 small d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                  style={{ borderRadius: "6px" }}
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="Google"
                    width={16}
                  />
                  <span className="text-dark fw-medium" style={{ fontSize: "14px" }}>Google</span>
                </button>

                <p className="text-center mt-3 mb-0" style={{ fontSize: "13px" }}>
                  Already have an account?{" "}
                  <NavLink to="/login" className="fw-bold text-primary text-decoration-none">
                    Sign in
                  </NavLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}