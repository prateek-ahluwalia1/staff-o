import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../store/slices/authSlice";
import useSubmit from "../hooks/useSubmit";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import Header from "../components/newHome/Header";
import { apiURL } from "../utils/exports";
import { normalizeAuthResponse, extractUserId } from "../utils/authResponseNormalizer";
import googleIcon from "../assets/images/google-color.svg";
import "../styles/staffoo.css";

/* ── Design tokens matching the new landing page ── */
const G = "#0F7A4A";
const G_DARK = "#0B5C39";
const G_LIGHT = "#E3F3EA";
const BORDER = "#E4E9E4";
const TINT = "#F5F8F5";
const INK = "#14181C";
const INK_SOFT = "#232A2E";
const TEXT_SEC = "#5B6660";

const inputStyle = (error) => ({
  width: "100%",
  padding: "11px 14px",
  borderRadius: "9px",
  border: `1.5px solid ${error ? "#e03535" : BORDER}`,
  background: TINT,
  color: INK,
  fontSize: "14.5px",
  outline: "none",
  transition: "border-color .15s",
  fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box",
});

const labelStyle = {
  display: "block",
  fontSize: "13.5px",
  fontWeight: 600,
  color: INK_SOFT,
  marginBottom: "6px",
  fontFamily: "'Inter', sans-serif",
};

const errorStyle = { fontSize: "12px", color: "#e03535", marginTop: "4px" };

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submit, loading } = useSubmit();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");

  const fetchLatestUserProfile = async (token, authUser) => {
    const userId = extractUserId(authUser);
    if (!userId) return authUser;
    try {
      const res = await fetch(`${apiURL}api/user-edit/${userId}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) return authUser;
      return json?.data || authUser;
    } catch { return authUser; }
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email address is required.";
    else if (!emailRe.test(formData.email)) newErrors.email = "Please enter a valid email address.";
    if (!formData.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const res = await submit("api/login", formData);
    if (!res) return;
    const normalized = normalizeAuthResponse(res);
    if (!normalized?.token) return;
    dispatch(setToken({ token: normalized.token }));
    const latestProfile = await fetchLatestUserProfile(normalized.token, normalized.user);
    dispatch(setUser({ userdata: latestProfile }));
    toast.success("Logged in successfully!");
    if (latestProfile?.user_type === "customer") navigate("/add-job");
    else if (latestProfile?.user_type === "admin") navigate("/dashboard");
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const googleToken = tokenResponse?.access_token || tokenResponse?.code;
        if (!googleToken) { toast.error("Invalid Google response."); return; }
        const res = await submit("api/auth/google/callback", { credential: googleToken }, { silentErrorToast: true });
        const normalized = normalizeAuthResponse(res);
        if (normalized?.token) {
          dispatch(setToken({ token: normalized.token }));
          const latestProfile = await fetchLatestUserProfile(normalized.token, normalized.user);
          dispatch(setUser({ userdata: latestProfile }));
          toast.success("Google sign in successful!");
          if (latestProfile?.user_type === "customer") navigate("/add-job");
        } else {
          setPendingGoogleToken(googleToken);
          setShowRoleModal(true);
        }
      } catch (err) { console.error("Google Login Error:", err); }
    },
  });

  const handleRoleSelectionSubmit = async () => {
    try {
      const res = await submit("api/auth/google/callback", { credential: pendingGoogleToken, user_type: selectedRole }, { silentErrorToast: true });
      if (!res) return;
      const normalized = normalizeAuthResponse(res);
      if (normalized?.token) {
        dispatch(setToken({ token: normalized.token }));
        const latestProfile = await fetchLatestUserProfile(normalized.token, normalized.user);
        dispatch(setUser({ userdata: latestProfile }));
        toast.success("Account created and logged in successfully!");
        setShowRoleModal(false);
        setPendingGoogleToken(null);
        if (latestProfile?.user_type === "customer") navigate("/add-job");
      }
    } catch { console.error("Server connection error."); }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!forgotEmail.trim()) { setForgotError("Email address is required."); return; }
    if (!emailRe.test(forgotEmail)) { setForgotError("Please enter a valid email address."); return; }
    setForgotError("");
    try {
      const res = await submit("api/password-reset-email", { email: forgotEmail });
      if (res && res.success !== false) {
        toast.success(res.message || "Password reset link sent successfully!");
        setShowForgotModal(false);
        setForgotEmail("");
      }
    } catch (err) { console.error("Server error.", err); }
  };

  const getInputStyle = (field, extra = {}) => ({
    ...inputStyle(errors[field]),
    borderColor: focusedField === field ? G : (errors[field] ? "#e03535" : BORDER),
    boxShadow: focusedField === field ? `0 0 0 3px ${G_LIGHT}` : "none",
    ...extra,
  });

  return (
    <>
      <Header />

      <div style={{ minHeight: "100vh", background: TINT, display: "flex", flexDirection: "column" }}>
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 20px",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "64px",
            maxWidth: "1100px",
            width: "100%",
            alignItems: "center",
          }}
            className="auth-grid"
          >
            {/* LEFT: Brand / Hero Copy */}
            <div className="auth-hero-col">


              <h1 style={{
                fontFamily: "'Barlow Semi Condensed', sans-serif",
                fontSize: "clamp(36px, 4vw, 52px)",
                fontWeight: 700,
                lineHeight: 1.08,
                color: INK,
                marginBottom: "20px",
              }}>
                Secure your work.<br />
                <span style={{ color: G }}>Access trusted shifts.</span>
              </h1>

              <p style={{ fontSize: "17px", color: TEXT_SEC, lineHeight: 1.7, maxWidth: "420px", marginBottom: "36px" }}>
                Sign in to manage your profile, assignments, and verified opportunities from one secure platform.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { icon: "✓", text: "Verified shifts and trusted clients" },
                  { icon: "⚡", text: "Instant access to live job updates" },
                  { icon: "◈", text: "Smart tools for your daily workflow" },
                ].map((item) => (
                  <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: G_LIGHT, display: "flex", alignItems: "center",
                      justifyContent: "center", color: G, fontWeight: 700,
                      fontSize: "15px", flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <span style={{ color: INK_SOFT, fontSize: "15px" }}>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div style={{
                display: "flex", gap: "0", marginTop: "44px",
                border: `1px solid ${BORDER}`, borderRadius: "12px", overflow: "hidden",
                background: "#fff",
              }}>
                {[["2,000+", "jobs filled"], ["1,200+", "verified staff"], ["4.8★", "avg. rating"]].map(([val, lbl], i) => (
                  <div key={lbl} style={{
                    flex: 1, padding: "18px 0", textAlign: "center",
                    borderLeft: i > 0 ? `1px solid ${BORDER}` : "none",
                  }}>
                    <div style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "22px", fontWeight: 700, color: G_DARK }}>{val}</div>
                    <div style={{ fontSize: "11.5px", color: TEXT_SEC, marginTop: "2px" }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Form Card */}
            <div>
              <div style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: "18px",
                padding: "40px",
                boxShadow: "0 20px 60px rgba(20,24,28,0.08)",
                maxWidth: "460px",
                margin: "0 auto",
              }}>
                {/* Icon + heading */}
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: G_LIGHT, display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: "20px",
                }}>
                  <i className="fa-solid fa-user-lock" style={{ color: G, fontSize: "20px" }} />
                </div>
                <h2 style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "26px", fontWeight: 700, color: INK, marginBottom: "6px" }}>
                  Sign in
                </h2>
                <p style={{ fontSize: "14px", color: TEXT_SEC, marginBottom: "28px" }}>
                  Please enter your email and password.
                </p>

                <form onSubmit={handleSubmit} noValidate autoComplete="off">
                  {/* Email */}
                  <div style={{ marginBottom: "18px" }}>
                    <label style={labelStyle}>
                      Email address <span style={{ color: "#e03535" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <div style={{
                        position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
                        color: focusedField === "email" ? G : TEXT_SEC,
                      }}>
                        <i className="fa-solid fa-envelope" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        autoComplete="off"
                        style={{ ...getInputStyle("email"), paddingLeft: "42px" }}
                      />
                    </div>
                    {errors.email && <p style={errorStyle}>{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>
                        Password <span style={{ color: "#e03535" }}>*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setForgotEmail(formData.email); setForgotError(""); setShowForgotModal(true); }}
                        style={{ background: "none", border: "none", color: G, fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", padding: 0 }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: focusedField === "password" ? G : TEXT_SEC }}>
                        <i className="fa-solid fa-lock" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        minLength={8}
                        style={{ ...getInputStyle("password"), paddingLeft: "42px", paddingRight: "42px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: TEXT_SEC, cursor: "pointer", padding: 0, display: "flex" }}
                      >
                        <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                      </button>
                    </div>
                    {errors.password && <p style={errorStyle}>{errors.password}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%", padding: "13px", borderRadius: "9px",
                      background: `linear-gradient(135deg, ${G}, ${G_DARK})`,
                      border: "none", color: "#fff", fontSize: "15px", fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1,
                      fontFamily: "'Inter', sans-serif", display: "flex",
                      alignItems: "center", justifyContent: "center", gap: "8px",
                      transition: "opacity .15s",
                    }}
                  >
                    {loading && <i className="fa-solid fa-spinner fa-spin" />}
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </form>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "22px 0" }}>
                  <hr style={{ flex: 1, margin: 0, borderColor: BORDER, opacity: 1 }} />
                  <span style={{ fontSize: "12px", color: TEXT_SEC, fontWeight: 600 }}>OR</span>
                  <hr style={{ flex: 1, margin: 0, borderColor: BORDER, opacity: 1 }} />
                </div>

                {/* Google */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "9px",
                    background: "#fff", border: `1.5px solid ${BORDER}`,
                    color: INK, fontSize: "14.5px", fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Inter', sans-serif", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: "10px",
                    transition: "border-color .15s, box-shadow .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = G; e.currentTarget.style.boxShadow = `0 0 0 3px ${G_LIGHT}`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <img src={googleIcon} alt="Google" width={18} />
                  Continue with Google
                </button>

                {/* Sign up link */}
                <p style={{ textAlign: "center", marginTop: "24px", marginBottom: 0, fontSize: "14px", color: TEXT_SEC }}>
                  Don't have an account?{" "}
                  <NavLink to="/register" style={{ color: G, fontWeight: 700, textDecoration: "none" }}>
                    Sign up
                  </NavLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,24,28,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "18px", padding: "40px", maxWidth: "440px", width: "100%", boxShadow: "0 24px 60px rgba(20,24,28,0.15)" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: G_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <i className="fa-solid fa-key" style={{ fontSize: "28px", color: G }} />
              </div>
              <h3 style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "24px", fontWeight: 700, color: INK, marginBottom: "8px" }}>Reset password</h3>
              <p style={{ fontSize: "14px", color: TEXT_SEC }}>Enter your registered email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} noValidate>
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Email address <span style={{ color: "#e03535" }}>*</span></label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => { setForgotEmail(e.target.value); if (forgotError) setForgotError(""); }}
                  style={inputStyle(forgotError)}
                />
                {forgotError && <p style={errorStyle}>{forgotError}</p>}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" onClick={() => setShowForgotModal(false)} disabled={loading}
                  style={{ flex: 1, padding: "12px", borderRadius: "9px", background: TINT, border: `1.5px solid ${BORDER}`, color: INK_SOFT, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "14.5px" }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  style={{ flex: 1, padding: "12px", borderRadius: "9px", background: `linear-gradient(135deg, ${G}, ${G_DARK})`, border: "none", color: "#fff", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif", fontSize: "14.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {loading && <i className="fa-solid fa-spinner fa-spin" />}
                  {loading ? "Sending..." : "Send link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ROLE SELECTION MODAL ── */}
      {showRoleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,24,28,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "18px", padding: "40px", maxWidth: "460px", width: "100%", boxShadow: "0 24px 60px rgba(20,24,28,0.15)" }}>
            <h3 style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "24px", fontWeight: 700, color: INK, marginBottom: "8px" }}>Complete your setup</h3>
            <p style={{ fontSize: "14px", color: TEXT_SEC, marginBottom: "24px" }}>Select your account type to create your profile and continue.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {[
                { key: "customer", label: "Client", desc: "I want to hire security professionals.", icon: "fa-user-tie" },
                { key: "staff", label: "Staff", desc: "I am looking for security shifts and jobs.", icon: "fa-user-shield" },
                { key: "contractor", label: "Resource Partner", desc: "I provide resources and contractor services.", icon: "fa-handshake" },
              ].map((role) => {
                const isActive = selectedRole === role.key;
                return (
                  <button key={role.key} type="button" onClick={() => setSelectedRole(role.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "14px 16px", borderRadius: "12px", cursor: "pointer", textAlign: "left",
                      border: isActive ? `2px solid ${G}` : `1.5px solid ${BORDER}`,
                      background: isActive ? G_LIGHT : TINT,
                      transition: "all .15s",
                    }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: isActive ? G : "#E4E9E4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <i className={`fa-solid ${role.icon}`} style={{ color: isActive ? "#fff" : TEXT_SEC, fontSize: "18px" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: isActive ? G_DARK : INK, fontSize: "14.5px", marginBottom: "2px", fontFamily: "'Inter', sans-serif" }}>{role.label}</div>
                      <div style={{ fontSize: "13px", color: TEXT_SEC }}>{role.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" onClick={() => { setShowRoleModal(false); setPendingGoogleToken(null); }} disabled={loading}
                style={{ flex: 1, padding: "12px", borderRadius: "9px", background: TINT, border: `1.5px solid ${BORDER}`, color: INK_SOFT, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "14.5px" }}>
                Cancel
              </button>
              <button type="button" onClick={handleRoleSelectionSubmit} disabled={loading || !selectedRole}
                style={{ flex: 1, padding: "12px", borderRadius: "9px", background: `linear-gradient(135deg, ${G}, ${G_DARK})`, border: "none", color: "#fff", fontWeight: 600, cursor: (!selectedRole || loading) ? "not-allowed" : "pointer", opacity: (!selectedRole || loading) ? 0.6 : 1, fontFamily: "'Inter', sans-serif", fontSize: "14.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {loading && <i className="fa-solid fa-spinner fa-spin" />}
                {loading ? "Creating..." : "Sign up"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Barlow+Semi+Condensed:wght@600;700&display=swap');
        .auth-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 900px) {
          .auth-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .auth-hero-col { display: none !important; }
        }
      `}</style>
    </>
  );
}