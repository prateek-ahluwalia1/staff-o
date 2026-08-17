import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../store/slices/authSlice";
import useSubmit from "../hooks/useSubmit";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import Header from "../components/newHome/Header";
import { apiURL } from "../utils/exports";
import { normalizeAuthResponse, extractUserId } from "../utils/authResponseNormalizer";
import googleIcon from "../assets/images/google-color.svg";

/* ── Design tokens ── */
const G = "#0A7C6E";
const G_DARK = "#075E53";
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
  fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box",
  transition: "border-color .15s, box-shadow .15s",
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

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { submit, loading } = useSubmit();

  const incomingRole = location.state?.role?.toLowerCase();
  const validRoles = ["customer", "staff", "contractor"];

  const [userType, setUserType] = useState(validRoles.includes(incomingRole) ? incomingRole : "");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingAuthAction, setPendingAuthAction] = useState(null);
  const [tempGoogleToken, setTempGoogleToken] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});

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
    const { name, value } = e.target;
    let newValue = value;
    if (name === "name") newValue = value.replace(/[^a-zA-Z\s]/g, "");
    else if (name === "phone") newValue = value.replace(/[^\d+\s-]/g, "");
    setFormData((p) => ({ ...p, [name]: newValue }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    else if (formData.name.trim().length < 2) newErrors.name = "Full name must be at least 2 characters.";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
    if (formData.phone.trim()) {
      const pureDigits = formData.phone.replace(/[\s-]/g, "");
      if (!/^\+?\d{10,15}$/.test(pureDigits)) newErrors.phone = "Please enter a valid phone number (10–15 digits).";
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email address is required.";
    else if (!emailRe.test(formData.email)) newErrors.email = "Please enter a valid email address.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) newErrors.password = "Password must contain at least one letter and one number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setPendingAuthAction("form");
    setShowRoleModal(true);
  };

  const handleGoogleRegister = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      const googleToken = tokenResponse?.access_token || tokenResponse?.code;
      if (!googleToken) { toast.error("Invalid Google response."); return; }
      setIsGoogleLoading(true);
      try {
        const checkRes = await fetch(`${apiURL}api/auth/google/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ credential: googleToken }),
        });
        const data = await checkRes.json();
        if (checkRes.ok) {
          const normalized = normalizeAuthResponse(data);
          if (normalized?.token) {
            dispatch(setToken({ token: normalized.token }));
            const latestProfile = await fetchLatestUserProfile(normalized.token, normalized.user);
            dispatch(setUser({ userdata: latestProfile }));
            toast.success("Logged in successfully!");
            setIsGoogleLoading(false);
            return;
          }
        }
        setTempGoogleToken(googleToken);
        setPendingAuthAction("google");
        setShowRoleModal(true);
      } catch (error) {
        console.error("User check failed:", error);
        setTempGoogleToken(googleToken);
        setPendingAuthAction("google");
        setShowRoleModal(true);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => toast.error("Google authentication failed."),
  });

  const executeRegistration = async () => {
    setShowRoleModal(false);
    if (pendingAuthAction === "form") {
      const payload = { ...formData, password_confirmation: formData.password, user_type: userType };
      const res = await submit("api/register/user", payload);
      if (!res) return;
      const normalized = normalizeAuthResponse(res);
      if (!normalized?.token) return;
      toast.success("Account created successfully!");
      if (typeof window !== "undefined" && window.fbq) window.fbq("track", "CompleteRegistration");
      setShowVerifyModal(true);
    } else if (pendingAuthAction === "google") {
      try {
        const res = await submit("api/auth/google/callback", { credential: tempGoogleToken, user_type: userType });
        if (!res) return;
        const normalized = normalizeAuthResponse(res);
        if (normalized?.token) {
          dispatch(setToken({ token: normalized.token }));
          const latestProfile = await fetchLatestUserProfile(normalized.token, normalized.user);
          dispatch(setUser({ userdata: latestProfile }));
          toast.success("Google signup successful!");
        }
      } catch { console.error("Server connection error during Google signup."); }
    }
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
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", maxWidth: "1100px", width: "100%", alignItems: "center" }} className="auth-grid">

            {/* LEFT: Brand / Hero Copy */}
            <div className="auth-hero-col">

              <h1 style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 700, lineHeight: 1.08, color: INK, marginBottom: "20px" }}>
                Build your identity.<br />
                <span style={{ color: G }}>Join trusted teams.</span>
              </h1>

              <p style={{ fontSize: "17px", color: TEXT_SEC, lineHeight: 1.7, maxWidth: "420px", marginBottom: "36px" }}>
                Create your profile, connect with verified clients, and grow your opportunities with one secure platform.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { icon: "✓", text: "Verified jobs and trusted clients" },
                  { icon: "⚡", text: "Smart matching for every job" },
                  { icon: "◈", text: "Fast onboarding and secure access" },
                ].map((item) => (
                  <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: G_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", color: G, fontWeight: 700, fontSize: "15px", flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <span style={{ color: INK_SOFT, fontSize: "15px" }}>{item.text}</span>
                  </div>
                ))}
              </div>

              {/* 3 role chips */}
              <div style={{ marginTop: "40px" }}>
                <div style={{ fontSize: "13px", color: TEXT_SEC, fontWeight: 600, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Who is this for?</div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {[
                    { label: "Clients", desc: "Hire verified staff" },
                    { label: "Staff", desc: "Find security jobs" },
                    { label: "Partners", desc: "Manage your team" },
                  ].map((r) => (
                    <div key={r.label} style={{ padding: "10px 16px", borderRadius: "10px", border: `1px solid ${BORDER}`, background: "#fff" }}>
                      <div style={{ fontWeight: 700, color: INK, fontSize: "13.5px" }}>{r.label}</div>
                      <div style={{ fontSize: "12px", color: TEXT_SEC }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Form Card */}
            <div>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "18px", padding: "40px", boxShadow: "0 20px 60px rgba(20,24,28,0.08)", maxWidth: "480px", margin: "0 auto" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: G_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                  <i className="fa-solid fa-user-plus" style={{ color: G, fontSize: "20px" }} />
                </div>
                <h2 style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "26px", fontWeight: 700, color: INK, marginBottom: "6px" }}>
                  Sign up
                </h2>
                <p style={{ fontSize: "14px", color: TEXT_SEC, marginBottom: "28px" }}>
                  It only takes a few seconds.
                </p>

                <form onSubmit={handleInitialSubmit} noValidate>
                  {/* Name + Phone row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                    <div>
                      <label style={labelStyle}>Full name <span style={{ color: "#e03535" }}>*</span></label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                        style={getInputStyle("name")}
                      />
                      {errors.name && <p style={errorStyle}>{errors.name}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Phone <span style={{ color: "#e03535" }}>*</span></label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+61 400 000 000"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField(null)}
                        maxLength={20}
                        style={getInputStyle("phone")}
                      />
                      {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Email + Password row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
                    <div>
                      <label style={labelStyle}>Email <span style={{ color: "#e03535" }}>*</span></label>
                      <input
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        style={getInputStyle("email")}
                      />
                      {errors.email && <p style={errorStyle}>{errors.email}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Password <span style={{ color: "#e03535" }}>*</span></label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Min. 8 chars"
                          value={formData.password}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("password")}
                          onBlur={() => setFocusedField(null)}
                          minLength={8}
                          style={{ ...getInputStyle("password"), paddingRight: "42px" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: TEXT_SEC, cursor: "pointer", padding: 0, display: "flex" }}
                        >
                          <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                        </button>
                      </div>
                      {errors.password && <p style={errorStyle}>{errors.password}</p>}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || isGoogleLoading}
                    style={{
                      width: "100%", padding: "13px", borderRadius: "9px",
                      background: `linear-gradient(135deg, ${G}, ${G_DARK})`,
                      border: "none", color: "#fff", fontSize: "15px", fontWeight: 600,
                      cursor: (loading || isGoogleLoading) ? "not-allowed" : "pointer",
                      opacity: (loading || isGoogleLoading) ? 0.8 : 1,
                      fontFamily: "'Inter', sans-serif",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}
                  >
                    {loading && pendingAuthAction === "form" && <i className="fa-solid fa-spinner fa-spin" />}
                    {loading && pendingAuthAction === "form" ? "Please wait..." : "Sign up"}
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
                  type="button"
                  onClick={() => handleGoogleRegister()}
                  disabled={loading || isGoogleLoading}
                  style={{
                    width: "100%", padding: "12px", borderRadius: "9px",
                    background: "#fff", border: `1.5px solid ${BORDER}`,
                    color: INK, fontSize: "14.5px", fontWeight: 600,
                    cursor: (loading || isGoogleLoading) ? "not-allowed" : "pointer",
                    fontFamily: "'Inter', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    transition: "border-color .15s, box-shadow .15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = G; e.currentTarget.style.boxShadow = `0 0 0 3px ${G_LIGHT}`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {isGoogleLoading ? <i className="fa-solid fa-spinner fa-spin" /> : <img src={googleIcon} alt="Google" width={18} />}
                  {isGoogleLoading ? "Checking account..." : "Continue with Google"}
                </button>

                {/* Sign in link */}
                <p style={{ textAlign: "center", marginTop: "24px", marginBottom: 0, fontSize: "14px", color: TEXT_SEC }}>
                  Already have an account?{" "}
                  <NavLink to="/login" style={{ color: G, fontWeight: 700, textDecoration: "none" }}>Sign in</NavLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROLE SELECTION MODAL ── */}
      {showRoleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,24,28,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "18px", padding: "40px", maxWidth: "460px", width: "100%", boxShadow: "0 24px 60px rgba(20,24,28,0.15)" }}>
            <h3 style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "24px", fontWeight: 700, color: INK, marginBottom: "8px" }}>Select account type</h3>
            <p style={{ fontSize: "14px", color: TEXT_SEC, marginBottom: "24px" }}>Choose the profile type that best describes you to continue.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              {[
                { key: "customer", label: "Client", desc: "I want to hire security professionals.", icon: "fa-user-tie" },
                { key: "staff", label: "Staff", desc: "I am looking for security jobs.", icon: "fa-user-shield" },
                { key: "contractor", label: "Resource Partner", desc: "I provide resources and contractor services.", icon: "fa-handshake" },
              ].map((role) => {
                const isActive = userType === role.key;
                return (
                  <button key={role.key} type="button" onClick={() => setUserType(role.key)}
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
              <button type="button" onClick={() => { setShowRoleModal(false); setPendingAuthAction(null); setTempGoogleToken(null); }} disabled={loading}
                style={{ flex: 1, padding: "12px", borderRadius: "9px", background: TINT, border: `1.5px solid ${BORDER}`, color: INK_SOFT, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "14.5px" }}>
                Cancel
              </button>
              <button type="button" onClick={executeRegistration} disabled={loading || !userType}
                style={{ flex: 1, padding: "12px", borderRadius: "9px", background: `linear-gradient(135deg, ${G}, ${G_DARK})`, border: "none", color: "#fff", fontWeight: 600, cursor: (!userType || loading) ? "not-allowed" : "pointer", opacity: (!userType || loading) ? 0.6 : 1, fontFamily: "'Inter', sans-serif", fontSize: "14.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {loading && <i className="fa-solid fa-spinner fa-spin" />}
                {loading ? "Processing..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EMAIL VERIFY MODAL ── */}
      {showVerifyModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,24,28,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: "18px", padding: "40px", maxWidth: "440px", width: "100%", boxShadow: "0 24px 60px rgba(20,24,28,0.15)", textAlign: "center" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: G_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <i className="fa-solid fa-envelope-open-text" style={{ fontSize: "28px", color: G }} />
            </div>
            <h3 style={{ fontFamily: "'Barlow Semi Condensed', sans-serif", fontSize: "24px", fontWeight: 700, color: INK, marginBottom: "12px" }}>Verify your email</h3>
            <p style={{ fontSize: "14px", color: TEXT_SEC, marginBottom: "28px", lineHeight: 1.6 }}>
              We've sent a verification link to{" "}
              <strong style={{ color: INK }}>{formData.email}</strong>. Please check your inbox and click the link to activate your account.
            </p>
            <button type="button" onClick={() => navigate("/login")}
              style={{ width: "100%", padding: "13px", borderRadius: "9px", background: `linear-gradient(135deg, ${G}, ${G_DARK})`, border: "none", color: "#fff", fontSize: "15px", fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
              Go to login page
            </button>
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