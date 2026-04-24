import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../store/slices/authSlice";
import useSubmit from "../hooks/useSubmit";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import Header from "../components/header";
import { normalizeAuthResponse } from "../utils/authResponseNormalizer";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { submit, loading } = useSubmit();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const extractErrorMessage = (response) => {
    if (response.message) {
      return response.message;
    }
    if (response.errors && typeof response.errors === "object") {
      const firstErrorKey = Object.keys(response.errors)[0];
      if (firstErrorKey && Array.isArray(response.errors[firstErrorKey])) {
        return response.errors[firstErrorKey][0];
      }
    }
    return "An error occurred. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const res = await submit("api/login", { email, password });
    if (!res) return;

    const normalized = normalizeAuthResponse(res);

    if (normalized && normalized.token) {
      dispatch(setToken({ token: normalized.token }));
      dispatch(setUser({ userdata: normalized.user }));

      toast.success("Login successful!");
      const redirectTo = normalized.user?.data?.is_active
        ? "/dashboard"
        : "/edit-profile";
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(extractErrorMessage(res));
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      console.log("Google login successful, token response:", tokenResponse);
      try {
        const googleToken = tokenResponse?.access_token || tokenResponse?.code;

        if (!googleToken) {
          toast.error("Google login response was invalid. Please try again.");
          return;
        }

        const res = await submit("api/auth/google/callback", {
          credential: googleToken,
        });

        if (!res) return;

        const normalized = normalizeAuthResponse(res);

        if (normalized && normalized.token) {
          dispatch(setToken({ token: normalized.token }));
          dispatch(setUser({ userdata: normalized.user }));

          toast.success("Google Login successful!");
          const redirectTo = normalized.user?.data?.is_active
            ? "/dashboard"
            : "/edit-profile";
          navigate(redirectTo, { replace: true });
        } else {
          toast.error(extractErrorMessage(res));
        }
      } catch (error) {
        toast.error("An error occurred connecting to the server.");
      }
    },
    onError: () => {
      toast.error("Google Login Failed. Please try again.");
    },
    onNonOAuthError: () => {
      toast.error("Google popup was blocked or closed. Please try again.");
    },
  });

  return (
    <>
      <Header />
      <section className="auth-section py-5">
        <div className="container">
          <div className="row g-5 align-items-center">

            {/* Left side - Intro text */}
            <div className="col-lg-6">
              <div className="auth-intro">
                <span className="auth-badge mb-3 d-inline-block px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-pill fw-semibold small">
                  Welcome Back
                </span>
                <h1 className="auth-title display-5 fw-bold mb-4">
                  Log in to continue your job search
                </h1>
                <p className="auth-copy text-muted fs-6 mb-4">
                  Access personalised recommendations, manage your applications,
                  and stay ahead with instant updates from top employers.
                </p>
                <ul className="auth-benefits list-unstyled d-flex flex-column gap-2 mb-0">
                  <li className="d-flex align-items-center gap-2 small text-dark">
                    <i className="fa-solid fa-check-circle text-success"></i>
                    <span className="fw-medium">Track your applications in real time</span>
                  </li>
                  <li className="d-flex align-items-center gap-2 small text-dark">
                    <i className="fa-solid fa-check-circle text-success"></i>
                    <span className="fw-medium">Discover openings tailored to your skills</span>
                  </li>
                  <li className="d-flex align-items-center gap-2 small text-dark">
                    <i className="fa-solid fa-check-circle text-success"></i>
                    <span className="fw-medium">Save jobs and set alerts in one dashboard</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right side - Form card */}
            <div className="col-lg-5 ms-lg-auto">
              <div className="auth-card bg-white p-4 rounded-4 shadow-sm border" style={{ maxWidth: "480px", margin: "0 auto" }}>
                <h4 className="fw-bold mb-4">Sign in to your account</h4>

                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="loginEmail" className="form-label fw-semibold small mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      className="form-control py-2 bg-light border-secondary-subtle"
                      id="loginEmail"
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label htmlFor="loginPassword" className="form-label fw-semibold small mb-0">
                        Password
                      </label>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control py-2 bg-light border-secondary-subtle"
                      id="loginPassword"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Show Password Toggle */}
                  <div className="form-check d-flex align-items-center gap-2 mb-4">
                    <input
                      className="form-check-input mt-0"
                      type="checkbox"
                      id="rememberMe"
                      style={{ width: "1.1rem", height: "1.1rem", cursor: "pointer" }}
                      checked={showPassword}
                      onChange={() => setShowPassword((prev) => !prev)}
                    />
                    <label
                      style={{ cursor: "pointer", paddingTop: "2px" }}
                      className="form-check-label small fw-medium text-dark user-select-none"
                      htmlFor="rememberMe"
                    >
                      Show Password
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary py-2 w-100 fw-bold shadow-sm"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
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
                  onClick={() => handleGoogleLogin()}
                  className="btn btn-outline-dark py-2 w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: "18px" }} />
                  {loading ? "Please wait..." : "Sign in with Google"}
                </button>

                <p className="text-center mt-4 mb-0 small fw-medium">
                  New to JobsPortal?{" "}
                  <NavLink to="/register" className="text-primary text-decoration-none fw-bold">Create an account</NavLink>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}