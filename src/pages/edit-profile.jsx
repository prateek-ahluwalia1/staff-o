import { useState, useEffect, useCallback, useMemo } from "react";
import useFetch from "../hooks/useFetch";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";

const INITIAL_FORM_STATE = {
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
};

export default function EditProfile() {
  const { userdata } = useSelector((state) => state.auth);

  const endpoint = useMemo(
    () => (userdata?.data?.id ? `api/user-edit/${userdata.data.id}` : null),
    [userdata?.data?.id],
  );

  const {
    data: profileData,
    loading: fetchLoading,
    error: fetchError,
  } = useFetch(endpoint, { isAuth: true });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (!profileData?.data) return;

    const d = profileData.data;
    setFormData((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(INITIAL_FORM_STATE)) {
        if (d[key] != null) next[key] = d[key];
      }
      return next;
    });

    if (d.profilePhoto) setProfilePhoto(d.profilePhoto);
  }, [profileData]);

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(URL.createObjectURL(file));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      // TODO: replace with actual API call via useSubmit
      console.log("Form submitted:", formData);
      alert("Profile changes saved! (Demo)");
    },
    [formData],
  );

  if (fetchLoading) {
    return <Loader fullPage />;
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

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button type="submit" className="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
