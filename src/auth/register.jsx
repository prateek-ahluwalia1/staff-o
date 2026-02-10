// src/auth/register.jsx
import React from 'react';

export default function Register() {
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

              {/* Social signup buttons */}
              <div className="auth-social">
                <a href="#" className="auth-social-btn google">
                  <i className="fa-brands fa-google"></i> Sign up with Google
                </a>
                <a href="#" className="auth-social-btn linkedin">
                  <i className="fa-brands fa-linkedin"></i> Sign up with LinkedIn
                </a>
              </div>

              <div className="auth-divider">
                <span>or</span>
              </div>

              {/* Tabs: Candidate / Employer */}
              <div className="auth-toggle nav nav-pills" id="registerTab" role="tablist">
                <button
                  className="auth-toggle-btn nav-link active"
                  id="candidate-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#registerCandidate"
                  type="button"
                  role="tab"
                  aria-controls="registerCandidate"
                  aria-selected="true"
                >
                  Candidate
                </button>
                <button
                  className="auth-toggle-btn nav-link"
                  id="employer-tab"
                  data-bs-toggle="pill"
                  data-bs-target="#registerEmployer"
                  type="button"
                  role="tab"
                  aria-controls="registerEmployer"
                  aria-selected="false"
                >
                  Employer
                </button>
              </div>

              {/* Tab content */}
              <div className="tab-content" id="registerTabContent">
                {/* Candidate Form */}
                <div
                  className="tab-pane fade show active"
                  id="registerCandidate"
                  role="tabpanel"
                  aria-labelledby="candidate-tab"
                >
                  <form className="auth-form">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label htmlFor="candidateFirst" className="form-label">
                          First name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="candidateFirst"
                          placeholder="Samantha"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="candidateLast" className="form-label">
                          Last name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="candidateLast"
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
                          placeholder="name@email.com"
                        />
                      </div>
                      <div className="col-sm-12">
                        <label htmlFor="candidatePassword" className="form-label">
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="candidatePassword"
                          placeholder="Create a strong password"
                        />
                      </div>
                      <div className="col-sm-12">
                        <label htmlFor="candidateRole" className="form-label">
                          Desired role
                        </label>
                        <select className="form-select" id="candidateRole">
                          <option selected>Product Designer</option>
                          <option>Frontend Developer</option>
                          <option>Data Analyst</option>
                          <option>Marketing Specialist</option>
                          <option>Customer Success</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-check auth-policy mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="candidatePolicy"
                      />
                      <label className="form-check-label" htmlFor="candidatePolicy">
                        I agree to the{' '}
                        <a href="#" className="auth-link">Terms of Service</a> and{' '}
                        <a href="#" className="auth-link">Privacy Policy</a>.
                      </label>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mt-4">
                      Create Candidate Account
                    </button>
                  </form>
                </div>

                {/* Employer Form */}
                <div
                  className="tab-pane fade"
                  id="registerEmployer"
                  role="tabpanel"
                  aria-labelledby="employer-tab"
                >
                  <form className="auth-form">
                    <div className="row g-3">
                      <div className="col-sm-12">
                        <label htmlFor="companyName" className="form-label">
                          Company name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="companyName"
                          placeholder="Acme Studios"
                        />
                      </div>
                      <div className="col-sm-12">
                        <label htmlFor="companyWebsite" className="form-label">
                          Website
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          id="companyWebsite"
                          placeholder="https://yourcompany.com/"
                        />
                      </div>
                      <div className="col-sm-12">
                        <label htmlFor="companyEmail" className="form-label">
                          Work email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="companyEmail"
                          placeholder="you@company.com"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="employerPassword" className="form-label">
                          Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="employerPassword"
                          placeholder="Create a password"
                        />
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="employerTeamSize" className="form-label">
                          Team size
                        </label>
                        <select className="form-select" id="employerTeamSize">
                          <option selected>1-10 employees</option>
                          <option>11-50 employees</option>
                          <option>51-200 employees</option>
                          <option>200+ employees</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-check auth-policy mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="employerPolicy"
                      />
                      <label className="form-check-label" htmlFor="employerPolicy">
                        I accept the{' '}
                        <a href="#" className="auth-link">Terms</a> and confirm I
                        have hiring authority.
                      </label>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mt-4">
                      Create Employer Account
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