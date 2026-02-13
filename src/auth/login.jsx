// src/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../store/slices/authSlice";
import useSubmit from "../hooks/useSubmit";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { submit, loading, error: submitError } = useSubmit();

  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    const res = await submit("api/login", { email, password });

    if (res.success) {
      const { token, user } = res.data;
      dispatch(setToken({ token }));
      dispatch(setUser({ userdata: user }));
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } else {
      setError(res.message || "Login failed. Please try again.");
    }
  };

  return (
    <section className="auth-section">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <div className="auth-intro">
              <span className="auth-badge">Welcome Back</span>
              <h1 className="auth-title">Log in to continue your job search</h1>
              <p className="auth-copy">
                Access personalised recommendations, manage your applications,
                and stay ahead with instant updates from top employers.
              </p>
              <ul className="auth-benefits">
                <li>
                  <i className="fa-solid fa-check-circle"></i> Track your
                  applications in real time
                </li>
                <li>
                  <i className="fa-solid fa-check-circle"></i> Discover openings
                  tailored to your skills
                </li>
                <li>
                  <i className="fa-solid fa-check-circle"></i> Save jobs and set
                  alerts in one dashboard
                </li>
              </ul>
            </div>
          </div>

          <div className="col-lg-5 ms-lg-auto">
            <div className="auth-card">
              <h3>Sign in to your account</h3>
              <p className="auth-subtitle">
                Enter your details below or continue with a social account.
              </p>
              {/*
                <div className="auth-social">
                <a href="#" className="auth-social-btn google">
                  <i className="fa-brands fa-google"></i> Login with Google
                </a>
                <a href="#" className="auth-social-btn linkedin">
                  <i className="fa-brands fa-linkedin"></i> Login with LinkedIn
                </a>
              </div>

              <div className="auth-divider"><span>or</span></div>
  */}

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="loginEmail" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="loginEmail"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="loginPassword" className="form-label">
                      Password
                    </label>
                    <a href="#" className="auth-link">
                      Forgot password?
                    </a>
                  </div>
                  <input
                    type="password"
                    className="form-control"
                    id="loginPassword"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-check mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Keep me signed in
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="auth-switch">
                New to JobsPortal? <a href="/register">Create an account</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
