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
      <section className="auth-section">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6">
              <div className="auth-intro mt-5">
                <span className="auth-badge">Welcome Back</span>
                <h1 className="auth-title">
                  Log in to continue your job search
                </h1>
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
                    <i className="fa-solid fa-check-circle"></i> Discover
                    openings tailored to your skills
                  </li>
                  <li>
                    <i className="fa-solid fa-check-circle"></i> Save jobs and
                    set alerts in one dashboard
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
                      {/* <NavLink to="/forgot-password" className="auth-link">
                        Forgot password?
                      </NavLink> */}
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
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
                      checked={showPassword}
                      onChange={() => setShowPassword((prev) => !prev)}
                    />
                    <label
                      style={{ cursor: "pointer" }}
                      className="form-check-label"
                      htmlFor="rememberMe"
                    >
                      Show Password
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
                <div className="auth-divider">
                  <span>or</span>
                </div>

                <div className="auth-social">
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin()}
                    className="auth-social-btn google"
                    disabled={loading}
                  >
                    <i className="fa-brands fa-google"></i>{" "}
                    {loading ? "Please wait..." : "Login with Google"}
                  </button>
                </div>

                <p className="auth-switch">
                  New to JobsPortal?{" "}
                  <NavLink to="/register">Create an account</NavLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
