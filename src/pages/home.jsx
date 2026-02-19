import React, { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

export default function Home() {
  const categories = [
    {
      icon: "business-management.png",
      title: "Business Management",
      jobs: "(2) Jobs",
    },
    {
      icon: "admin.png",
      title: "Admin",
      jobs: "(2) Jobs",
    },
    {
      icon: "it.png",
      title: "Information Technology",
      jobs: "(1) Jobs",
    },
    {
      icon: "development-web.png",
      title: "Software & Web Development",
      jobs: "(1) Jobs",
    },
    {
      icon: "electrician.png",
      title: "Electronics Technician",
      jobs: "(1) Jobs",
    },
    {
      icon: "developer.png",
      title: "Web Developer",
      jobs: "(1) Jobs",
    },
    {
      icon: "data-admin.png",
      title: "Database Administration",
      jobs: "(1) Jobs",
    },
  ];

  const industries = [
    { icon: "fa-industry", label: "Manufacturing (5)" },
    { icon: "fa-female", label: "Fashion (2)" },
    { icon: "fa-plug", label: "Electronics (2)" },
    { icon: "fa-bullhorn", label: "Advertising/PR (2)" },
    { icon: "fa-desktop", label: "Information Technology (2)" },
    { icon: "fa-truck", label: "Courier/Logistics (1)" },
    { icon: "fa-car", label: "Automobile (1)" },
    { icon: "fa-graduation-cap", label: "Education/Training (1)" },
    { icon: "fa-university", label: "Banking/Financial Services (1)" },
    { icon: "fa-heartbeat", label: "Health & Fitness (1)" },
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

  const featuredJobs = [
    {
      type: "Full Time/Permanent",
      title: "Full Stack Designer",
      location: "Barrington",
      date: "Mar 07, 2025",
      company: "Connect People",
      logo: "emplogo7.jpg",
    },
    {
      type: "Part Time",
      title: "Marketing Specialist",
      location: "New York",
      date: "Mar 10, 2025",
      company: "Power Wave",
      logo: "emplogo2.jpg",
    },
    {
      type: "Freelance",
      title: "UI Engineer",
      location: "Los Angeles",
      date: "Mar 12, 2025",
      company: "Design Studio",
      logo: "emplogo4.jpg",
    },
    {
      type: "Contract",
      title: "Data Analyst",
      location: "Chicago",
      date: "Mar 15, 2025",
      company: "Sphere Tech",
      logo: "emplogo9.jpg",
    },
    {
      type: "Internship",
      title: "Junior QA Engineer",
      location: "Austin",
      date: "Mar 18, 2025",
      company: "Media Wave",
      logo: "emplogo10.jpg",
    },
    {
      type: "Remote",
      title: "Product Manager",
      location: "Remote",
      date: "Mar 20, 2025",
      company: "Power Color",
      logo: "emplogo6.jpg",
    },
    {
      type: "Hybrid",
      title: "DevOps Engineer",
      location: "Seattle",
      date: "Mar 22, 2025",
      company: "Surf Wave",
      logo: "emplogo8.jpg",
    },
    {
      type: "Full Time",
      title: "Mobile App Developer",
      location: "Miami",
      date: "Mar 24, 2025",
      company: "Power Wave",
      logo: "emplogo2.jpg",
    },
  ];

  const cities = [
    {
      name: "Atlanta",
      jobs: "18 Jobs",
      image: "atlanta.jpg",
    },
    {
      name: "Barrington",
      jobs: "9 Jobs",
      image: "barrington.jpg",
    },
    {
      name: "Durant",
      jobs: "12 Jobs",
      image: "durant.jpg",
    },
    {
      name: "Bessemer",
      jobs: "6 Jobs",
      image: "bessemer.jpg",
    },
  ];

  const latestJobs = [
    {
      type: "Full Time",
      badgeClass: "fulltime",
      title: "Technical Database Engineer",
      company: "Datebase Management Company",
      location: "New York",
      posted: "Mar 07, 2025",
      logo: "emplogo1.jpg",
    },
    {
      type: "Freelance",
      badgeClass: "freelance",
      title: "Front-end Developer",
      company: "Creative Studio",
      location: "Boston",
      posted: "Mar 05, 2025",
      logo: "emplogo11.jpg",
    },
    {
      type: "Part Time",
      badgeClass: "parttime",
      title: "Product Designer",
      company: "Bright Agency",
      location: "Chicago",
      posted: "Mar 04, 2025",
      logo: "emplogo12.jpg",
    },
    {
      type: "Freelance",
      badgeClass: "freelance",
      title: "Mobile Developer",
      company: "Appify Labs",
      location: "Remote",
      posted: "Mar 02, 2025",
      logo: "emplogo13.jpg",
    },
    {
      type: "Full Time",
      badgeClass: "fulltime",
      title: "Senior UX Researcher",
      company: "Insights Co.",
      location: "San Francisco",
      posted: "Feb 28, 2025",
      logo: "emplogo14.jpg",
    },
    {
      type: "Full Time",
      badgeClass: "fulltime",
      title: "Systems Administrator",
      company: "Sphere Networks",
      location: "Austin",
      posted: "Feb 26, 2025",
      logo: "emplogo15.jpg",
    },
    {
      type: "Part Time",
      badgeClass: "parttime",
      title: "Social Media Strategist",
      company: "Connect Agency",
      location: "Denver",
      posted: "Feb 25, 2025",
      logo: "emplogo16.jpg",
    },
    {
      type: "Remote",
      badgeClass: "remote",
      title: "Support Engineer",
      company: "Helpline Inc.",
      location: "Remote",
      posted: "Feb 23, 2025",
      logo: "emplogo2.jpg",
    },
    {
      type: "Full Time",
      badgeClass: "fulltime",
      title: "Backend Engineer",
      company: "Rapid Systems",
      location: "Phoenix",
      posted: "Feb 22, 2025",
      logo: "emplogo3.jpg",
    },
  ];

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

  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Subscribe email:", email);
    setEmail("");
    alert("Thank you for subscribing! (This is a demo)");
  };

  const blogPosts = [
    {
      image: "blog/1.jpg",
      tag: "Hiring",
      tagClass: "",
      date: "17 Sep",
      readTime: "7 min read",
      title: "How to design a candidate experience that actually converts",
      excerpt:
        "From first touch to offer, here’s the messaging stack and automation playbook we use to keep talent engaged.",
      authorImage: "coment-avatar-1.jpg",
      authorName: "Samira Hodge",
      authorRole: "Employer Brand Lead",
    },
    {
      image: "blog/2.jpg",
      tag: "Leadership",
      tagClass: "teal",
      date: "15 Sep",
      readTime: "5 min read",
      title: "7 rituals our leadership team uses to stay aligned remotely",
      excerpt:
        "Weekly dashboards, async standups, and lightweight rituals that keep strategic bets on track.",
      authorImage: "coment-avatar-2.jpg",
      authorName: "Devon Marks",
      authorRole: "Chief of Staff",
    },
    {
      image: "blog/3.jpg",
      tag: "Culture",
      tagClass: "orange",
      date: "12 Sep",
      readTime: "6 min read",
      title: "Inside the onboarding sprint that ramps new hires in 10 days",
      excerpt:
        "A look at how we bundle product education, values training, and buddy systems into a cohesive journey.",
      authorImage: "coment-avatar-3.jpg",
      authorName: "Lily Ortega",
      authorRole: "People Programs",
    },
  ];

  return (
    <>
      <style>{`
                .category-carousel-wrap {
                    position: relative;
                    padding: 0 40px;
                }

                .category-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 45px;
                    height: 45px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    transition: all 0.3s;
                }

                .category-nav:hover {
                    background: #f8f9fa;
                    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
                }

                .category-prev { left: 0; }
                .category-next { right: 0; }

                .category-card {
                    background: white;
                    border-radius: 12px;
                    padding: 50px 25px;
                    text-align: center;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.06);
                    transition: all 0.3s ease;
                    border: 1px solid #f0f0f0;
                }

                .category-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1);
                }

                .category-icon img {
                    max-width: 65px;
                    height: auto;
                    margin-bottom: 15px;
                }

                .category-jobs {
                    color: #6c757d;
                    font-size: 0.95rem;
                }

                .category-jobs:hover {
                    color: #0d6efd;
                    text-decoration: none;
                }

                .testimonial-card {
                    background: white;
                    border-radius: 16px;
                    padding: 40px 30px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    transition: all 0.4s ease;
                    border: 1px solid #eef0f4;
                }

                .testimonial-quote {
                    color: #e9ecef;
                    opacity: 0.6;
                    line-height: 1;
                    margin-bottom: 15px;
                }

                .testimonial-card p {
                    font-size: 1.1rem;
                    line-height: 1.7;
                    color: #495057;
                    margin-bottom: 30px;
                }

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
                      <option selected>Select Category</option>
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

      {/* Info Data Wrap (Search Job / Post Job boxes) */}
      <div className="infodatawrap">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <a
                href="/"
                data-bs-toggle="modal"
                data-bs-target="#preresume"
                className="userloginbox"
              >
                <h3>Search your desired Job</h3>
                <p>Discover a career you are passionate about</p>
                <img
                  src="/assets/images/icons/search-job-icon.png"
                  alt="Search your desired Job"
                />
              </a>
            </div>
            <div className="col-md-6">
              <a
                href="/"
                data-bs-toggle="modal"
                data-bs-target="#prejobpost"
                className="userloginbox postjobbox"
              >
                <h3>Post a Job Today</h3>
                <p>Discover the ideal candidate for your team</p>
                <img
                  src="/assets/images/icons/postjob.png"
                  alt="Post a Job Today"
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Top Companies */}
      <section className="section company-section">
        <div className="container">
          <div className="titleTop text-center">
            <div className="subtitle">Here You Can See</div>
            <h3>Top Companies are Hiring</h3>
          </div>
          <div className="row g-4 company-grid">
            <div className="col-12 col-sm-6 col-lg-3">
              <a href="/company-detail" className="company-card">
                <div className="company-logo">
                  <img
                    src="/assets/images/employers/emplogo1.jpg"
                    alt="Multimedia Design"
                  />
                </div>
                <h5>Multimedia Design</h5>
                <div className="company-meta">
                  <i className="fa fa-map-marker" aria-hidden="true"></i> United
                  States of America
                </div>
                <div className="company-openings">
                  <i className="fa fa-briefcase" aria-hidden="true"></i> 5 Open
                  Jobs
                </div>
              </a>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <a href="/" className="company-card">
                <div className="company-logo">
                  <img
                    src="/assets/images/employers/emplogo2.jpg"
                    alt="Power Wave"
                  />
                </div>
                <h5>Power Wave</h5>
                <div className="company-meta">
                  <i className="fa fa-map-marker" aria-hidden="true"></i> United
                  States of America
                </div>
                <div className="company-openings">
                  <i className="fa fa-briefcase" aria-hidden="true"></i> 2 Open
                  Jobs
                </div>
              </a>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <a href="/" className="company-card">
                <div className="company-logo">
                  <img
                    src="/assets/images/employers/emplogo3.jpg"
                    alt="Travel Advisor"
                  />
                </div>
                <h5>Travel Advisor</h5>
                <div className="company-meta">
                  <i className="fa fa-map-marker" aria-hidden="true"></i> United
                  States of America
                </div>
                <div className="company-openings">
                  <i className="fa fa-briefcase" aria-hidden="true"></i> 0 Open
                  Jobs
                </div>
              </a>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <a href="/" className="company-card">
                <div className="company-logo">
                  <img
                    src="/assets/images/employers/emplogo4.jpg"
                    alt="New Design Studio"
                  />
                </div>
                <h5>New Design Studio</h5>
                <div className="company-meta">
                  <i className="fa fa-map-marker" aria-hidden="true"></i> United
                  States of America
                </div>
                <div className="company-openings">
                  <i className="fa fa-briefcase" aria-hidden="true"></i> 1 Open
                  Job
                </div>
              </a>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <a href="/" className="company-card">
                <div className="company-logo">
                  <img
                    src="/assets/images/employers/emplogo5.jpg"
                    alt="Net Design"
                  />
                </div>
                <h5>Net Design</h5>
                <div className="company-meta">
                  <i className="fa fa-map-marker" aria-hidden="true"></i> United
                  States of America
                </div>
                <div className="company-openings">
                  <i className="fa fa-briefcase" aria-hidden="true"></i> 1 Open
                  Job
                </div>
              </a>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <a href="/" className="company-card">
                <div className="company-logo">
                  <img
                    src="/assets/images/employers/emplogo6.jpg"
                    alt="Power Color"
                  />
                </div>
                <h5>Power Color</h5>
                <div className="company-meta">
                  <i className="fa fa-map-marker" aria-hidden="true"></i> United
                  States of America
                </div>
                <div className="company-openings">
                  <i className="fa fa-briefcase" aria-hidden="true"></i> 2 Open
                  Jobs
                </div>
              </a>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <a href="/" className="company-card">
                <div className="company-logo">
                  <img
                    src="/assets/images/employers/emplogo7.jpg"
                    alt="Connect People"
                  />
                </div>
                <h5>Connect People</h5>
                <div className="company-meta">
                  <i className="fa fa-map-marker" aria-hidden="true"></i> United
                  States of America
                </div>
                <div className="company-openings">
                  <i className="fa fa-briefcase" aria-hidden="true"></i> 2 Open
                  Jobs
                </div>
              </a>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <a href="/" className="company-card">
                <div className="company-logo">
                  <img
                    src="/assets/images/employers/emplogo8.jpg"
                    alt="Surf Wave"
                  />
                </div>
                <h5>Surf Wave</h5>
                <div className="company-meta">
                  <i className="fa fa-map-marker" aria-hidden="true"></i> United
                  States of America
                </div>
                <div className="company-openings">
                  <i className="fa fa-briefcase" aria-hidden="true"></i> 1 Open
                  Job
                </div>
              </a>
            </div>
          </div>
          <div className="company-viewall text-center">
            <a href="/companies" className="btn btn-primary">
              View All Featured Companies
            </a>
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

          <div className="category-viewall text-center mt-5">
            <a href="/" className="btn btn-primary px-5 py-3">
              View All Categories
            </a>
          </div>
        </div>
      </section>

      <section className="section industries-section">
        <div className="container">
          <div className="titleTop text-center">
            <div className="subtitle">Explore Sectors</div>
            <h3>Popular Industries</h3>
          </div>

          <div className="industries-grid">
            {industries.map((item, index) => (
              <a href="/" className="industry-chip" key={index}>
                <span className="chip-icon">
                  <i className={`fa ${item.icon}`} aria-hidden="true"></i>
                </span>
                {item.label}
              </a>
            ))}
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

      <div className="section">
        <div className="container">
          <div className="titleTop">
            <div className="subtitle">Here You Can See</div>
            <h3>
              Featured <span>Jobs</span>
            </h3>
          </div>

          {/* Featured Jobs Grid */}
          <div className="row g-4 featured-jobs">
            {featuredJobs.map((job, index) => (
              <div className="col-12 col-md-6 col-lg-3" key={index}>
                <div className="job-card">
                  <div className="job-card-status">
                    <span className="job-card-status-icon">
                      <i className="fa fa-briefcase" aria-hidden="true"></i>
                    </span>
                    {job.type}
                  </div>

                  <h4 className="job-card-title">
                    <a href="/">{job.title}</a>
                  </h4>

                  <div className="job-card-location">
                    <i className="fa fa-map-marker" aria-hidden="true"></i>{" "}
                    {job.location}
                  </div>

                  <div className="job-card-footer">
                    <div className="job-card-meta">
                      <span className="job-card-date">{job.date}</span>
                      <span className="job-card-company">{job.company}</span>
                    </div>

                    <div className="job-card-logo">
                      <img
                        src={`/assets/images/employers/${job.logo}`}
                        alt={job.company}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="category-viewall text-center">
            <a href="/job-listing" className="btn btn-primary">
              View All Featured Jobs
            </a>
          </div>
        </div>
      </div>

      <section className="section video-section-v2">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="video-content-v2">
                <span className="video-badge-v2">Here You Can See</span>
                <h2 className="video-title-v2">
                  Watch Our <span className="video-highlight-v2">Video</span>
                </h2>
                <p className="video-text-v2">
                  Aliquam vestibulum cursus felis. In iaculis iaculis sapien ac
                  condimentum. Vestibulum congue posuere lacus, id tincidunt
                  nisi porta sit amet. Suspendisse et sapien varius,
                  pellentesque dui non.
                </p>
                <ul className="video-features-v2">
                  <li>
                    <i className="fa fa-check-circle" aria-hidden="true"></i>{" "}
                    Learn about our platform
                  </li>
                  <li>
                    <i className="fa fa-check-circle" aria-hidden="true"></i>{" "}
                    Discover success stories
                  </li>
                  <li>
                    <i className="fa fa-check-circle" aria-hidden="true"></i>{" "}
                    See how it works
                  </li>
                </ul>
              </div>
            </div>

            {/* Right - Video Thumbnail + Play Button */}
            <div className="col-lg-6">
              <div className="video-wrapper-v2">
                <div className="video-thumbnail-v2">
                  <img
                    src="/assets/images/video-thumbnail.jpg"
                    alt="Video thumbnail"
                    className="video-image-v2"
                  />
                  <div className="video-overlay-v2"></div>

                  {/* Play button - opens modal */}
                  <button
                    className="video-play-btn-v2"
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#videoModalV2"
                    aria-label="Play video"
                  >
                    <div className="play-btn-circle-v2">
                      <i className="fa fa-play" aria-hidden="true"></i>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <div
        className="modal fade"
        id="videoModalV2"
        tabIndex="-1"
        aria-labelledby="videoModalV2Label"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content video-modal-content-v2">
            <button
              type="button"
              className="btn-close video-modal-close-v2"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>

            <div className="video-modal-body-v2">
              <div className="ratio ratio-16x9">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section greybg">
        <div className="container">
          <div className="titleTop">
            <div className="subtitle">Here You Can See</div>
            <h3>
              Latest <span>Jobs</span>
            </h3>
          </div>

          {/* Latest Jobs Grid */}
          <div className="row g-4 latest-jobs">
            {latestJobs.map((job, index) => (
              <div className="col-12 col-md-6 col-lg-4" key={index}>
                <div className="latest-job-card">
                  <div className="latest-job-header">
                    <span className={`badge badge-status ${job.badgeClass}`}>
                      {job.type}
                    </span>
                    <a href="/" className="bookmark">
                      <i className="fa fa-heart-o" aria-hidden="true"></i>
                    </a>
                  </div>

                  <h4>
                    <a href="/">{job.title}</a>
                  </h4>

                  <div className="latest-job-meta">
                    <span>
                      <i className="fa fa-building" aria-hidden="true"></i>{" "}
                      {job.company}
                    </span>
                    <span>
                      <i className="fa fa-map-marker" aria-hidden="true"></i>{" "}
                      {job.location}
                    </span>
                  </div>

                  <div className="latest-job-footer">
                    <div className="latest-job-company">
                      <img
                        src={`/assets/images/employers/${job.logo}`}
                        alt="Company logo"
                      />
                      <div>
                        <span className="label">Posted on</span>
                        <span className="value">{job.posted}</span>
                      </div>
                    </div>

                    <a href="/" className="btn btn-outline-primary btn-sm">
                      Apply Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div className="category-viewall text-center">
            <a href="/" className="btn btn-primary">
              View All Latest Jobs
            </a>
          </div>
        </div>
      </div>

      <section className="section cities-section">
        <div className="container">
          <div className="titleTop text-center">
            <div className="subtitle">Choose Your Location</div>
            <h3>Jobs by Cities</h3>
          </div>

          <div className="row g-4 cities-grid">
            {cities.map((city, index) => (
              <div className="col-12 col-md-6 col-lg-3" key={index}>
                <a href="/" className="city-card">
                  <div className="city-image">
                    <img
                      src={`/assets/images/cities/${city.image}`}
                      alt={city.name}
                    />
                  </div>
                  <div className="city-overlay">
                    <span>{city.name}</span>
                    <span className="city-badge">
                      <i className="fa fa-briefcase" aria-hidden="true"></i>{" "}
                      {city.jobs}
                    </span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="container">
          <div className="titleTop text-center">
            <div className="subtitle">Stories from our community</div>
            <h3>Success Stories</h3>
          </div>

          <div className="testimonials-wrap position-relative">
            {/* Custom navigation arrows */}
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

      <div className="appwraper">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-6">
              {/* app image Start */}
              <div className="appimg">
                <img
                  src="/assets/images/app-screens.png"
                  alt="JobsPortal App Screens"
                />
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              {/* app info Start */}
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

      <section className="section subscribe-section">
        <div className="container">
          <div className="subscribe-wrapper">
            {/* Left side - Text */}
            <div className="subscribe-copy">
              <span className="subscribe-badge">Stay in the loop</span>
              <h3>Subscribe To Our Newsletter</h3>
              <p>
                Get the latest jobs, hiring trends, and tips delivered directly
                to your inbox.
              </p>
            </div>

            {/* Right side - Form */}
            <form className="subscribe-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fa fa-envelope" aria-hidden="true"></i>
                </span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="btn btn-primary" type="submit">
                  Subscribe
                </button>
              </div>

              <small className="subscribe-note">
                We respect your privacy. Unsubscribe anytime.
              </small>
            </form>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="titleTop text-center">
            <div className="subtitle">Our Blog</div>
            <h3>Latest Blog Posts</h3>
          </div>

          <div className="blog-grid">
            {blogPosts.map((post, index) => (
              <article className="blog-card" key={index}>
                <div className="blog-card-media">
                  <img src={`/assets/images/${post.image}`} alt="Blog cover" />
                  <span className={`blog-card-tag ${post.tagClass}`}>
                    {post.tag}
                  </span>
                </div>

                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3>
                    <a href="/blog-detail">{post.title}</a>
                  </h3>

                  <p>{post.excerpt}</p>

                  <div className="blog-card-footer">
                    <div className="author">
                      <img
                        src={`/assets/images/${post.authorImage}`}
                        alt="Author"
                      />
                      <div>
                        <strong>{post.authorName}</strong>
                        <span>{post.authorRole}</span>
                      </div>
                    </div>

                    <a href="/blog-detail" className="text-link">
                      Read article <i className="fa-solid fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
