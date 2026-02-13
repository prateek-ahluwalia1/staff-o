import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../store/slices/authSlice";
import useSubmit from "../hooks/useSubmit";

// {
//     "token": "25|7Pk1pNvniahys36jO9I2L7nqtI4iAYp7UI8Can8Eafbff392",
//     "user": {
//         "name": "Muhammad Nauman",
//         "email": "na.uman33183@gmail.com",
//         "user_type": "contractor",
//         "is_active": false,
//         "updated_at": "2026-02-13T09:50:33.000000Z",
//         "created_at": "2026-02-13T09:50:33.000000Z",
//         "id": 18
//     }
// }

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { submit, loading, error } = useSubmit();
  // Staff state
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    company_name: "",
    phone: "",
    city: "",
  });

  // Customer state
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    city: "",
    phone: "",
  });

  // Sub Contractor state
  const [subContractorForm, setSubContractorForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    company_name: "",
    registration_number: "",
    city: "",
  });

  const handleStaffChange = (e) => {
    setStaffForm({ ...staffForm, [e.target.name]: e.target.value });
  };

  const handleCustomerChange = (e) => {
    setCustomerForm({ ...customerForm, [e.target.name]: e.target.value });
  };

  const handleSubContractorChange = (e) => {
    setSubContractorForm({
      ...subContractorForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    const res = await submit("api/register/staff", staffForm);
    if (res.success) {
      const { token, user } = res.data;
      dispatch(setToken({ token }));
      dispatch(setUser({ userdata: user }));
      navigate("/dashboard");
    }
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    const res = await submit("api/register/customer", customerForm);
    if (res.success) {
      const { token, user } = res.data;
      dispatch(setToken({ token }));
      dispatch(setUser({ userdata: user }));
      navigate("/dashboard");
    }
  };

  const handleSubContractorSubmit = async (e) => {
    e.preventDefault();
    const res = await submit("api/register/contractor", subContractorForm);
    if (res.success) {
      const { token, user } = res.data;
      dispatch(setToken({ token }));
      dispatch(setUser({ userdata: user }));
      navigate("/dashboard");
    }
  };

  return (
    <section className="auth-section auth-signup">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left side - Intro text */}
          <div className="col-lg-6">
            <div className="auth-intro">
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
                  <i className="fa-solid fa-check-circle"></i>
                  Access curated jobs from verified companies
                </li>
                <li>
                  <i className="fa-solid fa-check-circle"></i>
                  Showcase your portfolio and skill badges
                </li>
                <li>
                  <i className="fa-solid fa-check-circle"></i>
                  Collaborate with hiring teams in real time
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Form card */}
          <div className="col-lg-5 ms-lg-auto">
            <div className="auth-card">
              <h3>Create your free account</h3>
              <p className="auth-subtitle">
                Start as a candidate or an employer. Switch anytime.
              </p>

              {/* Tabs: Staff / Customer / Sub Contractor */}
              <div
                className="auth-toggle nav nav-pills"
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
                  aria-controls="registerStaff"
                  aria-selected="false"
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
                  aria-controls="registerCustomer"
                  aria-selected="false"
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
                  aria-controls="registerCandidate"
                  aria-selected="true"
                  style={{ fontSize: "12px", fontWeight: "500" }}
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
                  aria-labelledby="staff-tab"
                >
                  <form className="auth-form" onSubmit={handleStaffSubmit}>
                    <div className="row g-3">
                      <div className="col-sm-12">
                        <label htmlFor="staffName" className="form-label">
                          Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="staffName"
                          name="name"
                          value={staffForm.name}
                          onChange={handleStaffChange}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="col-sm-12">
                        <label htmlFor="staffEmail" className="form-label">
                          Email address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="staffEmail"
                          name="email"
                          value={staffForm.email}
                          onChange={handleStaffChange}
                          placeholder="name@email.com"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="staffPassword" className="form-label">
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="staffPassword"
                          name="password"
                          value={staffForm.password}
                          onChange={handleStaffChange}
                          placeholder="Create a password"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label
                          htmlFor="staffPasswordConfirmation"
                          className="form-label"
                        >
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="staffPasswordConfirmation"
                          name="password_confirmation"
                          value={staffForm.password_confirmation}
                          onChange={handleStaffChange}
                          placeholder="Confirm password"
                        />
                      </div>
                      <div className="col-sm-12">
                        <label
                          htmlFor="staffCompanyName"
                          className="form-label"
                        >
                          Company name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="staffCompanyName"
                          name="company_name"
                          value={staffForm.company_name}
                          onChange={handleStaffChange}
                          placeholder="Acme Studios"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="staffPhone" className="form-label">
                          Phone
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          id="staffPhone"
                          name="phone"
                          value={staffForm.phone}
                          onChange={handleStaffChange}
                          placeholder="+1 234 567 890"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="staffCity" className="form-label">
                          City
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="staffCity"
                          name="city"
                          value={staffForm.city}
                          onChange={handleStaffChange}
                          placeholder="New York"
                        />
                      </div>
                    </div>

                    <div className="form-check auth-policy mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="staffPolicy"
                      />
                      <label className="form-check-label" htmlFor="staffPolicy">
                        I accept the{" "}
                        <a href="#" className="auth-link">
                          Terms
                        </a>{" "}
                        and{" "}
                        <a href="#" className="auth-link">
                          Privacy Policy
                        </a>
                        .
                      </label>
                    </div>

                    {error && (
                      <div className="alert alert-danger mt-3">
                        {typeof error === "object"
                          ? Object.values(error).flat().join(", ")
                          : error}
                      </div>
                    )}

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
                  aria-labelledby="customer-tab"
                >
                  <form className="auth-form" onSubmit={handleCustomerSubmit}>
                    <div className="row g-3">
                      <div className="col-sm-12">
                        <label htmlFor="customerName" className="form-label">
                          Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="customerName"
                          name="name"
                          value={customerForm.name}
                          onChange={handleCustomerChange}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="col-sm-12">
                        <label htmlFor="customerEmail" className="form-label">
                          Email address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="customerEmail"
                          name="email"
                          value={customerForm.email}
                          onChange={handleCustomerChange}
                          placeholder="name@email.com"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label
                          htmlFor="customerPassword"
                          className="form-label"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="customerPassword"
                          name="password"
                          value={customerForm.password}
                          onChange={handleCustomerChange}
                          placeholder="Create a password"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label
                          htmlFor="customerPasswordConfirmation"
                          className="form-label"
                        >
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="customerPasswordConfirmation"
                          name="password_confirmation"
                          value={customerForm.password_confirmation}
                          onChange={handleCustomerChange}
                          placeholder="Confirm password"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="customerCity" className="form-label">
                          City
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="customerCity"
                          name="city"
                          value={customerForm.city}
                          onChange={handleCustomerChange}
                          placeholder="New York"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="customerPhone" className="form-label">
                          Phone
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          id="customerPhone"
                          name="phone"
                          value={customerForm.phone}
                          onChange={handleCustomerChange}
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>

                    <div className="form-check auth-policy mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="customerPolicy"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="customerPolicy"
                      >
                        I agree to the{" "}
                        <a href="#" className="auth-link">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="auth-link">
                          Privacy Policy
                        </a>
                        .
                      </label>
                    </div>

                    {error && (
                      <div className="alert alert-danger mt-3">
                        {typeof error === "object"
                          ? Object.values(error).flat().join(", ")
                          : error}
                      </div>
                    )}

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
                  aria-labelledby="candidate-tab"
                >
                  <form
                    className="auth-form"
                    onSubmit={handleSubContractorSubmit}
                  >
                    <div className="row g-3">
                      <div className="col-sm-12">
                        <label htmlFor="candidateName" className="form-label">
                          Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="candidateName"
                          name="name"
                          value={subContractorForm.name}
                          onChange={handleSubContractorChange}
                          placeholder="Jenkins"
                        />
                      </div>
                      <div className="col-sm-12">
                        <label htmlFor="candidateEmail" className="form-label">
                          Email address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="candidateEmail"
                          name="email"
                          value={subContractorForm.email}
                          onChange={handleSubContractorChange}
                          placeholder="name@email.com"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label
                          htmlFor="candidatePassword"
                          className="form-label"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="candidatePassword"
                          name="password"
                          value={subContractorForm.password}
                          onChange={handleSubContractorChange}
                          placeholder="Create a strong password"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label
                          htmlFor="candidatePasswordConfirmation"
                          className="form-label"
                        >
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="candidatePasswordConfirmation"
                          name="password_confirmation"
                          value={subContractorForm.password_confirmation}
                          onChange={handleSubContractorChange}
                          placeholder="Confirm password"
                        />
                      </div>
                      <div className="col-sm-12">
                        <label
                          htmlFor="candidateCompanyName"
                          className="form-label"
                        >
                          Company Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="candidateCompanyName"
                          name="company_name"
                          value={subContractorForm.company_name}
                          onChange={handleSubContractorChange}
                          placeholder="Acme Studios"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label
                          htmlFor="candidateRegistrationNumber"
                          className="form-label"
                        >
                          Registration Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="candidateRegistrationNumber"
                          name="registration_number"
                          value={subContractorForm.registration_number}
                          onChange={handleSubContractorChange}
                          placeholder="REG-123456"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="candidateCity" className="form-label">
                          City
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="candidateCity"
                          name="city"
                          value={subContractorForm.city}
                          onChange={handleSubContractorChange}
                          placeholder="New York"
                        />
                      </div>
                    </div>

                    <div className="form-check auth-policy mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="candidatePolicy"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="candidatePolicy"
                      >
                        I agree to the{" "}
                        <a href="#" className="auth-link">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="auth-link">
                          Privacy Policy
                        </a>
                        .
                      </label>
                    </div>

                    {error && (
                      <div className="alert alert-danger mt-3">
                        {typeof error === "object"
                          ? Object.values(error).flat().join(", ")
                          : error}
                      </div>
                    )}

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

              <p className="auth-switch">
                Already have an account? <a href="/login">Sign in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
