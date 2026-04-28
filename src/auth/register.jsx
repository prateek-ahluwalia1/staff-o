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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
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
        className="d-flex align-items-center py-5"
        style={{
          minHeight: "calc(100vh - 80px)",
          background: "#f8fafc",
        }}
      >
        <div className="container" style={{ maxWidth: "1100px" }}>
          <div className="row align-items-center g-5">

            {/* LEFT SIDE */}
            <div className="col-lg-6 d-none d-lg-flex align-items-center">
              <div>
                <h1
                  className="fw-bold mb-3"
                  style={{ fontSize: "40px", lineHeight: "1.2" }}
                >
                  Build your professional identity
                </h1>

                <p className="text-muted mb-4">
                  Join a trusted network of professionals and clients. Create
                  your profile, connect, and grow your opportunities.
                </p>

                <div className="d-flex flex-column gap-2 small">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-check text-primary"></i>
                    Verified jobs & trusted clients
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-check text-primary"></i>
                    Smart matching system
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-check text-primary"></i>
                    Real-time collaboration
                  </div>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div className="col-lg-5 ms-auto">
              <div
                className="bg-white p-4 rounded-4"
                style={{
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                  border: "1px solid #eee",
                }}
              >
                <h4 className="fw-bold mb-1">Create account</h4>
                <p className="text-muted small mb-3">
                  It only takes a few seconds
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="row g-2">

                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
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
                        className="form-control form-control-sm"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      />
                    </div>

                  </div>

                  {/* Role Pills */}
                  <div className="mt-3 mb-3">
                    <div className="d-flex gap-1 flex-wrap">
                      {[
                        { key: "contractor", label: "Resource Partner" },
                        { key: "customer", label: "Book a Guard" },
                        { key: "staff", label: " Apply for a Job" },
                      ].map((role) => (
                        <div
                          key={role.key}
                          onClick={() => !loading && setUserType(role.key)}
                          className={`px-2 py-1 rounded-pill small ${userType === role.key
                            ? "bg-primary text-white"
                            : "bg-light text-muted border border-muted"
                            }`}
                          style={{ cursor: "pointer", fontSize: "12px" }}
                        >
                          {role.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-2 small fw-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </form>

                {/* Divider */}
                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1" />
                  <span className="mx-2 small text-muted">OR</span>
                  <hr className="flex-grow-1" />
                </div>

                {/* Google */}
                <button
                  onClick={handleGoogleRegister}
                  className="btn btn-outline-dark w-100 py-2 small d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="google"
                    width={16}
                  />
                  Continue with Google
                </button>

                <p className="text-center small mt-3 mb-0">
                  Already have an account?{" "}
                  <NavLink to="/login" className="fw-semibold text-primary">
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