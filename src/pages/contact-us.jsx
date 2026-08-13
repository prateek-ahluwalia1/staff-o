import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import useSubmit from "../hooks/useSubmit";
import { Link } from 'react-router-dom';
import "../components/industries/event-crowd-comp/styles.css";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  inquiryType: "General",
  subject: "",
  message: "",
  website: "",
  consent: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export default function ContactUs() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const { submit, loading } = useSubmit();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      nextErrors.fullName = "Please enter your full name.";
    }

    if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (form.phone.trim() && form.phone.replace(/\D/g, "").length < 7) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    if (!form.subject.trim() || form.subject.trim().length < 3) {
      nextErrors.subject = "Please add a short subject.";
    }

    if (!form.message.trim() || form.message.trim().length < 20) {
      nextErrors.message = "Message should be at least 20 characters.";
    }

    if (!form.consent) {
      nextErrors.consent = "You must agree before submitting.";
    }

    if (form.website.trim()) {
      nextErrors.website = "Spam check failed.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please review the highlighted fields.");
      return;
    }

    const payload = {
      name: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      inquiry_type: form.inquiryType,
      subject: form.subject.trim(),
      message: form.message.trim(),
      source: "website-contact-page",
      submitted_at: new Date().toISOString(),
    };

    const response = await submit("api/contact-us", payload, {
      method: "POST",
    });

    if (response) {
      toast.success(
        "Your message has been sent. Our team will contact you soon."
      );
      setForm(initialForm);
      setErrors({});
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Staffoo</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <div className="stf-industry-page">
        <Header />

        <div className="stf-breadcrumb-section">
          <div className="stf-wrap">
            <div className="stf-breadcrumb">
              <Link className="text-black text-decoration-none" to="/">Home</Link>
              <span className="sep mx-2">/</span>
              <span className="current text-muted">Contact Us</span>
            </div>
          </div>
        </div>

        {/* Banner Section */}
        <section style={{ padding: "80px 0 60px" }}>
          <div className="stf-wrap">

            <h1 style={{ fontSize: "4.5rem", fontWeight: 800, margin: "0 0 24px 0", lineHeight: 1.05, letterSpacing: "-1px" }}>
              Let&apos;s Build <span style={{ color: "var(--green)" }}>Your Team</span> Faster
            </h1>
            <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)", maxWidth: "650px", lineHeight: 1.6, margin: 0 }}>
              Send us your hiring needs, billing questions, or platform
              feedback. Our support team usually replies within one business
              day.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section style={{ paddingBottom: "80px" }}>
          <div className="stf-wrap">
            <div className="row g-5">

              {/* Left Column: Contact Info */}
              <div className="col-lg-5">
                <div style={{ backgroundColor: "var(--tint)", border: "1px solid var(--border)", borderRadius: "14px", padding: "48px", height: "100%" }}>
                  <h2 style={{ fontSize: "2.25rem", color: "var(--ink)", margin: "0 0 16px 0" }}>Get in Touch</h2>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "48px", fontSize: "1rem" }}>
                    Reach us by email, phone, or by using this form. For urgent
                    account issues, include your registered email and a short
                    summary so we can prioritize your case.
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 48px 0" }}>
                    <li style={{ display: "flex", alignItems: "flex-start", marginBottom: "32px", gap: "20px" }}>
                      <span style={{ color: "var(--green)", fontSize: "1.25rem", marginTop: "4px" }}>
                        <i className="fa fa-map-marker" aria-hidden="true"></i>
                      </span>
                      <div>
                        <h5 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "var(--ink)", fontWeight: 600 }}>Admin Office</h5>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>21 Tanglewood Bvd, Truganina VIC 3029, Australia</p>
                      </div>
                    </li>
                    <li style={{ display: "flex", alignItems: "flex-start", marginBottom: "32px", gap: "20px" }}>
                      <span style={{ color: "var(--green)", fontSize: "1.25rem", marginTop: "4px" }}>
                        <i className="fa fa-envelope" aria-hidden="true"></i>
                      </span>
                      <div>
                        <h5 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "var(--ink)", fontWeight: 600 }}>Email</h5>
                        <a href="mailto:admin@staffoo.com.au" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = 'var(--green)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                          admin@staffoo.com.au
                        </a>
                      </div>
                    </li>
                    <li style={{ display: "flex", alignItems: "flex-start", marginBottom: "32px", gap: "20px" }}>
                      <span style={{ color: "var(--green)", fontSize: "1.25rem", marginTop: "4px" }}>
                        <i className="fa fa-phone" aria-hidden="true"></i>
                      </span>
                      <div>
                        <h5 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "var(--ink)", fontWeight: 600 }}>Phone</h5>
                        <Link to="tel:1800 782 366" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = 'var(--green)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>1800 782 366</Link>
                      </div>
                    </li>
                    <li style={{ display: "flex", alignItems: "flex-start", marginBottom: "32px", gap: "20px" }}>
                      <span style={{ color: "var(--green)", fontSize: "1.25rem", marginTop: "4px" }}>
                        <i className="fa fa-clock" aria-hidden="true"></i>
                      </span>
                      <div>
                        <h5 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", color: "var(--ink)", fontWeight: 600 }}>Business Hours</h5>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>Mon - Fri, 9:00 AM - 6:00 PM (AEST)</p>
                      </div>
                    </li>
                  </ul>

                  <div style={{ display: "flex", gap: "16px" }}>
                    <Link to="https://www.facebook.com/profile.php?id=61582204185867" target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "8px", backgroundColor: "var(--white)", color: "var(--green)", border: "1px solid var(--border)", textDecoration: "none", fontSize: "1.2rem", transition: "all 0.2s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--green)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--green)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--white)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      <i className="fab fa-facebook" aria-hidden="true"></i>
                    </Link>
                    <Link to="https://www.instagram.com/staffoo_/" target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "8px", backgroundColor: "var(--white)", color: "var(--green)", border: "1px solid var(--border)", textDecoration: "none", fontSize: "1.2rem", transition: "all 0.2s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--green)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--green)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--white)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      <i className="fab fa-instagram" aria-hidden="true"></i>
                    </Link>
                    <Link to="https://www.linkedin.com/company/staff-o/" target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "8px", backgroundColor: "var(--white)", color: "var(--green)", border: "1px solid var(--border)", textDecoration: "none", fontSize: "1.2rem", transition: "all 0.2s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--green)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--green)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--white)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      <i className="fab fa-linkedin" aria-hidden="true"></i>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Form */}
              <div className="col-lg-7">
                <div style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)", borderRadius: "14px", padding: "48px", height: "100%", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                  <h2 style={{ fontSize: "2.25rem", color: "var(--ink)", margin: "0 0 16px 0" }}>Send a Message</h2>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "40px", fontSize: "1rem" }}>
                    Tell us what you need and we will route your message to the
                    right team.
                  </p>

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-4">

                      <div className="col-md-6">
                        <label htmlFor="fullName" style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "10px", fontWeight: 600 }}>
                          Full Name <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          className="form-control shadow-none"
                          style={{ backgroundColor: "var(--white)", border: `1px solid ${errors.fullName ? '#ef4444' : 'var(--border)'}`, color: "var(--ink)", padding: "14px 16px", borderRadius: "8px", fontSize: "1rem", outline: "none" }}
                          placeholder="Enter your full name"
                          value={form.fullName}
                          onChange={handleChange}
                          autoComplete="name"
                          required
                        />
                        {errors.fullName && <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "8px", display: "block" }}>{errors.fullName}</span>}
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="email" style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "10px", fontWeight: 600 }}>
                          Email Address <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          className="form-control shadow-none"
                          style={{ backgroundColor: "var(--white)", border: `1px solid ${errors.email ? '#ef4444' : 'var(--border)'}`, color: "var(--ink)", padding: "14px 16px", borderRadius: "8px", fontSize: "1rem", outline: "none" }}
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={handleChange}
                          autoComplete="email"
                          required
                        />
                        {errors.email && <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "8px", display: "block" }}>{errors.email}</span>}
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="phone" style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "10px", fontWeight: 600 }}>
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          className="form-control shadow-none"
                          style={{ backgroundColor: "var(--white)", border: `1px solid ${errors.phone ? '#ef4444' : 'var(--border)'}`, color: "var(--ink)", padding: "14px 16px", borderRadius: "8px", fontSize: "1rem", outline: "none" }}
                          placeholder="Optional"
                          value={form.phone}
                          onChange={handleChange}
                          autoComplete="tel"
                        />
                        {errors.phone && <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "8px", display: "block" }}>{errors.phone}</span>}
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="company" style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "10px", fontWeight: 600 }}>
                          Company
                        </label>
                        <input
                          id="company"
                          name="company"
                          type="text"
                          className="form-control shadow-none"
                          style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)", color: "var(--ink)", padding: "14px 16px", borderRadius: "8px", fontSize: "1rem", outline: "none" }}
                          placeholder="Optional"
                          value={form.company}
                          onChange={handleChange}
                          autoComplete="organization"
                        />
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="inquiryType" style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "10px", fontWeight: 600 }}>
                          Inquiry Type
                        </label>
                        <select
                          id="inquiryType"
                          name="inquiryType"
                          className="form-select shadow-none"
                          style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)", color: "var(--ink)", padding: "14px 16px", borderRadius: "8px", fontSize: "1rem", outline: "none", cursor: "pointer" }}
                          value={form.inquiryType}
                          onChange={handleChange}
                        >
                          <option>General</option>
                          <option>Hiring Support</option>
                          <option>Candidate Support</option>
                          <option>Billing</option>
                          <option>Technical Issue</option>
                          <option>Partnership</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="subject" style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "10px", fontWeight: 600 }}>
                          Subject <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          id="subject"
                          name="subject"
                          type="text"
                          className="form-control shadow-none"
                          style={{ backgroundColor: "var(--white)", border: `1px solid ${errors.subject ? '#ef4444' : 'var(--border)'}`, color: "var(--ink)", padding: "14px 16px", borderRadius: "8px", fontSize: "1rem", outline: "none" }}
                          placeholder="What can we help with?"
                          value={form.subject}
                          onChange={handleChange}
                          required
                        />
                        {errors.subject && <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "8px", display: "block" }}>{errors.subject}</span>}
                      </div>

                      <div className="col-12">
                        <label htmlFor="message" style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "10px", fontWeight: 600 }}>
                          Message <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          className="form-control shadow-none"
                          style={{ backgroundColor: "var(--white)", border: `1px solid ${errors.message ? '#ef4444' : 'var(--border)'}`, color: "var(--ink)", padding: "14px 16px", borderRadius: "8px", fontSize: "1rem", outline: "none", minHeight: "120px", resize: "vertical" }}
                          placeholder="Please include details such as timeline, role types, or account issue context."
                          value={form.message}
                          onChange={handleChange}
                          required
                        ></textarea>
                        {errors.message && <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "8px", display: "block" }}>{errors.message}</span>}
                      </div>

                      {/* Honeypot Field */}
                      <div style={{ display: "none" }}>
                        <label htmlFor="website">Website</label>
                        <input
                          id="website"
                          name="website"
                          type="text"
                          value={form.website}
                          onChange={handleChange}
                          tabIndex="-1"
                          autoComplete="off"
                        />
                      </div>

                      <div className="col-12">
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          <input
                            id="consent"
                            name="consent"
                            type="checkbox"
                            className="form-check-input mt-1"
                            style={{ cursor: "pointer", borderColor: errors.consent ? "#ef4444" : "var(--border)" }}
                            checked={form.consent}
                            onChange={handleChange}
                          />
                          <label htmlFor="consent" style={{ fontSize: "0.95rem", color: "var(--text-secondary)", cursor: "pointer", userSelect: "none", lineHeight: 1.4 }}>
                            I agree to be contacted regarding my request.
                          </label>
                        </div>
                        {errors.consent && <span style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "8px", display: "block" }}>{errors.consent}</span>}
                      </div>

                      <div className="col-12 mt-4">
                        <button
                          type="submit"
                          className="btn"
                          disabled={loading}
                          style={{
                            backgroundColor: "var(--green)", color: "var(--white)", border: "none", padding: "16px", width: "100%",
                            borderRadius: "8px", fontWeight: 600, fontSize: "1rem", transition: "background-color 0.2s"
                          }}
                          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--green-dark)' }}
                          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--green)' }}
                        >
                          {loading ? "Sending message..." : "Submit Message"}
                        </button>
                      </div>

                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Map Section */}
        <section style={{ paddingBottom: "80px" }}>
          <div className="stf-wrap">
            <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid var(--border)", backgroundColor: "var(--tint)", padding: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <iframe
                title="Staffoo office map"
                src="https://www.google.com/maps?q=21+Tanglewood+Bvd+Truganina+VIC+3029&output=embed"
                width="100%"
                height="420"
                style={{ border: 0, borderRadius: "8px", display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}