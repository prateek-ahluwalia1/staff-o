import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import Header from "../components/header";
import Footer from "../components/footer";
import useSubmit from "../hooks/useSubmit";

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

  const contactEndpoint = useMemo(
    () => process.env.REACT_APP_CONTACT_ENDPOINT || "api/contact-us",
    [],
  );

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

    const response = await submit(contactEndpoint, payload, { method: "POST" });

    if (response) {
      toast.success(
        "Your message has been sent. Our team will contact you soon.",
      );
      setForm(initialForm);
      setErrors({});
    }
  };

  return (
    <>
      <Header />

      <section className="contact-banner">
        <div className="container">
          <div className="contact-banner-wrapper">
            <span className="contact-badge">
              <i className="fa fa-envelope-open" aria-hidden="true"></i>
              Contact Staffo
            </span>
            <h1>Let&apos;s Build Your Team Faster</h1>
            <p>
              Send us your hiring needs, billing questions, or platform
              feedback. Our support team usually replies within one business
              day.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-content">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-5">
              <div className="contact-card h-100">
                <h2>Get In Touch</h2>
                <p className="contact-card-copy">
                  Reach us by email, phone, or by using this form. For urgent
                  account issues, include your registered email and a short
                  summary so we can prioritize your case.
                </p>

                <ul className="contact-details">
                  <li>
                    <span className="icon">
                      <i className="fa fa-map-marker" aria-hidden="true"></i>
                    </span>
                    <div>
                      <h5>Head Office</h5>
                      <p>
                        651 N Broad St, Suite 201, Middletown, Delaware 19709,
                        USA
                      </p>
                    </div>
                  </li>
                  <li>
                    <span className="icon">
                      <i className="fa fa-envelope" aria-hidden="true"></i>
                    </span>
                    <div>
                      <h5>Email</h5>
                      <a href="mailto:info@jobsportal.com">
                        info@jobsportal.com
                      </a>
                    </div>
                  </li>
                  <li>
                    <span className="icon">
                      <i className="fa fa-phone" aria-hidden="true"></i>
                    </span>
                    <div>
                      <h5>Phone</h5>
                      <a href="tel:+13025550123">+1 (302) 555-0123</a>
                    </div>
                  </li>
                  <li>
                    <span className="icon">
                      <i className="fa fa-clock-o" aria-hidden="true"></i>
                    </span>
                    <div>
                      <h5>Business Hours</h5>
                      <p>Mon - Fri, 9:00 AM - 6:00 PM (EST)</p>
                    </div>
                  </li>
                </ul>

                <div className="contact-social" aria-label="Social links">
                  <a href="/" aria-label="Facebook">
                    <i className="fab fa-facebook" aria-hidden="true"></i>
                  </a>
                  <a href="/" aria-label="X">
                    <i className="fab fa-x-twitter" aria-hidden="true"></i>
                  </a>
                  <a href="/" aria-label="Instagram">
                    <i className="fab fa-instagram" aria-hidden="true"></i>
                  </a>
                  <a href="/" aria-label="LinkedIn">
                    <i className="fab fa-linkedin" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="contact-card h-100">
                <h2>Send A Message</h2>
                <p className="contact-card-copy">
                  Tell us what you need and we will route your message to the
                  right team.
                </p>

                <form
                  className="contact-form-modern"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="fullName" className="form-label">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                        placeholder="Enter your full name"
                        value={form.fullName}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                      />
                      {errors.fullName && (
                        <div className="invalid-feedback">
                          {errors.fullName}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                        placeholder="Optional"
                        value={form.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                      />
                      {errors.phone && (
                        <div className="invalid-feedback">{errors.phone}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="company" className="form-label">
                        Company
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        className="form-control"
                        placeholder="Optional"
                        value={form.company}
                        onChange={handleChange}
                        autoComplete="organization"
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="inquiryType" className="form-label">
                        Inquiry Type
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        className="form-select"
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
                      <label htmlFor="subject" className="form-label">
                        Subject
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        className={`form-control ${errors.subject ? "is-invalid" : ""}`}
                        placeholder="What can we help with?"
                        value={form.subject}
                        onChange={handleChange}
                        required
                      />
                      {errors.subject && (
                        <div className="invalid-feedback">{errors.subject}</div>
                      )}
                    </div>

                    <div className="col-12">
                      <label htmlFor="message" className="form-label">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        className={`form-control ${errors.message ? "is-invalid" : ""}`}
                        placeholder="Please include details such as timeline, role types, or account issue context."
                        value={form.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                      {errors.message && (
                        <div className="invalid-feedback">{errors.message}</div>
                      )}
                    </div>

                    <div className="col-12" style={{ display: "none" }}>
                      <label htmlFor="website" className="form-label">
                        Website
                      </label>
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
                      <div className="form-check">
                        <input
                          id="consent"
                          name="consent"
                          type="checkbox"
                          className={`form-check-input ${errors.consent ? "is-invalid" : ""}`}
                          checked={form.consent}
                          onChange={handleChange}
                        />
                        <label htmlFor="consent" className="form-check-label">
                          I agree to be contacted regarding my request.
                        </label>
                        {errors.consent && (
                          <div className="invalid-feedback d-block">
                            {errors.consent}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-12">
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
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
        </div>
      </section>

      <section className="contact-offices">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6 col-xl-3">
              <article className="office-card">
                <h3>Delaware</h3>
                <p>651 N Broad St, Suite 201, Middletown, DE 19709</p>
                <a href="tel:+13025550123">
                  <i className="fa fa-phone" aria-hidden="true"></i>
                  +1 (302) 555-0123
                </a>
              </article>
            </div>

            <div className="col-md-6 col-xl-3">
              <article className="office-card">
                <h3>New York</h3>
                <p>245 Park Avenue, 39th Floor, New York, NY 10167</p>
                <a href="mailto:ny@jobsportal.com">
                  <i className="fa fa-envelope" aria-hidden="true"></i>
                  ny@jobsportal.com
                </a>
              </article>
            </div>

            <div className="col-md-6 col-xl-3">
              <article className="office-card">
                <h3>Texas</h3>
                <p>2030 Main St, Suite 1300, Dallas, TX 75201</p>
                <a href="mailto:texas@jobsportal.com">
                  <i className="fa fa-envelope" aria-hidden="true"></i>
                  texas@jobsportal.com
                </a>
              </article>
            </div>

            <div className="col-md-6 col-xl-3">
              <article className="office-card">
                <h3>California</h3>
                <p>505 Howard St, Floor 2, San Francisco, CA 94105</p>
                <a href="mailto:west@jobsportal.com">
                  <i className="fa fa-envelope" aria-hidden="true"></i>
                  west@jobsportal.com
                </a>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-map">
        <div className="container">
          <iframe
            title="Staffo office map"
            src="https://www.google.com/maps?q=651+N+Broad+St+Middletown+DE+19709&output=embed"
            width="100%"
            height="420"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      <Footer />
    </>
  );
}
