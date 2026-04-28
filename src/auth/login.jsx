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

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { submit, loading } = useSubmit();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
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
    navigate("/dashboard");
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const googleToken =
          tokenResponse?.access_token || tokenResponse?.code;

        if (!googleToken) {
          toast.error("Invalid Google response.");
          return;
        }

        // Adjust to your backend Google auth callback if needed
        const res = await submit("api/auth/google/callback", {
          credential: googleToken,
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

          toast.success("Google login successful!");
          navigate("/dashboard");
        } else {
          console.error("Google login error response:", res);
        }
      } catch {
        toast.error("Server connection error during Google login.");
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
                <p className="text-muted small mb-4">Enter your credentials to continue.</p>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-4">
                    <div className="col-12">
                      <input
                        type="email"
                        className="form-control py-2"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <div className="position-relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control py-2 pe-5"
                          name="password"
                          placeholder="Password"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={loading}
                          required
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
                      <div className="text-end mt-1">
                        <NavLink
                          to="/forgot-password"
                          className="text-decoration-none text-primary"
                          style={{ fontSize: "12px", fontWeight: "500" }}
                        >
                          Forgot password?
                        </NavLink>
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
                      transition: "transform 0.1s"
                    }}
                    disabled={loading}
                    onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                    onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    {loading && <i className="fa-solid fa-spinner fa-spin"></i>}
                    {loading ? "Logging in..." : "Log In"}
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
                  <span className="text-dark fw-medium" style={{ fontSize: "14px" }}>Continue with Google</span>
                </button>

                <p className="text-center mt-4 mb-0" style={{ fontSize: "13px" }}>
                  Don't have an account?{" "}
                  <NavLink to="/register" className="fw-bold text-primary text-decoration-none">
                    Sign up
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