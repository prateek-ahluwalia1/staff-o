import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";
import "swiper/css";
import "swiper/css/navigation";

function formatDate(value) {
  if (!value) return "-";

  const normalized = String(value).replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "-";

  const normalized = String(value).replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapJobToCard(job, index) {
  const status = String(job?.job_status || "pending").toLowerCase();
  const badgeClass =
    status === "completed"
      ? "fulltime"
      : status === "assigned"
        ? "freelance"
        : "parttime";

  return {
    id: job?.id || `job-${index}`,
    type: status.charAt(0).toUpperCase() + status.slice(1),
    badgeClass,
    title: `Job #${job?.id || "N/A"}`,
    company: `Site #${job?.site_id || "N/A"}`,
    schedule: `${formatDateTime(job?.start)} - ${formatDateTime(job?.end)}`,
    hours: Number(job?.hours || 0),
    posted: formatDate(job?.updated_at || job?.created_at || job?.start),
    raw: job,
  };
}

export default function Home() {
  const { data: latestJobResponse, loading } = useFetch("api/get-all-jobs");
  const [selectedJob, setSelectedJob] = useState(null);

  const categories = [
    { title: "Security License", jobs: "(5) Jobs", icon: "admin.png" },
    { title: "MISC Time License", jobs: "(3) Jobs", icon: "it.png" },
    { title: "Working With Children", jobs: "(2) Jobs", icon: "developer.png" },
    { title: "First Aid", jobs: "(2) Jobs", icon: "data-admin.png" },
    { title: "CPR", jobs: "(2) Jobs", icon: "electrician.png" },
    { title: "White Card", jobs: "(2) Jobs", icon: "development-web.png" },
    {
      title: "Traffic Controller",
      jobs: "(2) Jobs",
      icon: "business-management.png",
    },
  ];

  const steps = [
    {
      icon: "fa-solid fa-user-plus",
      title: "Create An Account",
      description: "It's very easy to open an account and start your journey.",
    },
    {
      icon: "fa-solid fa-file",
      title: "Complete your profile",
      description:
        "Share all the key details so employers can get to know you.",
    },
    {
      icon: "fa-solid fa-paper-plane",
      title: "Apply job or hire",
      description:
        "Apply to your preferred jobs or hire top talent effortlessly.",
    },
  ];

  const latestJobs = useMemo(() => {
    const jobs = latestJobResponse?.data;
    if (!Array.isArray(jobs)) return [];
    return jobs.slice(0, 6).map((job, index) => mapJobToCard(job, index));
  }, [latestJobResponse]);

  const testimonials = [
    {
      text: "JobsPortal helped me land my dream role within weeks. The process was clean, seamless, and the support team was always ready to assist.",
      name: "Samantha Lee",
      role: "Product Designer, Bright Labs",
      image: "user1.jpg",
    },
    {
      text: "As an employer, we found top talent faster than ever before. The platform makes publishing jobs and managing applicants incredibly simple.",
      name: "Michael Robinson",
      role: "HR Manager, SphereTech",
      image: "user2.jpg",
    },
    {
      text: "I appreciate the curated job recommendations and the ability to connect directly with companies that align with my values.",
      name: "Priya Patel",
      role: "Software Engineer, Connect People",
      image: "user3.jpg",
    },
    {
      text: "We scaled our hiring pipeline dramatically thanks to JobsPortal’s reach and user-friendly tools.",
      name: "Liam Carter",
      role: "Founder, Appify Labs",
      image: "user4.jpg",
    },
  ];

  const handleOpenModal = (jobData) => {
    setSelectedJob(jobData);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    document.body.style.overflow = "auto";
  };

  if (loading) {
    return <Loader fullPage />;
  }

  return (
    <>
      <style>{`
        /* Existing Carousel & Testimonial Styles */
        .category-carousel-wrap { position: relative; padding: 0 40px; }
        .category-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 45px; height: 45px; background: white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; transition: all 0.3s; }
        .category-nav:hover { background: #f8f9fa; box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
        .category-prev { left: 0; }
        .category-next { right: 0; }
        .category-card { background: white; border-radius: 12px; padding: 50px 25px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.06); transition: all 0.3s ease; border: 1px solid #f0f0f0; }
        .category-card:hover { transform: translateY(-6px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
        .category-icon img { max-width: 65px; height: auto; margin-bottom: 15px; }
        .category-jobs { color: #6c757d; font-size: 0.95rem; }
        .category-jobs:hover { color: #0d6efd; text-decoration: none; }
        .testimonial-card { background: white; border-radius: 16px; padding: 40px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); transition: all 0.4s ease; border: 1px solid #eef0f4; }
        .testimonial-quote { color: #e9ecef; opacity: 0.6; line-height: 1; margin-bottom: 15px; }
        .testimonial-card p { font-size: 1.1rem; line-height: 1.7; color: #495057; margin-bottom: 30px; }

        /* Modern Job Card Styles (Imported from LatestJobs component) */
        .bg-light-grey { background-color: #f8f9fa; }
        .job-card { transition: all 0.3s ease; border: 1px solid rgba(0,0,0,0.05); }
        .job-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important; border-color: rgba(13, 110, 253, 0.2); }
        .icon-box { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #e9ecef; border-radius: 8px; color: #0d6efd; }
        .badge-soft-primary { background-color: rgba(13, 110, 253, 0.1); color: #0d6efd; border-radius: 6px; padding: 6px 10px; font-weight: 600; font-size: 0.8rem; }
        
        /* Modal Styles */
        .custom-modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 1050; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease-in-out; padding: 1rem; }
        .custom-modal-content { background: white; border-radius: 16px; width: 100%; max-width: 650px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: slideUp 0.3s ease-out; display: flex; flex-direction: column; }
        .custom-modal-header { padding: 1.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: white; z-index: 10; border-radius: 16px 16px 0 0; }
        .custom-modal-body { padding: 1.5rem; }
        .custom-modal-footer { padding: 1.5rem; border-top: 1px solid #eee; display: flex; justify-content: flex-end; position: sticky; bottom: 0; background: white; border-radius: 0 0 16px 16px; z-index: 10; }
        .close-btn { background: none; border: none; font-size: 1.5rem; color: #6c757d; cursor: pointer; transition: color 0.2s; }
        .close-btn:hover { color: #dc3545; }
        .detail-group { background: #f8f9fa; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid #eee; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <span className="hero-badge">Ready to Find Your Dream Job?</span>
              <h1 className="hero-title">
                Take the next step in your career journey.
              </h1>
              <p className="hero-copy">
                Explore opportunities that match your skills and passions, and
                land the job you've always wanted with JobsPortal.
              </p>

              <form className="hero-search" action="#." method="get">
                <div className="hero-search-fields">
                  <label className="hero-field">
                    <i className="fa fa-search" aria-hidden="true"></i>
                    <input
                      type="text"
                      className="form-control"
                      name="keyword"
                      placeholder="Enter skills or job title"
                    />
                  </label>
                  <label className="hero-field select-field">
                    <i className="fa fa-map-marker" aria-hidden="true"></i>
                    <select className="form-select" name="category">
                      <option defaultValue>Select Category</option>
                      <option>Marketing</option>
                      <option>Teaching & Education</option>
                      <option>Design</option>
                      <option>Development</option>
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="btn hero-submit"
                    aria-label="Search jobs"
                  >
                    <i className="fa fa-search" aria-hidden="true"></i>
                  </button>
                </div>
              </form>

              <div className="hero-actions d-flex flex-wrap align-items-center gap-3">
                <div className="hero-stat">
                  <span className="stat-value">50k+</span>
                  <span className="stat-label">Active Jobs</span>
                </div>
                <div className="hero-links d-flex gap-3">
                  <a href="/post-job" className="hero-link">
                    <i className="fa fa-briefcase" aria-hidden="true"></i> Post
                    Your Job
                  </a>
                  <a href="/candidate-listing" className="hero-link">
                    <i className="fa fa-user-o" aria-hidden="true"></i> Search
                    Jobs
                  </a>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-visual">
                <img
                  src="/assets/images/hero-image.png"
                  alt="Find a perfect job"
                  className="img-fluid hero-image"
                />
                <div className="hero-floating-card">
                  <span className="card-label">Find a Perfect Job</span>
                  <button type="button" className="btn btn-sm btn-primary">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST JOBS SECTION (UPDATED UI) */}
      <section className="section bg-light-grey py-5">
        <div className="container">
          <div className="titleTop text-center mb-5">
            <div className="subtitle">Discover Opportunities</div>
            <h3>
              Latest <span>Jobs</span>
            </h3>
          </div>

          <div className="row g-4">
            {latestJobs.map((job) => (
              <div className="col-12 col-md-6 col-xl-4" key={job.id}>
                <div className="card h-100 job-card bg-white rounded-4 p-4 shadow-sm border-0">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="badge-soft-primary">{job.title}</span>
                    <span className="badge bg-light text-dark border">
                      <i className="fa fa-clock-o me-1"></i> {job.hours}h
                    </span>
                  </div>

                  <h4 className="fw-bold mb-3 text-dark">{job.company}</h4>

                  <div className="d-flex flex-column gap-2 mb-4 text-secondary small">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="icon-box"
                        style={{ width: "28px", height: "28px" }}
                      >
                        <i className="fa fa-calendar"></i>
                      </div>
                      <span>
                        <strong>Starts:</strong>{" "}
                        {formatDateTime(job.raw?.start)}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="icon-box"
                        style={{ width: "28px", height: "28px" }}
                      >
                        <i className="fa fa-flag-checkered"></i>
                      </div>
                      <span>
                        <strong>Ends:</strong> {formatDateTime(job.raw?.end)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <div className="d-flex flex-column">
                      <span
                        className="text-muted"
                        style={{
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                        }}
                      >
                        Status
                      </span>
                      <span className="fw-semibold small text-dark text-capitalize">
                        {job.type}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline-primary rounded-pill px-3 btn-sm fw-semibold"
                      onClick={() => handleOpenModal(job.raw)}
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!latestJobs.length && (
              <div className="col-12">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-body text-center py-5">
                    <div className="display-4 text-muted mb-3">
                      <i className="fa fa-folder-open-o"></i>
                    </div>
                    <h4 className="fw-bold text-dark">No jobs found</h4>
                    <p className="text-secondary mb-0">
                      Check back again later for new opportunities.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-5">
            <Link
              to="/latest-jobs"
              className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm"
            >
              View All Latest Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section category-section">
        <div className="container">
          <div className="titleTop text-center">
            <div className="subtitle">Find Your Path</div>
            <h3>Browse Jobs By Categories</h3>
          </div>

          <div className="category-carousel-wrap position-relative">
            <div className="category-nav category-prev">
              <i className="fa fa-angle-left" aria-hidden="true"></i>
            </div>
            <div className="category-nav category-next">
              <i className="fa fa-angle-right" aria-hidden="true"></i>
            </div>

            <Swiper
              modules={[Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              navigation={{
                prevEl: ".category-prev",
                nextEl: ".category-next",
              }}
              loop={true}
              breakpoints={{
                0: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                992: { slidesPerView: 4 },
                1200: { slidesPerView: 5 },
              }}
            >
              {categories.map((cat, index) => (
                <SwiperSlide key={index}>
                  <div className="category-card text-center">
                    <div className="category-icon mb-3">
                      <img
                        src={`/assets/images/categories/${cat.icon}`}
                        alt={cat.title}
                      />
                    </div>
                    <h5 className="mb-2">{cat.title}</h5>
                    <a href="/" className="category-jobs d-block">
                      <i
                        className="fa fa-briefcase me-1"
                        aria-hidden="true"
                      ></i>
                      {cat.jobs}
                    </a>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      <section className="section howit-section">
        <div className="container">
          <div className="titleTop text-center">
            <div className="subtitle">Simple Steps</div>
            <h3>How It Works</h3>
          </div>

          <div className="row g-4 justify-content-center howit-grid">
            {steps.map((step, index) => (
              <div className="col-12 col-md-4" key={index}>
                <div className="howit-card">
                  <div className="howit-icon">
                    <i className={step.icon}></i>
                  </div>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="titleTop text-center">
            <div className="subtitle">Stories from our community</div>
            <h3>Success Stories</h3>
          </div>

          <div className="testimonials-wrap position-relative">
            <div className="testimonials-nav testimonials-prev">
              <i className="fa fa-angle-left" aria-hidden="true"></i>
            </div>
            <div className="testimonials-nav testimonials-next">
              <i className="fa fa-angle-right" aria-hidden="true"></i>
            </div>

            <Swiper
              modules={[Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              navigation={{
                prevEl: ".testimonials-prev",
                nextEl: ".testimonials-next",
              }}
              loop={true}
              breakpoints={{
                768: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
              }}
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={index}>
                  <div className="testimonial-card">
                    <div className="testimonial-quote">
                      <i className="fa fa-quote-left" aria-hidden="true"></i>
                    </div>
                    <p>{testimonial.text}</p>
                    <div className="testimonial-author">
                      <img
                        src={`/assets/images/testimonials/${testimonial.image}`}
                        alt={testimonial.name}
                      />
                      <div>
                        <span className="name">{testimonial.name}</span>
                        <span className="role">{testimonial.role}</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* App Wrapper Section */}
      <div className="appwraper">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-6">
              <div className="appimg">
                <img
                  src="/assets/images/app-screens.png"
                  alt="JobsPortal App Screens"
                />
              </div>
            </div>
            <div className="col-lg-6 col-md-6">
              <div className="titleTop">
                <div className="subtitle">Step Forword Now</div>
                <h3>The JobsPortal APP</h3>
              </div>
              <div className="subtitle2">
                A world of oppertunity in your hand
              </div>
              <p>
                Aliquam vestibulum cursus felis. In iaculis iaculis sapien ac
                condimentum. Vestibulum congue posuere lacus, id tincidunt nisi
                porta sit amet. Suspendisse et sapien varius, pellentesque dui
                non, semper orci. Curabitur blandit, diam ut ornare ultricies.
              </p>
              <div className="appbtn">
                <a href="/">
                  <img
                    src="/assets/images/apple-btn.png"
                    alt="Download on App Store"
                  />
                </a>
                <a href="/">
                  <img
                    src="/assets/images/andriod-btn.png"
                    alt="Get it on Google Play"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div className="custom-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="custom-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="custom-modal-header">
              <div>
                <h4 className="mb-0 fw-bold">Job Details</h4>
                <div className="text-muted small mt-1">
                  Job #{selectedJob.id} | Site #{selectedJob.site_id}
                </div>
              </div>
              <button className="close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <div className="custom-modal-body">
              <div className="detail-group">
                <h6 className="text-primary fw-bold mb-3">
                  <i className="fa fa-calendar me-2"></i>Schedule & Timing
                </h6>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <span className="text-muted d-block small text-uppercase">
                      Start
                    </span>
                    <strong className="text-dark">
                      {formatDateTime(selectedJob.start)}
                    </strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block small text-uppercase">
                      End
                    </span>
                    <strong className="text-dark">
                      {formatDateTime(selectedJob.end)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="detail-group">
                <h6 className="text-primary fw-bold mb-3">
                  <i className="fa fa-clock-o me-2"></i>Hours Breakdown
                </h6>
                <div className="row g-3">
                  <div className="col-4 col-sm-3">
                    <span className="text-muted d-block small">Total</span>
                    <strong>{selectedJob.hours || 0}h</strong>
                  </div>
                  <div className="col-4 col-sm-3">
                    <span className="text-muted d-block small">Morning</span>
                    <strong>{selectedJob.morning_hours || 0}h</strong>
                  </div>
                  <div className="col-4 col-sm-3">
                    <span className="text-muted d-block small">Night</span>
                    <strong>{selectedJob.night_hours || 0}h</strong>
                  </div>
                </div>
              </div>

              <div className="detail-group mb-0">
                <h6 className="text-primary fw-bold mb-3">
                  <i className="fa fa-info-circle me-2"></i>Job Requirements &
                  Info
                </h6>
                <div className="row g-3">
                  <div className="col-sm-4">
                    <span className="text-muted d-block small">Status</span>
                    <span className="badge bg-secondary text-capitalize">
                      {selectedJob.job_status || "N/A"}
                    </span>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block small">
                      Shift Payable
                    </span>
                    <span className="text-dark fw-medium text-capitalize">
                      {selectedJob.shift_payable || "No"}
                    </span>
                  </div>
                  <div className="col-sm-4">
                    <span className="text-muted d-block small">
                      ASAP Required
                    </span>
                    <span
                      className={`fw-medium ${selectedJob.asap ? "text-danger" : "text-dark"}`}
                    >
                      {selectedJob.asap ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="custom-modal-footer">
              <button
                type="button"
                className="btn btn-secondary rounded-pill px-4"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
