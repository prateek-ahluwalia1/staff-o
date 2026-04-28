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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

                <form onSubmit={handleSubmit}>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        placeholder="Full name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        placeholder="Phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="col-md-6 position-relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control pe-5"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        required
                        minLength={8}
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
                  </div>

                  {/* HIGH-UX RADIO CARDS */}
                  <div className="mb-4">
                    <p className="small fw-semibold mb-2 text-dark">I want to:</p>
                    <div className="row g-2" role="radiogroup">
                      {[
                        { key: "contractor", label: "Provide Resources", icon: "fa-handshake" },
                        { key: "customer", label: "Book a Guard", icon: "fa-shield-halved" },
                        { key: "staff", label: "Apply for a Job", icon: "fa-briefcase" },
                      ].map((role) => {
                        const isActive = userType === role.key;
                        return (
                          <div className="col-4" key={role.key}>
                            <label
                              className={`w-100 p-2 text-center rounded-3 ${isActive
                                  ? "border-primary bg-primary text-white"
                                  : "border text-muted"
                                }`}
                              style={{
                                cursor: "pointer",
                                transition: "all 0.2s ease-in-out",
                                border: isActive ? "2px solid #0d6efd" : "2px solid #e2e8f0",
                                backgroundColor: isActive ? "#0d6efd" : "#f8fafc",
                                userSelect: "none"
                              }}
                            >
                              {/* visually-hidden keeps it accessible for keyboard navigation */}
                              <input
                                type="radio"
                                name="userRole"
                                className="visually-hidden"
                                value={role.key}
                                checked={isActive}
                                onChange={() => !loading && setUserType(role.key)}
                                disabled={loading}
                              />
                              <i className={`fa-solid ${role.icon} d-block mb-1 ${isActive ? "text-white" : "text-secondary"}`} style={{ fontSize: "18px" }}></i>
                              <span style={{ fontSize: "11px", fontWeight: "600", lineHeight: "1.2", display: "block" }}>
                                {role.label}
                              </span>
                            </label>
                          </div>
                        );
                      })}
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
                      transition: "transform 0.1s"
                    }}
                    disabled={loading}
                    onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
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