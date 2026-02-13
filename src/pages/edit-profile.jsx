import { useState, useEffect, useCallback, useMemo } from "react";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import Loader from "../components/Loader";

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gender: "",
  city: "",
  staff_document_type: "",
};

export default function EditProfile() {
  const dispatch = useDispatch();
  const { userdata } = useSelector((state) => state.auth);

  const endpoint = useMemo(
    () => (userdata?.data?.id ? `api/user-edit/${userdata.data.id}` : null),
    [userdata?.data?.id],
  );

  const {
    data: profileData,
    loading: fetchLoading,
    error: fetchError,
    refetch,
  } = useFetch(endpoint, { isAuth: true });

  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!profileData?.data) return;

    const d = profileData.data;
    const staff = d.staff || {};

    setFormData({
      name: d.name || "",
      email: d.email || "",
      phone: staff.phone || "",
      address: staff.address || "",
      gender: staff.gender || "",
      city: staff.city || "",
      staff_document_type: staff.staff_document_type || "",
    });

    if (staff.profile_image) setProfilePhoto(staff.profile_image);
  }, [profileData]);

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      setProfilePhoto(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitError(null);
      setSubmitSuccess(false);

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("address", formData.address);
      payload.append("gender", formData.gender);
      payload.append("city", formData.city);
      if (formData.staff_document_type) {
        payload.append("staff_document_type", formData.staff_document_type);
      }
      if (profilePhotoFile) {
        payload.append("profile_image", profilePhotoFile);
      }

      const result = await submit(
        `api/user-edit/${userdata.data.id}`,
        payload,
        { method: "POST" },
      );

      if (result.success) {
        setSubmitSuccess(true);
        if (result.data) {
          dispatch(setUser({ userdata: result.data }));
        }
        refetch();
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError(result.errors || result.message || "Update failed");
      }
    },
    [formData, profilePhotoFile, submit, userdata, dispatch, refetch],
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
      <div className="dashboard-main">
        <div className="settings-header">
          <div className="avatar-upload">
            <img
              src={profilePhoto || "/assets/images/candidates/01.jpg"}
              alt={formData.name || "Staff"}
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
            <span>Staff Profile</span>
            <h2>{formData.name || "Staff Member"}</h2>
            <p>
              Keep your information up to date so your profile stays accurate
              and complete.
            </p>
            <div className="settings-header-meta">
              <span>
                <i className="fa-solid fa-envelope" aria-hidden="true"></i>
                {formData.email || "No email"}
              </span>
              <span>
                <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                {formData.city || "No location"}
              </span>
              <span>
                <i className="fa-solid fa-user" aria-hidden="true"></i>
                {formData.gender || "Not specified"}
              </span>
            </div>
          </div>
        </div>

        {submitSuccess && (
          <div className="alert alert-success mt-3">
            Profile updated successfully!
          </div>
        )}

        {submitError && (
          <div className="alert alert-danger mt-3">
            {typeof submitError === "string"
              ? submitError
              : typeof submitError === "object"
                ? Object.values(submitError).flat().join(", ")
                : "Something went wrong"}
          </div>
        )}

        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="settings-card">
            <div className="settings-card-header">
              <div>
                <p className="text-uppercase text-muted small fw-semibold mb-1">
                  Profile
                </p>
                <h3>Personal Information</h3>
                <p>
                  These details power your profile and keep your account
                  information current.
                </p>
              </div>
            </div>

            <div className="settings-grid">
              <div>
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Muhammad Nauman"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="you@example.com"
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
                  placeholder="+92 300 0000000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="gender" className="form-label">
                  Gender
                </label>
                <select
                  className="form-control"
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  placeholder="Lahore"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="staff_document_type" className="form-label">
                  Document Type
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="staff_document_type"
                  placeholder="e.g. CNIC, Passport"
                  value={formData.staff_document_type}
                  onChange={handleChange}
                />
              </div>

              <div className="grid-span-2">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <textarea
                  className="form-control"
                  id="address"
                  placeholder="Enter your full address"
                  value={formData.address}
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
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitLoading}
              >
                {submitLoading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
