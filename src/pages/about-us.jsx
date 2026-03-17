import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";

const highlights = [
  {
    icon: "fa-users",
    title: "People First",
    copy: "We design hiring workflows that respect both candidates and employers.",
  },
  {
    icon: "fa-bolt",
    title: "Faster Hiring",
    copy: "Smart filters, messaging, and roster tools reduce hiring cycle time.",
  },
  {
    icon: "fa-shield",
    title: "Trusted Platform",
    copy: "Operational reliability and secure account controls are built in.",
  },
];

export default function AboutUs() {
  return (
    <>
      <Header />

      <section className="content-hero">
        <div className="container text-center">
          <span className="contact-badge">
            <i className="fa fa-building" aria-hidden="true"></i>
            About Staffo
          </span>
          <h1>Built For Modern Workforce Teams</h1>
          <p>
            Staffo helps employers hire confidently and helps candidates
            discover opportunities where they can grow.
          </p>
        </div>
      </section>

      <section className="content-shell">
        <div className="container">
          <div className="content-card">
            <div className="row g-4 align-items-center">
              <div className="col-lg-7">
                <h2 className="mb-3">Our Mission</h2>
                <p className="mb-3">
                  We simplify hiring operations so teams can spend less time on
                  admin and more time building great workplaces. From job
                  publishing to staff management, every workflow is designed to
                  be practical, clear, and scalable.
                </p>
                <p className="mb-0">
                  Our platform combines recruitment, communication, and billing
                  tools in one ecosystem so businesses can grow with fewer
                  disconnected systems.
                </p>
              </div>
              <div className="col-lg-5">
                <img
                  src="/assets/images/about-us-img1.jpg"
                  alt="Team collaboration"
                  className="img-fluid rounded-4"
                />
              </div>
            </div>
          </div>

          <div className="row g-4">
            {highlights.map((item) => (
              <div className="col-md-4" key={item.title}>
                <div className="content-card h-100 mb-0">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <i
                      className={`fa ${item.icon}`}
                      aria-hidden="true"
                      style={{ color: "#2563eb", fontSize: "24px" }}
                    ></i>
                    <h3 className="h5 mb-0">{item.title}</h3>
                  </div>
                  <p className="mb-0">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
