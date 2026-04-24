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
  });

  const extractErrorMessage = (response) => {
    if (response.message) return response.message;
    if (response.errors && typeof response.errors === "object") {
      const firstErrorKey = Object.keys(response.errors)[0];
      if (firstErrorKey && Array.isArray(response.errors[firstErrorKey])) {
        return response.errors[firstErrorKey][0];
      }
    }
    return "An error occurred. Please try again.";
  };

  const fetchLatestUserProfile = async (token, authUser) => {
    const userId = extractUserId(authUser);
    if (!userId) return authUser;

    try {
      const profileRes = await fetch(`${apiURL}api/user-edit/${userId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const profileJson = await profileRes.json();
      if (!profileRes.ok) {
        toast.error(extractErrorMessage(profileJson));
        return authUser;
      }
      return profileJson?.data || authUser;
    } catch (error) {
      toast.error("Failed to refresh profile data.");
      return authUser;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let endpoint = "";
    let successMessage = "";

    if (userType === "contractor") {
      endpoint = "api/register/contractor";
      successMessage = "Resource Partner Registration successful!";
    } else if (userType === "customer") {
      endpoint = "api/register/customer";
      successMessage = "Customer Registration successful!";
    } else if (userType === "staff") {
      endpoint = "api/register/staff";
      successMessage = "Staff Registration successful!";
    }
    const payloadupdated = {
      ...formData,
      password_confirmation: formData.password,
    }
    const res = await submit(endpoint, payloadupdated);
    if (!res) return;
    await handleSuccess(res, successMessage);
  };

  const handleSuccess = async (res, successMessage) => {
    const normalized = normalizeAuthResponse(res);

    if (!normalized || !normalized.token) {
      toast.error(extractErrorMessage(res));
      return;
    }

    dispatch(setToken({ token: normalized.token }));
    const latestProfile = await fetchLatestUserProfile(
      normalized.token,
      normalized.user
    );
    dispatch(setUser({ userdata: latestProfile }));
    toast.success(successMessage);
    const redirectTo = latestProfile?.data?.is_active
      ? "/dashboard"
      : "/edit-profile";
    navigate(redirectTo);
  };

  const handleGoogleRegister = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const googleToken = tokenResponse?.access_token || tokenResponse?.code;
        if (!googleToken) {
          toast.error("Google registration response was invalid.");
          return;
        }

        const res = await submit("api/auth/google/callback", {
          credential: googleToken,
          user_type: userType,
        });

        if (!res) return;
        const normalized = normalizeAuthResponse(res);

        if (normalized && normalized.token) {
          dispatch(setToken({ token: normalized.token }));
          const latestProfile = await fetchLatestUserProfile(
            normalized.token,
            normalized.user
          );
          dispatch(setUser({ userdata: latestProfile }));
          toast.success("Google Registration successful!");
          const redirectTo = latestProfile?.data?.is_active
            ? "/dashboard"
            : "/edit-profile";
          navigate(redirectTo);
        } else {
          toast.error(extractErrorMessage(res));
        }
      } catch (error) {
        toast.error("An error occurred connecting to the server.");
      }
    },
    onError: () => toast.error("Google Registration Failed. Please try again."),
    onNonOAuthError: () =>
      toast.error("Google popup was blocked or closed. Please try again."),
  });

  return (
    <>
      <Header />
      <section className="auth-section auth-signup py-5">
        <div className="container">
          <div className="row g-5 align-items-center">

            {/* Left side - Intro text */}
            <div className="col-lg-6">
              <div className="auth-intro">
                <span className="auth-badge mb-3 d-inline-block px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-pill fw-semibold small">
                  Create Account
                </span>
                <h1 className="auth-title display-5 fw-bold mb-4">
                  Join thousands of professionals hiring and getting hired
                </h1>
                <p className="auth-copy text-muted fs-6 mb-4">
                  Build a profile that stands out, connect with employers, and
                  unlock tailored recommendations to accelerate your career
                  journey.
                </p>
                <ul className="auth-benefits list-unstyled d-flex flex-column gap-2 mb-0">
                  <li className="d-flex align-items-center gap-2 small text-dark">
                    <i className="fa-solid fa-check-circle text-success"></i>
                    <span className="fw-medium">Access curated jobs from verified companies</span>
                  </li>
                  <li className="d-flex align-items-center gap-2 small text-dark">
                    <i className="fa-solid fa-check-circle text-success"></i>
                    <span className="fw-medium">Showcase your portfolio and skill badges</span>
                  </li>
                  <li className="d-flex align-items-center gap-2 small text-dark">
                    <i className="fa-solid fa-check-circle text-success"></i>
                    <span className="fw-medium">Collaborate with hiring teams in real time</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right side - Form card */}
            <div className="col-lg-5 ms-lg-auto">
              <div className="auth-card bg-white p-4 rounded-4 shadow-sm border" style={{ maxWidth: "480px", margin: "0 auto" }}>
                <h4 className="fw-bold mb-4">Create your free account</h4>

                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small mb-1">Full Name</label>
                    <input
                      type="text"
                      className="form-control py-2 bg-light border-secondary-subtle"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small mb-1">Email Address</label>
                    <input
                      type="email"
                      className="form-control py-2 bg-light border-secondary-subtle"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold small mb-1">Password</label>
                    <input
                      type="password"
                      className="form-control py-2 bg-light border-secondary-subtle"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      required
                    />
                  </div>

                  {/* --- Sleek Inline Radio Buttons --- */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold small mb-2 d-block">I want to...</label>
                    <div className="d-flex flex-wrap gap-3">
                      <div className="form-check mb-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="roleSelection"
                          id="roleContractor"
                          value="contractor"
                          checked={userType === "contractor"}
                          onChange={() => setUserType("contractor")}
                          style={{ cursor: "pointer" }}
                        />
                        <label className="form-check-label small fw-medium text-dark" htmlFor="roleContractor" style={{ cursor: "pointer", paddingTop: "2px" }}>
                          Register as Resource Partner
                        </label>
                      </div>
                      <div className="form-check mb-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="roleSelection"
                          id="roleCustomer"
                          value="customer"
                          checked={userType === "customer"}
                          onChange={() => setUserType("customer")}
                          style={{ cursor: "pointer" }}
                        />
                        <label className="form-check-label small fw-medium text-dark" htmlFor="roleCustomer" style={{ cursor: "pointer", paddingTop: "2px" }}>
                          Book a Guard
                        </label>
                      </div>
                      <div className="form-check mb-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="roleSelection"
                          id="roleStaff"
                          value="staff"
                          checked={userType === "staff"}
                          onChange={() => setUserType("staff")}
                          style={{ cursor: "pointer" }}
                        />
                        <label className="form-check-label small fw-medium text-dark" htmlFor="roleStaff" style={{ cursor: "pointer", paddingTop: "2px" }}>
                          Apply for a Job
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary py-2 w-100 fw-bold shadow-sm"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                </form>

                {/* --- Divider --- */}
                <div className="d-flex align-items-center my-4">
                  <hr className="flex-grow-1 text-muted opacity-25" />
                  <span className="mx-3 text-muted small fw-semibold" style={{ fontSize: "11px" }}>OR</span>
                  <hr className="flex-grow-1 text-muted opacity-25" />
                </div>

                {/* --- Social Login --- */}
                <button
                  type="button"
                  onClick={() => handleGoogleRegister()}
                  className="btn btn-outline-dark py-2 w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: "18px" }} />
                  {loading
                    ? "Please wait..."
                    : `Sign up with Google`}
                </button>

                <p className="text-center mt-4 mb-0 small fw-medium">
                  Already have an account?{" "}
                  <NavLink to="/login" className="text-primary text-decoration-none fw-bold">Sign in</NavLink>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}