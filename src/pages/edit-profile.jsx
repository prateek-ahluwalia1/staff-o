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
import { toast } from "react-toastify";

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
  bank_details: [],
};

export default function EditProfile() {
  const dispatch = useDispatch();
  const { userdata } = useSelector((state) => state.auth);
  const userId = userdata?.data?.id || userdata?.id;
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isverified =
    userdata?.data?.customer?.verify_profile ||
    userdata?.customer?.verify_profile;

  const endpoint = useMemo(
    () => (userId ? `api/user-edit/${userId}` : null),
    [userId],
  );

  const {
    data: profileData,
    loading: fetchLoading,
    refetch,
  } = useFetch(endpoint, { isAuth: true });

  const { submit, loading: submitLoading } = useSubmit({ isAuth: true });
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({
    isAuth: true,
  });
  const { submit: emailSubmit, loading: emailSubmitLoading } = useSubmit({
    isAuth: true,
  });
  const { submit: phoneSubmit, loading: phoneSubmitLoading } = useSubmit({
    isAuth: true,
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [activeTab, setActiveTab] = useState("personal");

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardForm, setCardForm] = useState(INITIAL_CARD_STATE);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState("input");
  const [newEmailInput, setNewEmailInput] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailChangeError, setEmailChangeError] = useState(null);
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneStep, setPhoneStep] = useState("input");
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneChangeError, setPhoneChangeError] = useState(null);
  const [phoneChangeSuccess, setPhoneChangeSuccess] = useState(false);

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
    const customer = d.customer || {};

    const rawBankDetails = customer.bank_details ?? d.bank_details ?? null;

    let existingBankDetails = [];
    if (rawBankDetails) {
      try {
        const parsed =
          typeof rawBankDetails === "string"
            ? JSON.parse(rawBankDetails)
            : rawBankDetails;

        existingBankDetails = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.error("Failed to parse bank details", e);
      }
    }

    setFormData({
      name: d.name || "",
      email: d.email || "",
      phone: staff.phone || contractor.phone || customer.phone || d.phone || "",
      address: d.address || staff.address || contractor.address || "",
      city: d.city || staff.city || contractor.city || "",
      state: d.state || staff.state || contractor.state || "",
      country: d.country || staff.country || contractor.country || "",
      coordinates:
        d.coordinates || staff.coordinates || contractor.coordinates || "",
      gender: staff.gender || contractor.gender || d.gender || "",
      staff_document_type: staff.staff_document_type || "",
      company_name:
        d.company_name ||
        contractor.company_name ||
        staff.company_name ||
        customer.company_name ||
        "",
      registration_number:
        d.registration_number ||
        contractor.registration_number ||
        staff.registration_number ||
        "",
      bank_details: existingBankDetails,
      profile_image:
        d.profile_image ||
        staff.profile_image ||
        contractor.profile_image ||
        "",
    });

    const profileImageUrl =
      d.profile_image || staff.profile_image || contractor.profile_image;
    if (profileImageUrl) {
      setProfilePhoto(
        profileImageUrl.startsWith("http")
          ? profileImageUrl
          : `${apiURL}${profileImageUrl}`,
      );
    }
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

  // Upload avatar and get URL
  const handleAvatarUpload = useCallback(
    async (file) => {
      try {
        if (!file) return;

        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "profile_avatars");

        const res = await uploadFile("api/upload-file", fd, {
          method: "POST",
        });

        if (res?.success) {
          // Use full URL from response (prioritize res.url)
          const imageUrl =
            res.url || res.data?.url || res.path || res.data?.path;
          if (imageUrl) {
            // Update formData with the profile_image URL
            setFormData((prev) => ({
              ...prev,
              profile_image: imageUrl,
            }));
            // Show the uploaded image immediately
            setProfilePhoto(
              imageUrl.startsWith("http") ? imageUrl : `${apiURL}${imageUrl}`,
            );
            toast.success("Avatar uploaded successfully!");
          }
        }
      } catch (err) {
        console.warn("Avatar upload failed", err);
        toast.error("Failed to upload avatar");
      }
    },
    [uploadFile],
  );

  // General profile submit
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (!userId) {
        toast.error("Unable to update profile. Missing user id.");
        return;
      }
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "bank_details") {
          // Stringify the array of cards
          payload.append("bank_details", JSON.stringify(formData.bank_details));
        } else if (key === "email") {
          // Email is updated via separate OTP verification flow
        } else if (
          key === "profile_image" &&
          typeof formData[key] === "string"
        ) {
          // Send profile_image as URL string, not as file
          payload.append(key, formData[key]);
        } else {
          payload.append(key, formData[key]);
        }
      });

      const res = await submit(`api/user-update/${userId}`, payload, {
        method: "POST",
      });
      if (res === undefined) return;
      toast.success("Profile updated successfully!");
      if (res.data) dispatch(setUser({ userdata: res.data }));
      const refetchRes = await refetch();
      if (refetchRes?.success && refetchRes?.data) {
        dispatch(setUser({ userdata: refetchRes.data }));
      }
    },
    [formData, submit, userId, dispatch, refetch],
  );

  const handleCloseEmailModal = () => {
    setShowEmailModal(false);
    setEmailStep("input");
    setNewEmailInput("");
    setEmailOtp("");
    setEmailChangeError(null);
    setEmailChangeSuccess(false);
  };

  const handleRequestEmailOtp = async (e) => {
    e.preventDefault();
    if (!userId) {
      setEmailChangeError("Unable to send OTP. Missing user id.");
      return;
    }
    setEmailChangeError(null);
    const res = await emailSubmit(
      `api/user-update/${userId}`,
      { email: newEmailInput },
      { method: "POST" },
    );
    if (!res) return;
    if (res.success) {
      setEmailStep("otp");
    } else {
      setEmailChangeError(res.errors || res.message || "Failed to send OTP");
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!userId) {
      setEmailChangeError("Unable to verify OTP. Missing user id.");
      return;
    }
    setEmailChangeError(null);
    const res = await emailSubmit(
      `api/user-update/${userId}`,
      { email: newEmailInput, email_otp: emailOtp },
      { method: "POST" },
    );
    if (!res) return;
    if (res.success) {
      toast.success("Email updated successfully!");
      setFormData((prev) => ({ ...prev, email: newEmailInput }));
      if (res.data) dispatch(setUser({ userdata: res.data }));
      refetch();
      setTimeout(() => {
        handleCloseEmailModal();
      }, 1500);
    } else {
      setEmailChangeError(
        res.errors || res.message || "Invalid OTP. Please try again.",
      );
    }
  };

  const handleClosePhoneModal = () => {
    setShowPhoneModal(false);
    setPhoneStep("input");
    setNewPhoneInput("");
    setPhoneOtp("");
    setPhoneChangeError(null);
    setPhoneChangeSuccess(false);
  };

  const handleRequestPhoneOtp = async (e) => {
    e.preventDefault();
    if (!userId) {
      setPhoneChangeError("Unable to send OTP. Missing user id.");
      return;
    }
    setPhoneChangeError(null);
    const res = await phoneSubmit(
      `api/user-update/${userId}`,
      { phone: newPhoneInput },
      { method: "POST" },
    );
    if (!res) return;
    if (res.success) {
      setPhoneStep("otp");
    } else {
      setPhoneChangeError(res.errors || res.message || "Failed to send OTP");
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!userId) {
      setPhoneChangeError("Unable to verify OTP. Missing user id.");
      return;
    }
    setPhoneChangeError(null);
    const res = await phoneSubmit(
      `api/user-update/${userId}`,
      { phone: newPhoneInput, phone_otp: phoneOtp },
      { method: "POST" },
    );
    if (!res) return;
    if (res.success) {
      toast.success("Phone updated successfully!");
      setFormData((prev) => ({ ...prev, phone: newPhoneInput }));
      if (res.data) dispatch(setUser({ userdata: res.data }));
      refetch();
      setTimeout(() => {
        handleClosePhoneModal();
      }, 1500);
    } else {
      setPhoneChangeError(
        res.errors || res.message || "Invalid OTP. Please try again.",
      );
    }
  };

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
    if (!userId) {
      toast.error("Unable to add card. Missing user id.");
      return;
    }

    const updatedCards = [...formData.bank_details, cardForm];

    const payload = new FormData();
    payload.append("bank_details", JSON.stringify(updatedCards));

    const res = await submit(`api/user-update/${userId}`, payload, {
      method: "POST",
    });
    if (res === undefined) return;

    setFormData((prev) => ({ ...prev, bank_details: updatedCards }));
    setIsAddingCard(false);
    setCardForm(INITIAL_CARD_STATE);
    if (res.data) dispatch(setUser({ userdata: res.data }));
    refetch();
    toast.success("Card added successfully!");
  };

  const handleRemoveCard = async (indexToRemove) => {
    if (!window.confirm("Are you sure you want to remove this card?")) return;
    if (!userId) {
      toast.error("Unable to remove card. Missing user id.");
      return;
    }

    const updatedCards = formData.bank_details.filter(
      (_, i) => i !== indexToRemove,
    );

    const payload = new FormData();
    payload.append("bank_details", JSON.stringify(updatedCards));

    const res = await submit(`api/user-update/${userId}`, payload, {
      method: "POST",
    });
    if (res === undefined) return;

    setFormData((prev) => ({ ...prev, bank_details: updatedCards }));
    if (res.data) dispatch(setUser({ userdata: res.data }));
    refetch();
    toast.success("Card removed successfully!");
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
        if (res?.success) {
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
    if (!userId) {
      toast.error("Unable to save document. Missing user id.");
      return;
    }
    let payload = {
      user_id: userId,
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
    if (!res) return;
    if (res.success) {
      toast.success("Document saved successfully!");
      setShowDocModal(false);
      refetch();
    } else {
      toast.error(res.message || "Failed to save document");
    }
  };

  if (fetchLoading) return <Loader fullPage />;

  return (
    <div className="dashboard-main">
      <div className="settings-header">
        <AvatarUpload
          profilePhoto={profilePhoto}
          name={formData.name}
          onPhotoChange={handleAvatarUpload}
          loading={uploadLoading}
        />
        <SettingsHeaderContent
          isVerified={isverified}
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
        {userType !== "admin" && (
          <button
            className={`btn ${activeTab === "personal" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Information
          </button>
        )}
        {userType === "customer" && (
          <button
            className={`btn ${activeTab === "cards" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => {
              setActiveTab("cards");
              setIsAddingCard(false);
            }}
          >
            Payment Details
          </button>
        )}
        {userType !== "customer" && userType !== "admin" && (
          <button
            className={`btn ${activeTab === "documents" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("documents")}
          >
            Documents
          </button>
        )}
      </div>

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
          onChangeEmail={() => {
            setNewEmailInput("");
            setEmailStep("input");
            setEmailChangeError(null);
            setEmailChangeSuccess(false);
            setShowEmailModal(true);
          }}
          onChangePhone={() => {
            setNewPhoneInput("");
            setPhoneStep("input");
            setPhoneChangeError(null);
            setPhoneChangeSuccess(false);
            setShowPhoneModal(true);
          }}
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

      {activeTab === "documents" &&
        userType !== "customer" &&
        userType !== "admin" && (
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

      {/* Email Change Modal */}
      <Modal open={showEmailModal} onClose={handleCloseEmailModal}>
        <div className="p-3">
          <h5 className="mb-1">Change Email Address</h5>
          <p className="text-muted small mb-4">
            {emailStep === "input"
              ? "Enter your new email address. An OTP will be sent to verify it."
              : `Enter the OTP sent to ${newEmailInput}`}
          </p>

          {emailChangeSuccess && (
            <div className="alert alert-success py-2">
              Email updated successfully!
            </div>
          )}
          {emailChangeError && (
            <div className="alert alert-danger py-2">{emailChangeError}</div>
          )}

          {emailStep === "input" ? (
            <form onSubmit={handleRequestEmailOtp}>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  New Email Address
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="newemail@example.com"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-50"
                  onClick={handleCloseEmailModal}
                  disabled={emailSubmitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-50"
                  disabled={emailSubmitLoading}
                >
                  {emailSubmitLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmailOtp}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Enter OTP</label>
                <input
                  type="text"
                  className="form-control text-center fw-bold"
                  placeholder="Enter OTP"
                  value={emailOtp}
                  onChange={(e) =>
                    setEmailOtp(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={8}
                  required
                  autoFocus
                />
                <div className="mt-2 text-end">
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-muted"
                    onClick={() => {
                      setEmailStep("input");
                      setEmailOtp("");
                      setEmailChangeError(null);
                    }}
                    disabled={emailSubmitLoading}
                  >
                    Change email / Resend OTP
                  </button>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-50"
                  onClick={handleCloseEmailModal}
                  disabled={emailSubmitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-50"
                  disabled={emailSubmitLoading || emailChangeSuccess}
                >
                  {emailSubmitLoading ? "Verifying..." : "Verify & Update"}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Phone Change Modal */}
      <Modal open={showPhoneModal} onClose={handleClosePhoneModal}>
        <div className="p-3">
          <h5 className="mb-1">Change Phone Number</h5>
          <p className="text-muted small mb-4">
            {phoneStep === "input"
              ? "Enter your new phone number. An OTP will be sent to verify it."
              : `Enter the OTP sent to ${newPhoneInput}`}
          </p>

          {phoneChangeSuccess && (
            <div className="alert alert-success py-2">
              Phone number updated successfully!
            </div>
          )}
          {phoneChangeError && (
            <div className="alert alert-danger py-2">{phoneChangeError}</div>
          )}

          {phoneStep === "input" ? (
            <form onSubmit={handleRequestPhoneOtp}>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  New Phone Number
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="+92 300 0000000"
                  value={newPhoneInput}
                  onChange={(e) => setNewPhoneInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-50"
                  onClick={handleClosePhoneModal}
                  disabled={phoneSubmitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-50"
                  disabled={phoneSubmitLoading}
                >
                  {phoneSubmitLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyPhoneOtp}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Enter OTP</label>
                <input
                  type="text"
                  className="form-control text-center fw-bold"
                  placeholder="Enter OTP"
                  value={phoneOtp}
                  onChange={(e) =>
                    setPhoneOtp(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={8}
                  required
                  autoFocus
                />
                <div className="mt-2 text-end">
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-muted"
                    onClick={() => {
                      setPhoneStep("input");
                      setPhoneOtp("");
                      setPhoneChangeError(null);
                    }}
                    disabled={phoneSubmitLoading}
                  >
                    Change number / Resend OTP
                  </button>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-50"
                  onClick={handleClosePhoneModal}
                  disabled={phoneSubmitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-50"
                  disabled={phoneSubmitLoading || phoneChangeSuccess}
                >
                  {phoneSubmitLoading ? "Verifying..." : "Verify & Update"}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

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

          <div className="mb-3">
            <label className="form-label fw-semibold">Document Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. ABC123456"
              name="document_no"
              value={docForm.document_no}
              onChange={handleDocFormChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Expiry Date</label>
            <input
              type="date"
              className="form-control"
              name="document_expiry"
              value={docForm.document_expiry}
              onChange={handleDocFormChange}
              required
            />
          </div>

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
