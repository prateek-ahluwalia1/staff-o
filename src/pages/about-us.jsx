import React from "react";
import Header from "../components/newHome/Header";
import Footer from "../components/newHome/Footer";
import teamsimg from "../assets/images/teams.png";

const highlights = [
  {
    icon: "fa-check-circle",
    title: "Verified Staff",
    copy: "All security personnel are checked for credentials, licenses, and experience.",
  },
  {
    icon: "fa-random",
    title: "Seamless Job Matching",
    copy: "Quickly connect staff, customers, and Resource Partners through one platform.",
  },
  {
    icon: "fa-calendar-check-o",
    title: "Flexible Assignments",
    copy: "Manage shifts and jobs efficiently, ensuring the right staff is assigned at the right time.",
  },
];

const missionItems = [
  {
    icon: "fa-bolt",
    text: "To make security staffing simple, fast, and trustworthy.",
  },
  {
    icon: "fa-link",
    text: "To ensure verified staff and Resource Partners are connected with customers who need reliable security services.",
  },
  {
    icon: "fa-tasks",
    text: "To provide tools that allow Resource Partners to manage assignments and workforce efficiently.",
  },
];

export default function AboutUs() {
  return (
    <>
      <Header />

      <section className="content-hero">
        <div className="container text-center">
          <span className="contact-badge mb-3">
            <i className="fa fa-building" aria-hidden="true"></i>
            About Staffoo
          </span>
          <h1>Staffoo - Connecting Security Professionals Across Australia</h1>
          <p>
            At Staffoo, we believe in building a safer, more efficient workforce
            for the security industry.
          </p>
        </div>
      </section>

      <section className="content-shell">
        <div className="container">
          <div className="content-card">
            <div className="row g-4 align-items-center">
              <div className="col-lg-7">
                <h2 className="mb-3">Our Story</h2>
                <p className="mb-3">
                  At Staffoo, we believe in connecting qualified security staff
                  with trusted customers while supporting Resource Partners in
                  managing assignments. Our platform simplifies security
                  staffing, saving time, ensuring reliability, and empowering
                  professionals across Australia.
                </p>
                <p className="mb-0">
                  Staffoo is Australia's leading platform for security jobs and
                  staffing. Find verified security jobs, hire qualified security
                  staff, or manage assignments efficiently from desktop or
                  mobile. Designed for security professionals, employers, and
                  Resource Partners, Staffoo connects trusted staff with reliable
                  opportunities nationwide.
                </p>
              </div>
              <div className="col-lg-5">
                <img
                  src={teamsimg}
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

          <div className="content-card mt-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span
                className="d-inline-flex align-items-center justify-content-center"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: "linear-gradient(145deg, #0d6efd, #0b53c1)",
                  color: "#fff",
                  boxShadow: "0 8px 18px rgba(13, 110, 253, 0.24)",
                }}
              >
                <i className="fa fa-bullseye" aria-hidden="true"></i>
              </span>
              <h2 className="mb-0">Our Mission</h2>
            </div>

            <div className="row g-3 mb-0">
              {missionItems.map((item) => (
                <div className="col-md-4" key={item.text}>
                  <div
                    className="h-100 p-3 rounded-4"
                    style={{
                      background: "#f8fbff",
                      border: "1px solid #dceafe",
                    }}
                  >
                    <div className="d-flex align-items-start gap-2">
                      <span
                        className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: "#e7f1ff",
                          color: "#0d6efd",
                        }}
                      >
                        <i className={`fa ${item.icon}`} aria-hidden="true"></i>
                      </span>
                      <p className="mb-0">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
