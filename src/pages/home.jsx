import React, { useRef } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import Copyright from '../components/copyright';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';


export default function Home() {

    const categories = [
  {
    icon: 'business-management.png',
    title: 'Business Management',
    jobs: '(2) Jobs',
  },
  {
    icon: 'admin.png',
    title: 'Admin',
    jobs: '(2) Jobs',
  },
  {
    icon: 'it.png',
    title: 'Information Technology',
    jobs: '(1) Jobs',
  },
  {
    icon: 'development-web.png',
    title: 'Software & Web Development',
    jobs: '(1) Jobs',
  },
  {
    icon: 'electrician.png',
    title: 'Electronics Technician',
    jobs: '(1) Jobs',
  },
  {
    icon: 'developer.png',
    title: 'Web Developer',
    jobs: '(1) Jobs',
  },
  {
    icon: 'data-admin.png',
    title: 'Database Administration',
    jobs: '(1) Jobs',
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
            `}</style>
        
            <Header />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center g-4">
                        <div className="col-lg-6">
                            <span className="hero-badge">Ready to Find Your Dream Job?</span>
                            <h1 className="hero-title">Take the next step in your career journey.</h1>
                            <p className="hero-copy">
                                Explore opportunities that match your skills and passions, and land the job you've always wanted with JobsPortal.
                            </p>

                            <form className="hero-search" action="#." method="get">
                                <div className="hero-search-fields">
                                    <label className="hero-field">
                                        <i className="fa fa-search" aria-hidden="true"></i>
                                        <input type="text" className="form-control" name="keyword" placeholder="Enter skills or job title" />
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

                                    <button type="submit" className="btn hero-submit" aria-label="Search jobs">
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
                                        <i className="fa fa-briefcase" aria-hidden="true"></i> Post Your Job
                                    </a>
                                    <a href="/candidate-listing" className="hero-link">
                                        <i className="fa fa-user-o" aria-hidden="true"></i> Search Jobs
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="hero-visual">
                                <img src="/assets/images/hero-image.png" alt="Find a perfect job" className="img-fluid hero-image" />
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
                            <a href="#" data-bs-toggle="modal" data-bs-target="#preresume" className="userloginbox">
                                <h3>Search your desired Job</h3>
                                <p>Discover a career you are passionate about</p>
                                <img src="/assets/images/icons/search-job-icon.png" alt="Search your desired Job" />
                            </a>
                        </div>
                        <div className="col-md-6">
                            <a href="#" data-bs-toggle="modal" data-bs-target="#prejobpost" className="userloginbox postjobbox">
                                <h3>Post a Job Today</h3>
                                <p>Discover the ideal candidate for your team</p>
                                <img src="/assets/images/icons/postjob.png" alt="Post a Job Today" />
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
                                    <img src="/assets/images/employers/emplogo1.jpg" alt="Multimedia Design" />
                                </div>
                                <h5>Multimedia Design</h5>
                                <div className="company-meta">
                                    <i className="fa fa-map-marker" aria-hidden="true"></i> United States of America
                                </div>
                                <div className="company-openings">
                                    <i className="fa fa-briefcase" aria-hidden="true"></i> 5 Open Jobs
                                </div>
                            </a>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <a href="company-detail.html" className="company-card">
                                <div className="company-logo">
                                    <img src="/assets/images/employers/emplogo2.jpg" alt="Power Wave" />
                                </div>
                                <h5>Power Wave</h5>
                                <div className="company-meta">
                                    <i className="fa fa-map-marker" aria-hidden="true"></i> United States of America
                                </div>
                                <div className="company-openings">
                                    <i className="fa fa-briefcase" aria-hidden="true"></i> 2 Open Jobs
                                </div>
                            </a>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <a href="company-detail.html" className="company-card">
                                <div className="company-logo">
                                    <img src="/assets/images/employers/emplogo3.jpg" alt="Travel Advisor" />
                                </div>
                                <h5>Travel Advisor</h5>
                                <div className="company-meta">
                                    <i className="fa fa-map-marker" aria-hidden="true"></i> United States of America
                                </div>
                                <div className="company-openings">
                                    <i className="fa fa-briefcase" aria-hidden="true"></i> 0 Open Jobs
                                </div>
                            </a>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <a href="company-detail.html" className="company-card">
                                <div className="company-logo">
                                    <img src="/assets/images/employers/emplogo4.jpg" alt="New Design Studio" />
                                </div>
                                <h5>New Design Studio</h5>
                                <div className="company-meta">
                                    <i className="fa fa-map-marker" aria-hidden="true"></i> United States of America
                                </div>
                                <div className="company-openings">
                                    <i className="fa fa-briefcase" aria-hidden="true"></i> 1 Open Job
                                </div>
                            </a>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <a href="company-detail.html" className="company-card">
                                <div className="company-logo">
                                    <img src="/assets/images/employers/emplogo5.jpg" alt="Net Design" />
                                </div>
                                <h5>Net Design</h5>
                                <div className="company-meta">
                                    <i className="fa fa-map-marker" aria-hidden="true"></i> United States of America
                                </div>
                                <div className="company-openings">
                                    <i className="fa fa-briefcase" aria-hidden="true"></i> 1 Open Job
                                </div>
                            </a>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <a href="company-detail.html" className="company-card">
                                <div className="company-logo">
                                    <img src="/assets/images/employers/emplogo6.jpg" alt="Power Color" />
                                </div>
                                <h5>Power Color</h5>
                                <div className="company-meta">
                                    <i className="fa fa-map-marker" aria-hidden="true"></i> United States of America
                                </div>
                                <div className="company-openings">
                                    <i className="fa fa-briefcase" aria-hidden="true"></i> 2 Open Jobs
                                </div>
                            </a>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <a href="company-detail.html" className="company-card">
                                <div className="company-logo">
                                    <img src="/assets/images/employers/emplogo7.jpg" alt="Connect People" />
                                </div>
                                <h5>Connect People</h5>
                                <div className="company-meta">
                                    <i className="fa fa-map-marker" aria-hidden="true"></i> United States of America
                                </div>
                                <div className="company-openings">
                                    <i className="fa fa-briefcase" aria-hidden="true"></i> 2 Open Jobs
                                </div>
                            </a>
                        </div>

                        <div className="col-12 col-sm-6 col-lg-3">
                            <a href="company-detail.html" className="company-card">
                                <div className="company-logo">
                                    <img src="/assets/images/employers/emplogo8.jpg" alt="Surf Wave" />
                                </div>
                                <h5>Surf Wave</h5>
                                <div className="company-meta">
                                    <i className="fa fa-map-marker" aria-hidden="true"></i> United States of America
                                </div>
                                <div className="company-openings">
                                    <i className="fa fa-briefcase" aria-hidden="true"></i> 1 Open Job
                                </div>
                            </a>
                        </div>

                    </div>
                    <div className="company-viewall text-center">
                        <a href="/companies" className="btn btn-primary">View All Featured Companies</a>
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
          {/* Custom arrows – positioned absolutely */}
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
              prevEl: '.category-prev',
              nextEl: '.category-next',
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
                  <a href="#" className="category-jobs d-block">
                    <i className="fa fa-briefcase me-1" aria-hidden="true"></i>
                    {cat.jobs}
                  </a>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="category-viewall text-center mt-5">
          <a href="#" className="btn btn-primary px-5 py-3">
            View All Categories
          </a>
        </div>
      </div>
    </section>

      {/* Example: Featured Jobs */}
      <div className="section">
        <div className="container">
          <div className="titleTop">
            <div className="subtitle">Here You Can See</div>
            <h3>Featured <span>Jobs</span></h3>
          </div>
          <div className="row g-4 featured-jobs">
            {/* Paste all 8 job cards here */}
          </div>
          <div className="category-viewall text-center">
            <a href="/jobs" className="btn btn-primary">View All Featured Jobs</a>
          </div>
        </div>
      </div>

      <Footer />
      <Copyright />
    </>
  );
}