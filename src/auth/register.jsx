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

  const fetchLatestUserProfile = async (token, authUser) => {
    console.log("Fetching latest profile for user ID:", authUser);
    const userId = extractUserId(authUser);

    if (!userId) {
      return authUser;
    }

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
        toast.error(
          profileJson.errors ||
            profileJson.message ||
            "Failed to load latest profile data.",
        );
        return authUser;
      }

      return profileJson?.data || authUser;
    } catch (error) {
      toast.error("Failed to refresh profile data.");
      return authUser;
    }
  };

  // Staff state
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    company_name: "",
    phone: "",
  });

  // Customer state
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
  });

  const [subContractorForm, setSubContractorForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    company_name: "",
    registration_number: "",
  });

  const handleStaffChange = (e) =>
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
  const handleCustomerChange = (e) =>
    setCustomerForm({ ...customerForm, [e.target.name]: e.target.value });
  const handleSubContractorChange = (e) =>
    setSubContractorForm({
      ...subContractorForm,
      [e.target.name]: e.target.value,
    });

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    const res = await submit("api/register/staff", staffForm);
    if (!res) return;
    await handleSuccess(res, "Staff Registration successful!");
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    const res = await submit("api/register/customer", customerForm);
    if (!res) return;
    await handleSuccess(res, "Customer Registration successful!");
  };

  const handleSubContractorSubmit = async (e) => {
    e.preventDefault();
    const res = await submit("api/register/contractor", subContractorForm);
    if (!res) return;
    await handleSuccess(res, "Sub Contractor Registration successful!");
  };

  const handleSuccess = async (res, successMessage) => {
    const normalized = normalizeAuthResponse(res);

    if (!normalized || !normalized.token) {
      toast.error(res.message || "Registration failed. Please try again.");
      return;
    }

    if (normalized.token) {
      dispatch(setToken({ token: normalized.token }));
      const latestProfile = await fetchLatestUserProfile(
        normalized.token,
        normalized.user,
      );
      dispatch(setUser({ userdata: latestProfile }));
      toast.success(successMessage);
      navigate("/edit-profile");
    } else {
      toast.error(res.message || "Registration failed. Please try again.");
    }
  };

  const handleGoogleRegister = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const googleToken = tokenResponse?.access_token || tokenResponse?.code;

        if (!googleToken) {
          toast.error(
            "Google registration response was invalid. Please try again.",
          );
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
            normalized.user,
          );
          dispatch(setUser({ userdata: latestProfile }));
          const formattedType =
            userType.charAt(0).toUpperCase() + userType.slice(1);
          toast.success(`${formattedType} Google Registration successful!`);
          navigate("/edit-profile");
        } else {
          toast.error(
            res.message || "Google Registration failed on the server.",
          );
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
      <section className="auth-section auth-signup">
        <div className="container">
          <div className="row g-5">
            {/* Left side - Intro text */}
            <div className="col-lg-6 ">
              <div className="auth-intro mt-5">
                <span className="auth-badge">Create Account</span>
                <h1 className="auth-title">
                  Join thousands of professionals hiring and getting hired
                </h1>
                <p className="auth-copy">
                  Build a profile that stands out, connect with employers, and
                  unlock tailored recommendations to accelerate your career
                  journey.
                </p>
                <ul className="auth-benefits">
                  <li>
                    <i className="fa-solid fa-check-circle"></i> Access curated
                    jobs from verified companies
                  </li>
                  <li>
                    <i className="fa-solid fa-check-circle"></i> Showcase your
                    portfolio and skill badges
                  </li>
                  <li>
                    <i className="fa-solid fa-check-circle"></i> Collaborate
                    with hiring teams in real time
                  </li>
                </ul>
              </div>
            </div>

            {/* Right side - Form card */}
            <div className="col-lg-5 ms-lg-auto">
              <div className="auth-card">
                <h3>Create your free account</h3>
                <p className="auth-subtitle">
                  Start as a staff, customer or Sub Contractor. Switch anytime.
                  Default is Sub Contractor.
                </p>

                {/* Tabs: Staff / Customer / Sub Contractor */}
                <div
                  className="auth-toggle nav nav-pills mb-4"
                  id="registerTab"
                  role="tablist"
                >
                  <button
                    className="auth-toggle-btn nav-link"
                    id="staff-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#registerStaff"
                    type="button"
                    role="tab"
                    onClick={() => setUserType("staff")}
                  >
                    Staff
                  </button>
                  <button
                    className="auth-toggle-btn nav-link"
                    id="customer-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#registerCustomer"
                    type="button"
                    role="tab"
                    onClick={() => setUserType("customer")}
                  >
                    Customer
                  </button>
                  <button
                    className="auth-toggle-btn nav-link active"
                    id="candidate-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#registerCandidate"
                    type="button"
                    role="tab"
                    style={{ fontSize: "12px", fontWeight: "700" }}
                    onClick={() => setUserType("contractor")}
                  >
                    Sub Contractor
                  </button>
                </div>

                {/* Tab content */}
                <div className="tab-content" id="registerTabContent">
                  {/* Staff Form */}
                  <div
                    className="tab-pane fade"
                    id="registerStaff"
                    role="tabpanel"
                  >
                    <form className="auth-form" onSubmit={handleStaffSubmit}>
                      <div className="row g-3">
                        <div className="col-sm-6">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={staffForm.name}
                            onChange={handleStaffChange}
                            placeholder="Name"
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">Company name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="company_name"
                            value={staffForm.company_name}
                            onChange={handleStaffChange}
                            placeholder="Company Name"
                          />
                        </div>
                        <div className="col-sm-12">
                          <label className="form-label">Email address</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={staffForm.email}
                            onChange={handleStaffChange}
                            placeholder="Email address"
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={staffForm.password}
                            onChange={handleStaffChange}
                            placeholder="Create a password"
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">Confirm Password</label>
                          <input
                            type="password"
                            className="form-control"
                            name="password_confirmation"
                            value={staffForm.password_confirmation}
                            onChange={handleStaffChange}
                            placeholder="Confirm password"
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">Phone</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={staffForm.phone}
                            onChange={handleStaffChange}
                            placeholder="Phone Number"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary w-100 mt-4"
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Staff Account"}
                      </button>
                    </form>
                  </div>

                  {/* Customer Form */}
                  <div
                    className="tab-pane fade"
                    id="registerCustomer"
                    role="tabpanel"
                  >
                    <form className="auth-form" onSubmit={handleCustomerSubmit}>
                      <div className="row g-3">
                        <div className="col-sm-12">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={customerForm.name}
                            onChange={handleCustomerChange}
                            placeholder="Name"
                            required
                          />
                        </div>
                        <div className="col-sm-12">
                          <label className="form-label">Email address</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={customerForm.email}
                            onChange={handleCustomerChange}
                            placeholder="Email address"
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={customerForm.password}
                            onChange={handleCustomerChange}
                            placeholder="Create a password"
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">Confirm Password</label>
                          <input
                            type="password"
                            className="form-control"
                            name="password_confirmation"
                            value={customerForm.password_confirmation}
                            onChange={handleCustomerChange}
                            placeholder="Confirm password"
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">Phone</label>
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={customerForm.phone}
                            onChange={handleCustomerChange}
                            placeholder="Phone Number"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary w-100 mt-4"
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Customer Account"}
                      </button>
                    </form>
                  </div>

                  {/* Sub Contractor Form */}
                  <div
                    className="tab-pane fade show active"
                    id="registerCandidate"
                    role="tabpanel"
                  >
                    <form
                      className="auth-form"
                      onSubmit={handleSubContractorSubmit}
                    >
                      <div className="row g-3">
                        <div className="col-sm-6">
                          <label className="form-label">Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={subContractorForm.name}
                            onChange={handleSubContractorChange}
                            placeholder="Name"
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">Company Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="company_name"
                            value={subContractorForm.company_name}
                            onChange={handleSubContractorChange}
                            placeholder="Company Name"
                          />
                        </div>
                        <div className="col-sm-12">
                          <label className="form-label">Email address</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={subContractorForm.email}
                            onChange={handleSubContractorChange}
                            placeholder="Email address"
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">Password</label>
                          <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={subContractorForm.password}
                            onChange={handleSubContractorChange}
                            placeholder="Create a strong password"
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">Confirm Password</label>
                          <input
                            type="password"
                            className="form-control"
                            name="password_confirmation"
                            value={subContractorForm.password_confirmation}
                            onChange={handleSubContractorChange}
                            placeholder="Confirm password"
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label">
                            Registration Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="registration_number"
                            value={subContractorForm.registration_number}
                            onChange={handleSubContractorChange}
                            placeholder="Registration Number"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary w-100 mt-4"
                        disabled={loading}
                      >
                        {loading
                          ? "Creating..."
                          : "Create Sub Contractor Account"}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="auth-divider">
                  <span>OR</span>
                </div>

                <div className="auth-social">
                  <button
                    type="button"
                    onClick={() => handleGoogleRegister()}
                    className="auth-social-btn google"
                    disabled={loading}
                  >
                    <i className="fa-brands fa-google"></i>{" "}
                    {loading
                      ? "Please wait..."
                      : `Sign up as ${userType.charAt(0).toUpperCase() + userType.slice(1)} with Google`}
                  </button>
                </div>

                <p className="auth-switch mt-4">
                  Already have an account?{" "}
                  <NavLink to="/login">Sign in</NavLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
