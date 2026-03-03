import { useState, useEffect, useCallback, useMemo } from "react";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import DocumentTable from "../components/DocumentTable";
import ProfileForm from "../components/ProfileForm";
import AvatarUpload from "../components/AvatarUpload";
import SettingsHeaderContent from "../components/SettingsHeaderContent";
import fallbackImage from "../assets/images/notfound.jpeg";
import { apiURL } from "../utils/exports";

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  phone: "",
  address: "",
  gender: "",
  city: "",
  state: "",
  country: "",
  coordinates: "",
  staff_document_type: "",
  company_name: "",
  registration_number: "",
};

export default function EditProfile() {
  const dispatch = useDispatch();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;

  const endpoint = useMemo(
    () =>
      userdata?.data?.id || userdata?.id
        ? `api/user-edit/${userdata?.data?.id || userdata?.id}`
        : null,
    [userdata?.data?.id, userdata?.id],
  );

  const {
    data: profileData,
    loading: fetchLoading,
    error: fetchError,
    refetch,
  } = useFetch(endpoint, { isAuth: true });

  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({
    isAuth: true,
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Document Modal States
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docForm, setDocForm] = useState({
    notes: "",
    no: false,
    exp: false,
    document_no: "",
    document_expiry: "",
    file: null,
    file_path: "",
    file_url: "",
    document_name: "",
  });

  // Card Modal States
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({
    card_holder_name: "",
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });

  const getMissingFields = (d) => {
    if (!d) return [];
    const missing = [];
    const staff = d.staff || {};
    const contractor = d.contractor || staff.contractor || {};
    if (!d.name) missing.push("Name");
    if (!d.email) missing.push("Email");
    if (!(staff.phone || contractor.phone || d.phone)) missing.push("Phone");
    if (!(d.address || staff.address || contractor.address))
      missing.push("Address");
    if (userType === "contractor" && !contractor.company_name)
      missing.push("Company Name");
    return missing;
  };
  const missingFields = getMissingFields(profileData?.data);

  useEffect(() => {
    if (!profileData?.data) return;
    const d = profileData.data;
    const staff = d.staff || {};
    const contractor = d.contractor || staff.contractor || {};

    setFormData({
      name: d.name || "",
      email: d.email || "",
      phone: staff.phone || contractor.phone || d.phone || "",
      address: d.address || staff.address || contractor.address || "",
      city: d.city || staff.city || contractor.city || "",
      state: d.state || staff.state || contractor.state || "",
      country: d.country || staff.country || contractor.country || "",
      coordinates:
        d.coordinates || staff.coordinates || contractor.coordinates || "",
      gender: staff.gender || contractor.gender || d.gender || "",
      staff_document_type: staff.staff_document_type || "",
      company_name:
        d.company_name || contractor.company_name || staff.company_name || "",
      registration_number:
        d.registration_number ||
        contractor.registration_number ||
        staff.registration_number ||
        "",
    });

    if (staff.profile_image) setProfilePhoto(staff.profile_image);
    else if (contractor.profile_image)
      setProfilePhoto(contractor.profile_image);
    else if (d.profile_image) setProfilePhoto(d.profile_image);
  }, [profileData]);

  useEffect(() => {
    if (activeTab !== "personal" || fetchLoading) return;
    let autocomplete;
    let listener;
    const initMap = () => {
      const addressInput = document.getElementById("address");
      if (!addressInput || !window.google || !window.google.maps) return;
      if (addressInput.getAttribute("data-gmaps-initialized")) return;
      autocomplete = new window.google.maps.places.Autocomplete(addressInput, {
        fields: ["address_components", "geometry", "formatted_address"],
        types: ["address"],
      });
      addressInput.setAttribute("data-gmaps-initialized", "true");
      listener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;
        let newCity = "",
          newState = "",
          newCountry = "";
        place.address_components?.forEach((c) => {
          if (c.types.includes("locality")) newCity = c.long_name;
          if (c.types.includes("administrative_area_level_1"))
            newState = c.long_name;
          if (c.types.includes("country")) newCountry = c.long_name;
        });
        setFormData((prev) => ({
          ...prev,
          address: place.formatted_address,
          city: newCity || prev.city,
          state: newState,
          country: newCountry,
          coordinates: `${place.geometry.location.lat()},${place.geometry.location.lng()}`,
        }));
      });
    };
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogleMaps);
        initMap();
      }
    }, 500);
    return () => {
      clearInterval(checkGoogleMaps);
      if (listener && window.google)
        window.google.maps.event.removeListener(listener);
    };
  }, [activeTab, fetchLoading]);

  const handleDocFormChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setDocForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = files[0];
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "staff_documents");
        const res = await uploadFile("api/upload-file", fd, { method: "POST" });
        if (res.success) {
          setDocForm((prev) => ({
            ...prev,
            file_path: res.path || res.data?.path || "",
            file_url: res.url || res.data?.url || "",
          }));
        }
      }
    } else {
      setDocForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    let payload = {
      user_id: userdata.data.id,
      no: docForm.no,
      exp: docForm.exp,
      document_no: docForm.document_no,
      document_expiry: docForm.document_expiry,
      file: docForm.file_path,
    };
    if (selectedDoc) {
      payload = {
        ...payload,
        id: selectedDoc.id,
        document_type: selectedDoc.document_type,
        document_name: selectedDoc.document_name,
      };
    } else {
      payload = {
        ...payload,
        document_type: docForm.document_name,
        document_name: docForm.document_name,
      };
    }
    const res = await submit(
      selectedDoc ? "api/guard-update-documents" : "api/guard-add-documents",
      payload,
      { method: "POST" },
    );
    if (res.success) {
      setShowDocModal(false);
      refetch();
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    const res = await submit("api/customer-add-card", cardForm, {
      method: "POST",
    });
    if (res.success) {
      setShowCardModal(false);
      setCardForm({
        card_holder_name: "",
        card_number: "",
        expiry_month: "",
        expiry_year: "",
        cvv: "",
      });
      refetch();
    }
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitError(null);
      const payload = new FormData();
      Object.keys(formData).forEach((key) =>
        payload.append(key, formData[key]),
      );
      if (profilePhotoFile) payload.append("profile_image", profilePhotoFile);
      const res = await submit(
        `api/user-update/${userdata.data.id || userdata.id}`,
        payload,
        { method: "POST" },
      );
      if (res.success) {
        setSubmitSuccess(true);
        if (res.data) dispatch(setUser({ userdata: res.data }));
        refetch();
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError(res.errors || res.message || "Update failed");
      }
    },
    [formData, profilePhotoFile, submit, userdata, dispatch, refetch],
  );

  if (fetchLoading) return <Loader fullPage />;
  if (fetchError)
    return (
      <div className="dashboard-main text-danger">
        Error: {fetchError.toString()}
      </div>
    );

  return (
    <div className="dashboard-main">
      <div className="settings-header">
        <AvatarUpload
          profilePhoto={profilePhoto}
          name={formData.name}
          onPhotoChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setProfilePhotoFile(file);
              setProfilePhoto(URL.createObjectURL(file));
            }
          }}
        />
        <SettingsHeaderContent
          userType={userType}
          name={formData.name}
          email={formData.email}
          city={formData.city}
          profileCompletion={
            profileData?.data?.profile_completion_percentage || 0
          }
          missingItems={missingFields}
        />
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <button
          className={`btn ${activeTab === "personal" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("personal")}
        >
          Personal Information
        </button>
        {userType === "customer" ? (
          <button
            className={`btn ${activeTab === "cards" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("cards")}
          >
            Cards
          </button>
        ) : (
          <button
            className={`btn ${activeTab === "documents" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("documents")}
          >
            Documents
          </button>
        )}
      </div>

      {activeTab === "personal" && (
        <>
          {submitSuccess && (
            <div className="alert alert-success">
              Profile updated successfully!
            </div>
          )}
          {submitError && (
            <div className="alert alert-danger">
              {typeof submitError === "string"
                ? submitError
                : JSON.stringify(submitError)}
            </div>
          )}
          <ProfileForm
            formData={formData}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [e.target.id]: e.target.value,
              }))
            }
            onSubmit={handleSubmit}
            loading={submitLoading}
            userType={userType}
          />
        </>
      )}

      {activeTab === "cards" && userType === "customer" && (
        <div className="card-section">
          <div className="d-flex justify-content-between mb-3">
            <h3>Your Saved Cards</h3>
            <button
              className="btn btn-success"
              onClick={() => setShowCardModal(true)}
            >
              + Add New Card
            </button>
          </div>
          <div className="row">
            {(profileData?.data?.cards || []).map((card, i) => (
              <div key={i} className="col-md-4 mb-3">
                <div
                  className="card p-3 shadow-sm border-0"
                  style={{
                    background: "#2c3e50",
                    color: "#fff",
                    borderRadius: "12px",
                  }}
                >
                  <p className="mb-1">
                    **** **** **** {card.card_number.slice(-4)}
                  </p>
                  <small className="d-block">{card.card_holder_name}</small>
                  <small>
                    {card.expiry_month}/{card.expiry_year}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "documents" && userType !== "customer" && (
        <DocumentTable
          documents={profileData?.data?.documents || []}
          onAddFile={(doc) => {
            setSelectedDoc(doc);
            setDocForm((prev) => ({
              ...prev,
              file_url: doc.file,
              document_name: doc.document_name,
            }));
            setShowDocModal(true);
          }}
          onAddDocument={() => {
            setSelectedDoc(null);
            setDocForm((prev) => ({
              ...prev,
              file_url: "",
              document_name: "",
            }));
            setShowDocModal(true);
          }}
        />
      )}

      {/* Card Modal */}
      <Modal open={showCardModal} onClose={() => setShowCardModal(false)}>
        <form onSubmit={handleCardSubmit} className="p-3">
          <h4 className="mb-3">Add Payment Card</h4>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Card Holder Name"
            onChange={(e) =>
              setCardForm((p) => ({ ...p, card_holder_name: e.target.value }))
            }
            required
          />
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Card Number"
            maxLength="16"
            onChange={(e) =>
              setCardForm((p) => ({ ...p, card_number: e.target.value }))
            }
            required
          />
          <div className="row mb-3">
            <div className="col-4">
              <input
                type="text"
                className="form-control"
                placeholder="MM"
                onChange={(e) =>
                  setCardForm((p) => ({ ...p, expiry_month: e.target.value }))
                }
                required
              />
            </div>
            <div className="col-4">
              <input
                type="text"
                className="form-control"
                placeholder="YY"
                onChange={(e) =>
                  setCardForm((p) => ({ ...p, expiry_year: e.target.value }))
                }
                required
              />
            </div>
            <div className="col-4">
              <input
                type="password"
                className="form-control"
                placeholder="CVV"
                maxLength="3"
                onChange={(e) =>
                  setCardForm((p) => ({ ...p, cvv: e.target.value }))
                }
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitLoading}
          >
            Save Card
          </button>
        </form>
      </Modal>

      {/* Document Modal with uploadLoading feedback */}
      <Modal open={showDocModal} onClose={() => setShowDocModal(false)}>
        <form onSubmit={handleDocSubmit} className="p-3 position-relative">
          <h5>{selectedDoc ? "Edit Document" : "Add New Document"}</h5>
          <select
            className="form-control mb-3"
            name="document_name"
            value={docForm.document_name}
            onChange={handleDocFormChange}
            required={!selectedDoc}
            disabled={!!selectedDoc}
          >
            <option value="">Select Type</option>
            <option value="Passport">Passport</option>
            <option value="Visa">Visa</option>
            <option value="Casual Contract Form">Casual Contract Form</option>
          </select>

          <div
            className="text-center mb-3 position-relative"
            style={{ minHeight: "150px" }}
          >
            <img
              src={
                docForm.file_url
                  ? docForm.file_url.startsWith("http")
                    ? docForm.file_url
                    : `${apiURL}staff_documents/${docForm.file_url}`
                  : fallbackImage
              }
              alt="Document Preview"
              style={{
                width: 150,
                height: 150,
                objectFit: "cover",
                borderRadius: "8px",
                opacity: uploadLoading ? 0.3 : 1,
              }}
            />
            {uploadLoading && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <div
                  className="spinner-border text-primary"
                  role="status"
                ></div>
                <p className="small mt-1">Uploading...</p>
              </div>
            )}
          </div>

          <input
            type="file"
            className="form-control mb-3"
            onChange={handleDocFormChange}
            name="file"
          />
          <button
            type="submit"
            className="btn btn-success w-100"
            disabled={uploadLoading || submitLoading}
          >
            {submitLoading ? "Saving..." : "Save Document"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
