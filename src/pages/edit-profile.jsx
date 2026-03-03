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

const INITIAL_CARD_STATE = {
  card_holder_name: "",
  card_number: "",
  expiry_month: "",
  expiry_year: "",
  cvv: "",
};

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
  bank_details: [], // Now initialized as an array
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

  // Multi-Card States
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardForm, setCardForm] = useState(INITIAL_CARD_STATE);

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

    // Parse existing bank details and ensure it becomes an array
    let existingBankDetails = [];
    if (d.bank_details) {
      try {
        const parsed =
          typeof d.bank_details === "string"
            ? JSON.parse(d.bank_details)
            : d.bank_details;

        // Wrap in array if legacy data was saved as a single object
        existingBankDetails = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.error("Failed to parse bank details", e);
      }
    }

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
      bank_details: existingBankDetails,
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

  // General profile submit
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setSubmitError(null);
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "bank_details") {
          // Stringify the array of cards
          payload.append("bank_details", JSON.stringify(formData.bank_details));
        } else {
          payload.append(key, formData[key]);
        }
      });

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

  // Multi-card Handlers
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    let formattedValue = value.replace(/(.{4})/g, "$1 ").trim();
    setCardForm((prev) => ({
      ...prev,
      card_number: formattedValue.slice(0, 19),
    }));
  };

  const handleSaveNewCard = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Append the new card to the existing array
    const updatedCards = [...formData.bank_details, cardForm];

    // Create direct payload to save immediately
    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "bank_details") {
        payload.append("bank_details", JSON.stringify(updatedCards));
      } else {
        payload.append(key, formData[key]);
      }
    });

    if (profilePhotoFile) payload.append("profile_image", profilePhotoFile);

    const res = await submit(
      `api/user-update/${userdata.data.id || userdata.id}`,
      payload,
      { method: "POST" },
    );

    if (res.success) {
      setFormData((prev) => ({ ...prev, bank_details: updatedCards }));
      setIsAddingCard(false);
      setCardForm(INITIAL_CARD_STATE);
      if (res.data) dispatch(setUser({ userdata: res.data }));
      refetch();
    } else {
      setSubmitError(res.errors || res.message || "Failed to save card");
    }
  };

  const handleRemoveCard = async (indexToRemove) => {
    if (!window.confirm("Are you sure you want to remove this card?")) return;
    setSubmitError(null);

    // Filter out the deleted card
    const updatedCards = formData.bank_details.filter(
      (_, i) => i !== indexToRemove,
    );

    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "bank_details") {
        payload.append("bank_details", JSON.stringify(updatedCards));
      } else {
        payload.append(key, formData[key]);
      }
    });

    if (profilePhotoFile) payload.append("profile_image", profilePhotoFile);

    const res = await submit(
      `api/user-update/${userdata.data.id || userdata.id}`,
      payload,
      { method: "POST" },
    );

    if (res.success) {
      setFormData((prev) => ({ ...prev, bank_details: updatedCards }));
      if (res.data) dispatch(setUser({ userdata: res.data }));
      refetch();
    } else {
      setSubmitError(res.errors || res.message || "Failed to remove card");
    }
  };

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
            onClick={() => {
              setActiveTab("cards");
              setIsAddingCard(false);
            }}
          >
            Payment Details
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

      {submitSuccess && (
        <div className="alert alert-success">Profile updated successfully!</div>
      )}
      {submitError && (
        <div className="alert alert-danger">
          {typeof submitError === "string"
            ? submitError
            : JSON.stringify(submitError)}
        </div>
      )}

      {activeTab === "personal" && (
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
      )}

      {activeTab === "cards" && userType === "customer" && (
        <div className="card-section p-4 bg-white rounded shadow-sm border">
          {!isAddingCard ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Your Saved Cards</h4>
                <button
                  className="btn btn-primary shadow-sm"
                  onClick={() => setIsAddingCard(true)}
                >
                  + Add New Card
                </button>
              </div>

              {formData.bank_details.length === 0 ? (
                <div className="text-center p-5 border rounded bg-light text-muted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    fill="currentColor"
                    className="bi bi-credit-card mb-3 opacity-50"
                    viewBox="0 0 16 16"
                  >
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z" />
                    <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z" />
                  </svg>
                  <h5>No cards saved yet</h5>
                  <p className="small">
                    Add a payment method to easily checkout.
                  </p>
                </div>
              ) : (
                <div className="row">
                  {formData.bank_details.map((card, index) => (
                    <div key={index} className="col-md-6 col-lg-4 mb-4">
                      <div
                        className="card-preview position-relative text-white p-4 rounded-4 shadow-sm h-100"
                        style={{
                          background:
                            "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                          boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                        }}
                      >
                        <button
                          className="btn btn-sm btn-danger position-absolute"
                          style={{
                            top: "12px",
                            right: "12px",
                            opacity: 0.9,
                            padding: "4px 8px",
                          }}
                          onClick={() => handleRemoveCard(index)}
                          disabled={submitLoading}
                          title="Remove Card"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                          </svg>
                        </button>

                        <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                          <svg
                            width="40"
                            height="30"
                            viewBox="0 0 40 30"
                            fill="none"
                          >
                            <rect
                              width="40"
                              height="30"
                              rx="4"
                              fill="#E2E8F0"
                              opacity="0.8"
                            />
                            <rect
                              x="5"
                              y="5"
                              width="10"
                              height="8"
                              rx="2"
                              fill="#CBD5E1"
                            />
                            <rect
                              x="5"
                              y="15"
                              width="30"
                              height="4"
                              fill="#CBD5E1"
                            />
                            <rect
                              x="5"
                              y="21"
                              width="15"
                              height="4"
                              fill="#CBD5E1"
                            />
                          </svg>
                          <span
                            className="fst-italic"
                            style={{
                              opacity: 0.8,
                              fontSize: "1.2rem",
                              marginRight: "30px",
                            }}
                          >
                            VISA
                          </span>
                        </div>
                        <h5
                          className="mb-4"
                          style={{
                            letterSpacing: "2px",
                            fontFamily: "monospace",
                            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                          }}
                        >
                          {card.card_number || "**** **** **** ****"}
                        </h5>
                        <div
                          className="d-flex justify-content-between text-uppercase"
                          style={{ fontSize: "0.85rem", opacity: 0.9 }}
                        >
                          <div>
                            <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>
                              Card Holder
                            </div>
                            <div>{card.card_holder_name || "YOUR NAME"}</div>
                          </div>
                          <div className="text-end">
                            <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>
                              Expires
                            </div>
                            <div>
                              {card.expiry_month || "MM"}/
                              {card.expiry_year || "YY"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="row align-items-center">
              {/* Visual Card Preview */}
              <div className="col-md-5 mb-4 mb-md-0 d-flex justify-content-center">
                <div
                  className="card-preview position-relative text-white p-4 rounded-4 shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                    width: "100%",
                    maxWidth: "360px",
                    height: "220px",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
                      <rect
                        width="40"
                        height="30"
                        rx="4"
                        fill="#E2E8F0"
                        opacity="0.8"
                      />
                      <rect
                        x="5"
                        y="5"
                        width="10"
                        height="8"
                        rx="2"
                        fill="#CBD5E1"
                      />
                      <rect x="5" y="15" width="30" height="4" fill="#CBD5E1" />
                      <rect x="5" y="21" width="15" height="4" fill="#CBD5E1" />
                    </svg>
                    <span
                      className="fst-italic"
                      style={{ opacity: 0.8, fontSize: "1.2rem" }}
                    >
                      VISA
                    </span>
                  </div>
                  <h4
                    className="mb-4"
                    style={{
                      letterSpacing: "2px",
                      fontFamily: "monospace",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                    }}
                  >
                    {cardForm.card_number || "**** **** **** ****"}
                  </h4>
                  <div
                    className="d-flex justify-content-between text-uppercase"
                    style={{ fontSize: "0.85rem", opacity: 0.9 }}
                  >
                    <div>
                      <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>
                        Card Holder
                      </div>
                      <div>{cardForm.card_holder_name || "YOUR NAME"}</div>
                    </div>
                    <div className="text-end">
                      <div style={{ fontSize: "0.6rem", opacity: 0.7 }}>
                        Expires
                      </div>
                      <div>
                        {cardForm.expiry_month || "MM"}/
                        {cardForm.expiry_year || "YY"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Input Form */}
              <div className="col-md-7">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="green"
                      className="bi bi-shield-lock-fill me-2"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99A1.5 1.5 0 0 1 8 5z"
                      />
                    </svg>
                    <h4 className="mb-0">Secure Payment Information</h4>
                  </div>
                </div>
                <p className="text-muted small mb-4">
                  Your payment details are encrypted and securely stored.
                </p>

                <form onSubmit={handleSaveNewCard}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. John Doe"
                      value={cardForm.card_holder_name}
                      onChange={(e) =>
                        setCardForm((p) => ({
                          ...p,
                          card_holder_name: e.target.value.toUpperCase(),
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-bold">
                      Card Number
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="0000 0000 0000 0000"
                        value={cardForm.card_number}
                        onChange={handleCardNumberChange}
                        required
                      />
                      <span className="input-group-text bg-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          className="bi bi-credit-card"
                          viewBox="0 0 16 16"
                        >
                          <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z" />
                          <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-4">
                      <label className="form-label text-muted small fw-bold">
                        Exp Month
                      </label>
                      <input
                        type="text"
                        className="form-control text-center"
                        placeholder="MM"
                        maxLength="2"
                        value={cardForm.expiry_month}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setCardForm((p) => ({ ...p, expiry_month: val }));
                        }}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-muted small fw-bold">
                        Exp Year
                      </label>
                      <input
                        type="text"
                        className="form-control text-center"
                        placeholder="YY"
                        maxLength="2"
                        value={cardForm.expiry_year}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setCardForm((p) => ({ ...p, expiry_year: val }));
                        }}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-muted small fw-bold">
                        CVV
                      </label>
                      <input
                        type="password"
                        className="form-control text-center"
                        placeholder="***"
                        maxLength="4"
                        value={cardForm.cvv}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setCardForm((p) => ({ ...p, cvv: val }));
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-50 py-2 fw-bold"
                      onClick={() => {
                        setIsAddingCard(false);
                        setCardForm(INITIAL_CARD_STATE);
                      }}
                      disabled={submitLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary w-50 py-2 fw-bold shadow-sm"
                      disabled={submitLoading}
                    >
                      {submitLoading ? "Saving..." : "Save Card"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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

      {/* Document Modal */}
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
