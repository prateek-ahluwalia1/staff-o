import React, { useState, useEffect } from "react";
import useFetch from "../hooks/useFetch";
import { useSelector } from "react-redux";

export default function EditProfile() {
  const { userdata } = useSelector((state) => state.auth);
  const {
    data: profileData,
    loading: fetchLoading,
    error: fetchError,
  } = useFetch(`api/user/${userdata?.date?.id}/edit`, { isAuth: true });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    preferredLocations: "",
    website: "",
    portfolio: "",
    summary: "",
    experienceLevel: "10+ years",
    currentCompany: "",
    noticePeriod: "2 weeks",
    employmentType: "Full-time",
    salaryRange: "",
    workPreference: "Remote friendly",
    dreamRoles: "",
  });

  useEffect(() => {
    if (profileData?.data) {
      const d = profileData.data;
      setFormData((prev) => ({
        ...prev,
        fullName: d.fullName ?? prev.fullName,
        title: d.title ?? prev.title,
        email: d.email ?? prev.email,
        phone: d.phone ?? prev.phone,
        location: d.location ?? prev.location,
        preferredLocations: d.preferredLocations ?? prev.preferredLocations,
        website: d.website ?? prev.website,
        portfolio: d.portfolio ?? prev.portfolio,
        summary: d.summary ?? prev.summary,
        experienceLevel: d.experienceLevel ?? prev.experienceLevel,
        currentCompany: d.currentCompany ?? prev.currentCompany,
        noticePeriod: d.noticePeriod ?? prev.noticePeriod,
        employmentType: d.employmentType ?? prev.employmentType,
        salaryRange: d.salaryRange ?? prev.salaryRange,
        workPreference: d.workPreference ?? prev.workPreference,
        dreamRoles: d.dreamRoles ?? prev.dreamRoles,
      }));
      if (d.profilePhoto) setProfilePhoto(d.profilePhoto);
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setProfilePhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you can send data to backend later
    alert("Profile changes saved! (Demo)");
  };

  if (fetchLoading) {
    return (
      <div className="dashboard-main">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="dashboard-main">
        <p className="text-danger">
          Error loading profile:{" "}
          {typeof fetchError === "string" ? fetchError : "Something went wrong"}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      <div className="dashboard-main">
        <div className="settings-header">
          <div className="avatar-upload">
            <img
              src={profilePhoto || "/assets/images/candidates/01.jpg"}
              alt="Job Seeker"
            />
            <label className="upload-label">
              <input
                type="file"
                onChange={handlePhotoChange}
                accept="image/*"
              />
              <i
                className="fa-solid fa-arrow-up-from-bracket"
                aria-hidden="true"
              ></i>
              Update Photo
            </label>
          </div>

          <div className="settings-header-content">
            <span>Candidate Profile</span>
            <h2>Job Seeker</h2>
            <p>
              Keep your information fresh so hiring teams understand your
              intent, availability and the type of roles you’re excited about.
            </p>
            <div className="settings-header-meta">
              <span>
                <i className="fa-solid fa-briefcase" aria-hidden="true"></i>
                Product Design Lead
              </span>
              <span>
                <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                Remote · USA
              </span>
              <span>
                <i className="fa-solid fa-clock" aria-hidden="true"></i>
                Updated 2 days ago
              </span>
            </div>
          </div>
        </div>

        <form className="settings-form" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div>
                <p className="text-uppercase text-muted small fw-semibold mb-1">
                  Profile
                </p>
                <h3>Personal Information</h3>
                <p>
                  These details power your public profile and application cards.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm rounded-3"
              >
                <i className="fa-solid fa-file-arrow-up" aria-hidden="true"></i>
                Upload résumé
              </button>
            </div>

            <div className="settings-grid">
              <div>
                <label htmlFor="fullName" className="form-label">
                  Full name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  placeholder="Jordan Blake"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="title" className="form-label">
                  Professional title
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  placeholder="Lead Product Designer"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="phone" className="form-label">
                  Phone
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="location" className="form-label">
                  Primary location
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  placeholder="Seattle, USA"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="preferredLocations" className="form-label">
                  Preferred locations
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="preferredLocations"
                  placeholder="Remote · San Francisco · Berlin"
                  value={formData.preferredLocations}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="website" className="form-label">
                  Website
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="website"
                  placeholder="https://www.personal-site.com/"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="portfolio" className="form-label">
                  Portfolio / Case study
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="portfolio"
                  placeholder="https://dribbble.com/jordan"
                  value={formData.portfolio}
                  onChange={handleChange}
                />
              </div>

              <div className="grid-span-2">
                <label htmlFor="summary" className="form-label">
                  About you
                </label>
                <textarea
                  className="form-control"
                  id="summary"
                  placeholder="Summarize your superpowers, recent wins, and what you’re looking for next."
                  value={formData.summary}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Professional Snapshot */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div>
                <p className="text-uppercase text-muted small fw-semibold mb-1">
                  Career
                </p>
                <h3>Professional Snapshot</h3>
                <p>Showcase your current standing and ideal role.</p>
              </div>
            </div>

            <div className="settings-grid">
              <div>
                <label htmlFor="experienceLevel" className="form-label">
                  Experience level
                </label>
                <select
                  className="form-select"
                  id="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                >
                  <option>10+ years</option>
                  <option>8-10 years</option>
                  <option>5-7 years</option>
                  <option>2-4 years</option>
                  <option>Entry level</option>
                </select>
              </div>

              <div>
                <label htmlFor="currentCompany" className="form-label">
                  Current company
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="currentCompany"
                  placeholder="Skyline Digital"
                  value={formData.currentCompany}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="noticePeriod" className="form-label">
                  Notice period
                </label>
                <select
                  className="form-select"
                  id="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleChange}
                >
                  <option>2 weeks</option>
                  <option>1 week</option>
                  <option>30 days</option>
                  <option>45 days</option>
                  <option>Immediately available</option>
                </select>
              </div>

              <div>
                <label htmlFor="employmentType" className="form-label">
                  Desired employment
                </label>
                <select
                  className="form-select"
                  id="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                >
                  <option>Full-time</option>
                  <option>Contract</option>
                  <option>Freelance</option>
                  <option>Internship</option>
                  <option>Part-time</option>
                </select>
              </div>

              <div>
                <label htmlFor="salaryRange" className="form-label">
                  Salary expectation
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="salaryRange"
                  placeholder="USD 120k – 150k / year"
                  value={formData.salaryRange}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="workPreference" className="form-label">
                  Work preference
                </label>
                <select
                  className="form-select"
                  id="workPreference"
                  value={formData.workPreference}
                  onChange={handleChange}
                >
                  <option>Remote friendly</option>
                  <option>On-site only</option>
                  <option>Hybrid</option>
                </select>
              </div>

              <div className="grid-span-2">
                <label htmlFor="dreamRoles" className="form-label">
                  Target roles
                </label>
                <textarea
                  className="form-control"
                  id="dreamRoles"
                  placeholder="Principal Product Designer, Product Design Manager, Design Lead"
                  value={formData.dreamRoles}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div>
                <p className="text-uppercase text-muted small fw-semibold mb-1">
                  Skills
                </p>
                <h3>Skills & Tools</h3>
                <p>Highlight stacks, frameworks, and certifications.</p>
              </div>
            </div>

            <div className="skill-tags">
              <span className="skill-tag">Product Strategy</span>
              <span className="skill-tag">Design Systems</span>
              <span className="skill-tag">Figma</span>
              <span className="skill-tag">React</span>
              <span className="skill-tag">UX Research</span>
            </div>

            <button type="button" className="add-skill-btn">
              <i className="fa-solid fa-plus" aria-hidden="true"></i> Add skill
            </button>
          </div>

          {/* Experience & Education */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div>
                <p className="text-uppercase text-muted small fw-semibold mb-1">
                  Experience
                </p>
                <h3>Experience & Education</h3>
                <p>Keep your latest role and flagship education updated.</p>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-3"
              >
                <i className="fa-solid fa-circle-plus" aria-hidden="true"></i>
                Add entry
              </button>
            </div>

            <div className="settings-grid">
              <div>
                <label htmlFor="expCompany" className="form-label">
                  Company
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="expCompany"
                  placeholder="Skyline Digital"
                />
              </div>

              <div>
                <label htmlFor="expRole" className="form-label">
                  Role
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="expRole"
                  placeholder="Lead Product Designer"
                />
              </div>

              <div>
                <label htmlFor="expStart" className="form-label">
                  Start date
                </label>
                <input type="month" className="form-control" id="expStart" />
              </div>

              <div>
                <label htmlFor="expEnd" className="form-label">
                  End date
                </label>
                <input type="month" className="form-control" id="expEnd" />
              </div>

              <div className="grid-span-2">
                <label htmlFor="expHighlights" className="form-label">
                  Key highlights
                </label>
                <textarea
                  className="form-control"
                  id="expHighlights"
                  placeholder="Scaled design system, mentored 6 designers, partnered with research to ship 4 product lines."
                />
              </div>

              <div>
                <label htmlFor="eduSchool" className="form-label">
                  Education
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="eduSchool"
                  placeholder="Stanford · BSc Human Computer Interaction"
                />
              </div>

              <div>
                <label htmlFor="eduYear" className="form-label">
                  Graduation year
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="eduYear"
                  placeholder="2014"
                />
              </div>
            </div>
          </div>

          {/* Social & Contact Links */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div>
                <p className="text-uppercase text-muted small fw-semibold mb-1">
                  Links
                </p>
                <h3>Social & Contact Links</h3>
                <p>Share channels where hiring teams can follow your work.</p>
              </div>
            </div>

            <div className="settings-grid">
              <div>
                <label htmlFor="linkLinkedIn" className="form-label">
                  LinkedIn
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="linkLinkedIn"
                  placeholder="https://www.linkedin.com/in/username"
                />
              </div>

              <div>
                <label htmlFor="linkDribbble" className="form-label">
                  Dribbble
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="linkDribbble"
                  placeholder="https://dribbble.com/username"
                />
              </div>

              <div>
                <label htmlFor="linkGithub" className="form-label">
                  GitHub / Code
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="linkGithub"
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label htmlFor="linkTwitter" className="form-label">
                  Twitter / X
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="linkTwitter"
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-outline-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
