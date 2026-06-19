import React, { useState } from "react";
import { toast } from "react-toastify";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import useSubmit from "../hooks/useSubmit";
import { Link } from 'react-router-dom';

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
      <Header />

      {/* INTERNAL STYLESHEET */}
      <style>{`
        .stf-contact-page {
          background-color: #0d1216;
          color: #ffffff;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          min-height: 100vh;
          padding-bottom: 80px;
        }
        
        .stf-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Hero Section */
        .stf-hero {
          padding: 80px 0 60px;
        }
        .stf-badge {
          color: #0A7C6E;
          
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .stf-badge::before {
          content: '';
          display: inline-block;
          width: 20px;
          height: 1px;
          background-color: #0A7C6E;
        }
        .stf-hero h1 {
          font-size: 4.5rem;
          font-weight: 800;
          margin: 0 0 24px 0;
          line-height: 1.05;
          letter-spacing: -1px;
        }
        .stf-hero h1 span {
          color: #0A7C6E;
        }
        .stf-hero p {
          font-size: 1.125rem;
          color: #9ca3af;
          max-width: 650px;
          line-height: 1.6;
          margin: 0;
        }

        /* Layout Grid */
        .stf-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 32px;
          align-items: stretch;
        }
        .stf-col-info {
          flex: 1;
          min-width: 320px;
        }
        .stf-col-form {
          flex: 1.5;
          min-width: 320px;
        }

        /* Cards */
        .stf-card {
          background-color: #12191d;
          border: 1px solid #1f2933;
          border-radius: 8px;
          padding: 48px;
          height: 100%;
          box-sizing: border-box;
        }
        .stf-card h2 {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #ffffff;
        }
        .stf-card-desc {
          color: #9ca3af;
          line-height: 1.6;
          margin-bottom: 48px;
          font-size: 1rem;
        }

        /* Info List */
        .stf-info-list {
          list-style: none;
          padding: 0;
          margin: 0 0 48px 0;
        }
        .stf-info-list li {
          display: flex;
          align-items: flex-start;
          margin-bottom: 32px;
          gap: 20px;
        }
        .stf-info-icon {
          color: #0A7C6E;
          font-size: 1.25rem;
          margin-top: 4px;
        }
        .stf-info-text h5 {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #ffffff;
        }
        .stf-info-text p, .stf-info-text a {
          margin: 0;
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s;
        }
        .stf-info-text a:hover {
          color: #0A7C6E;
        }

        /* Socials */
        .stf-socials {
          display: flex;
          gap: 16px;
        }
        .stf-socials a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 4px;
          background-color: #1a2329;
          color: #0A7C6E;
          text-decoration: none;
          font-size: 1.2rem;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .stf-socials a:hover {
          background-color: #0A7C6E;
          color: #ffffff;
          border-color: #0A7C6E;
        }

        /* Form Grid & Elements */
        .stf-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .stf-form-full {
          grid-column: span 2;
        }
        
        .stf-label {
          display: block;
          font-size: 0.85rem;
          color: #d1d5db;
          margin-bottom: 10px;
          font-weight: 500;
        }
        .stf-label span {
          color: #ef4444;
        }

        .stf-input {
          width: 100%;
          background-color: #0d1216;
          border: 1px solid #2a3740;
          color: #ffffff;
          padding: 14px 16px;
          border-radius: 4px;
          box-sizing: border-box;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
          font-size: 1rem;
        }
        .stf-input:focus {
          border-color: #0A7C6E;
          box-shadow: 0 0 0 1px #0A7C6E;
        }
        .stf-input.stf-invalid {
          border-color: #ef4444;
        }
        .stf-input::placeholder {
          color: #4b5563;
        }
        
        select.stf-input {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          padding-right: 40px;
        }
        select.stf-input option {
          background-color: #12191d;
          color: #ffffff;
        }

        textarea.stf-input {
          resize: vertical;
          min-height: 120px;
        }

        .stf-error-msg {
          color: #ef4444;
          font-size: 0.8rem;
          margin-top: 8px;
          display: block;
        }

        /* Checkbox */
        .stf-checkbox-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 8px;
        }
        .stf-checkbox {
          appearance: none;
          background-color: #0d1216;
          margin: 2px 0 0 0;
          font: inherit;
          color: #0A7C6E;
          width: 1.15em;
          height: 1.15em;
          border: 1px solid #2a3740;
          border-radius: 3px;
          display: grid;
          place-content: center;
          cursor: pointer;
        }
        .stf-checkbox::before {
          content: "";
          width: 0.65em;
          height: 0.65em;
          transform: scale(0);
          transition: 120ms transform ease-in-out;
          box-shadow: inset 1em 1em #0A7C6E;
          background-color: #0A7C6E;
          transform-origin: center;
          clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
        }
        .stf-checkbox:checked::before {
          transform: scale(1);
        }
        .stf-checkbox.stf-invalid {
          border-color: #ef4444;
        }

        .stf-checkbox-label {
          font-size: 0.95rem;
          color: #d1d5db;
          cursor: pointer;
          user-select: none;
          line-height: 1.4;
        }

        /* Button */
        .stf-submit-btn {
          background-color: #0A7C6E;
          color: #ffffff;
          border: none;
          padding: 16px;
          width: 100%;
          border-radius: 4px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 16px;
        }
        .stf-submit-btn:hover {
          background-color: #0d8c6b;
        }
        .stf-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Map */
        .stf-map-container {
          margin-top: 60px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #1f2933;
          background-color: #12191d;
          padding: 8px;
        }
        .stf-map-container iframe {
          border-radius: 4px;
          display: block;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .stf-hero h1 { font-size: 3.5rem; }
          .stf-card { padding: 32px; }
        }
        @media (max-width: 768px) {
          .stf-hero { padding: 50px 0 40px; }
          .stf-hero h1 { font-size: 2.75rem; }
          .stf-form-grid { grid-template-columns: 1fr; }
          .stf-form-full { grid-column: span 1; }
        }
      `}</style>

      <div className="stf-contact-page">
        {/* Banner Section */}
        <section className="stf-hero">
          <div className="stf-container">
            <span className="stf-badge">
              <i className="fa fa-envelope-open" aria-hidden="true"></i>
              Contact Staffoo
            </span>
            <h1>Let&apos;s Build <span>Your Team</span> Faster</h1>
            <p>
              Send us your hiring needs, billing questions, or platform
              feedback. Our support team usually replies within one business
              day.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section>
          <div className="stf-container stf-grid">

            {/* Left Column: Contact Info */}
            <div className="stf-col-info">
              <div className="stf-card">
                <h2>Get In Touch</h2>
                <p className="stf-card-desc">
                  Reach us by email, phone, or by using this form. For urgent
                  account issues, include your registered email and a short
                  summary so we can prioritize your case.
                </p>

                <ul className="stf-info-list">
                  <li>
                    <span className="stf-info-icon">
                      <i className="fa fa-map-marker" aria-hidden="true"></i>
                    </span>
                    <div className="stf-info-text">
                      <h5>Admin Office</h5>
                      <p>21 Tanglewood Bvd, Truganina VIC 3029, Australia</p>
                    </div>
                  </li>
                  <li>
                    <span className="stf-info-icon">
                      <i className="fa fa-envelope" aria-hidden="true"></i>
                    </span>
                    <div className="stf-info-text">
                      <h5>Email</h5>
                      <Link to="mailto:admin@staffoo.com.au">
                        admin@staffoo.com.au
                      </Link>
                    </div>
                  </li>
                  <li>
                    <span className="stf-info-icon">
                      <i className="fa fa-phone" aria-hidden="true"></i>
                    </span>
                    <div className="stf-info-text">
                      <h5>Phone</h5>
                      <Link to="tel:1800 782 366">1800 782 366</Link>
                    </div>
                  </li>
                  <li>
                    <span className="stf-info-icon">
                      <i className="fa fa-clock" aria-hidden="true"></i>
                    </span>
                    <div className="stf-info-text">
                      <h5>Business Hours</h5>
                      <p>Mon - Fri, 9:00 AM - 6:00 PM (AEST)</p>
                    </div>
                  </li>
                </ul>

                <div className="stf-socials" aria-label="Social links">
                  <Link
                    to="https://www.facebook.com/profile.php?id=61582204185867"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <i className="fab fa-facebook" aria-hidden="true"></i>
                  </Link>
                  <Link
                    to="https://www.instagram.com/staffoo_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <i className="fab fa-instagram" aria-hidden="true"></i>
                  </Link>
                  <Link
                    to="https://www.linkedin.com/company/staff-o/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                  >
                    <i className="fab fa-linkedin" aria-hidden="true"></i>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="stf-col-form">
              <div className="stf-card">
                <h2>Send A Message</h2>
                <p className="stf-card-desc">
                  Tell us what you need and we will route your message to the
                  right team.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="stf-form-grid">

                    <div>
                      <label htmlFor="fullName" className="stf-label">
                        Full Name <span>*</span>
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        className={`stf-input ${errors.fullName ? "stf-invalid" : ""}`}
                        placeholder="Enter your full name"
                        value={form.fullName}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                      />
                      {errors.fullName && (
                        <span className="stf-error-msg">{errors.fullName}</span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="stf-label">
                        Email Address <span>*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={`stf-input ${errors.email ? "stf-invalid" : ""}`}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                      />
                      {errors.email && (
                        <span className="stf-error-msg">{errors.email}</span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="stf-label">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={`stf-input ${errors.phone ? "stf-invalid" : ""}`}
                        placeholder="Optional"
                        value={form.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                      />
                      {errors.phone && (
                        <span className="stf-error-msg">{errors.phone}</span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="company" className="stf-label">
                        Company
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        className="stf-input"
                        placeholder="Optional"
                        value={form.company}
                        onChange={handleChange}
                        autoComplete="organization"
                      />
                    </div>

                    <div>
                      <label htmlFor="inquiryType" className="stf-label">
                        Inquiry Type
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        className="stf-input"
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

                    <div>
                      <label htmlFor="subject" className="stf-label">
                        Subject <span>*</span>
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        className={`stf-input ${errors.subject ? "stf-invalid" : ""}`}
                        placeholder="What can we help with?"
                        value={form.subject}
                        onChange={handleChange}
                        required
                      />
                      {errors.subject && (
                        <span className="stf-error-msg">{errors.subject}</span>
                      )}
                    </div>

                    <div className="stf-form-full">
                      <label htmlFor="message" className="stf-label">
                        Message <span>*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        className={`stf-input ${errors.message ? "stf-invalid" : ""}`}
                        placeholder="Please include details such as timeline, role types, or account issue context."
                        value={form.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                      {errors.message && (
                        <span className="stf-error-msg">{errors.message}</span>
                      )}
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

                    <div className="stf-form-full">
                      <div className="stf-checkbox-wrapper">
                        <input
                          id="consent"
                          name="consent"
                          type="checkbox"
                          className={`stf-checkbox ${errors.consent ? "stf-invalid" : ""}`}
                          checked={form.consent}
                          onChange={handleChange}
                        />
                        <label htmlFor="consent" className="stf-checkbox-label">
                          I agree to be contacted regarding my request.
                        </label>
                      </div>
                      {errors.consent && (
                        <span className="stf-error-msg">{errors.consent}</span>
                      )}
                    </div>

                    <div className="stf-form-full">
                      <button
                        type="submit"
                        className="stf-submit-btn"
                        disabled={loading}
                      >
                        {loading ? "Sending message..." : "Submit Message"}
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            </div>

          </div>
        </section>

        {/* Map Section */}
        <section className="stf-container">
          <div className="stf-map-container">
            <iframe
              title="Staffoo office map"
              src="https://www.google.com/maps?q=21+Tanglewood+Bvd+Truganina+VIC+3029&output=embed"
              width="100%"
              height="420"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}