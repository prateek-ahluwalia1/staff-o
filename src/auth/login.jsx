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
    if (response.message) return response.message;
    if (response.errors && typeof response.errors === "object") {
      const key = Object.keys(response.errors)[0];
      if (Array.isArray(response.errors[key])) {
        return response.errors[key][0];
      }
    }
    return "Something went wrong. Please try again.";
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

    if (normalized?.token) {
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
      try {
        const googleToken =
          tokenResponse?.access_token || tokenResponse?.code;

        if (!googleToken) {
          toast.error("Invalid Google response.");
          return;
        }

        const res = await submit("api/auth/google/callback", {
          credential: googleToken,
        });

        if (!res) return;

        const normalized = normalizeAuthResponse(res);

        if (normalized?.token) {
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
      } catch {
        toast.error("Server connection error.");
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
                  Welcome back
                </h1>

                <p className="text-muted mb-4">
                  Log in to manage your profile, track applications, and stay
                  connected with opportunities.
                </p>

                <div className="d-flex flex-column gap-2 small">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-check text-primary"></i>
                    Track applications in real time
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-check text-primary"></i>
                    Discover tailored opportunities
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-check text-primary"></i>
                    Save jobs & manage alerts
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
                <h4 className="fw-bold mb-1">Sign in</h4>
                <p className="text-muted small mb-3">
                  Enter your credentials to continue
                </p>

                <form onSubmit={handleSubmit}>

                  <div className="mb-2">
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control form-control-sm"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  {/* Show Password */}
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                      id="showPass"
                    />
                    <label className="form-check-label small" htmlFor="showPass">
                      Show password
                    </label>
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
                    {loading ? "Signing in..." : "Sign In"}
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
                  onClick={handleGoogleLogin}
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
                  Don’t have an account?{" "}
                  <NavLink to="/register" className="fw-semibold text-primary">
                    Create one
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