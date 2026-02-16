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
  const { submit: uploadFile, loading: uploadLoading } = useSubmit({
    isAuth: true,
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  // Modal state for document upload
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docForm, setDocForm] = useState({
    notes: "",
    no: false,
    exp: false,
    document_no: "",
    document_expire: "",
    file: null,
    file_path: "",
  });

  // Open modal and set selected document (for update)
  const handleAddFile = (doc) => {
    setSelectedDoc(doc);
    setDocForm({
      notes: doc.notes || "",
      no: !!doc.document_no,
      exp: !!doc.document_expiry,
      document_no: doc.document_no || "",
      document_expire: doc.document_expiry || "",
      file: null,
      file_path: doc.file || "",
      file_url: doc.file ? doc.file : "",
    });
    setShowDocModal(true);
  };

  // Open modal for adding a new document
  const handleAddDocument = () => {
    setSelectedDoc(null);
    setDocForm({
      notes: "",
      no: false,
      exp: false,
      document_no: "",
      document_expire: "",
      file: null,
      file_path: "",
      file_url: "",
    });
    setShowDocModal(true);
  };

  // Handle modal form changes
  const handleDocFormChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setDocForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = files[0];
      setDocForm((prev) => ({ ...prev, file }));
      if (file) {
        // Upload file to server
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "staff_documents");
        const result = await uploadFile("api/upload-file", formData, {
          method: "POST",
        });
        if (result.success && result.url) {
          setDocForm((prev) => ({
            ...prev,
            file_path: result.path || (result.data && result.data.path) || "",
            file_url: result.url || (result.data && result.data.url) || "",
          }));
        } else if (result.success && result.data && result.data.url) {
          setDocForm((prev) => ({
            ...prev,
            file_path: result.data.path,
            file_url: result.data.url,
          }));
        } else if (result.success && result.path) {
          setDocForm((prev) => ({ ...prev, file_path: result.path }));
        }
      }
    } else {
      setDocForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle modal submit for add/update document
  const handleDocSubmit = async (e) => {
    e.preventDefault();
    // Compose payload
    let payload = {
      notes: docForm.notes,
      no: docForm.no,
      exp: docForm.exp,
      document_no: docForm.document_no,
      document_expire: docForm.document_expire,
      file: docForm.file_path,
    };
    // Add document_name and document_type for both add and update
    if (selectedDoc) {
      payload = {
        ...payload,
        id: selectedDoc.id,
        admin_id: selectedDoc.admin_id,
        guard_id: selectedDoc.guard_id,
        document_type: selectedDoc.document_type,
        document_name: selectedDoc.document_name,
      };
    } else {
      // For new document, ask user to select document type/name (could be improved with a dropdown)
      // For now, show alert and return if not implemented
      alert(
        "Please select a document type/name. Implement document selection UI as needed.",
      );
      return;
    }

    // Format date if present
    if (payload.document_expire) {
      // Convert to MM-DD-YYYY if needed
      const d = new Date(payload.document_expire);
      if (!isNaN(d)) {
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const yyyy = d.getFullYear();
        payload.document_expire = `${mm}-${dd}-${yyyy}`;
      }
    }

    // Decide API endpoint and method
    let apiEndpoint = "api/document-update";
    let method = "POST";
    if (!selectedDoc) {
      apiEndpoint = "api/document-add";
    }

    // Submit
    const result = await submit(apiEndpoint, payload, { method });
    if (result.success) {
      setShowDocModal(false);
      refetch();
    } else {
      alert(result.message || "Failed to save document");
    }
  };

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
        `api/user-update/${userdata.data.id}`,
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
    <div className="dashboard-main">
      <div className="settings-header">
        <AvatarUpload
          profilePhoto={profilePhoto}
          name={formData.name}
          onPhotoChange={handlePhotoChange}
        />
        <SettingsHeaderContent
          userType={userdata?.data?.user_type}
          name={formData.name}
          email={formData.email}
          city={formData.city}
          gender={formData.gender}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 16 }}>
        <button
          type="button"
          className={`btn ${activeTab === "personal" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("personal")}
        >
          Personal Information
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "documents" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "personal" && (
        <>
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
          <ProfileForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            loading={submitLoading}
          />
        </>
      )}

      {activeTab === "documents" && (
        <DocumentTable
          documents={profileData?.data?.documents || []}
          onAddFile={handleAddFile}
          onAddDocument={handleAddDocument}
        />
      )}

      {/* Document Upload Modal */}
      <Modal open={showDocModal} onClose={() => setShowDocModal(false)}>
        <form
          onSubmit={handleDocSubmit}
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* Document Name Dropdown (enabled for add, disabled for update) */}
          <div className="mb-2">
            <label style={{ fontWeight: 500, fontSize: 13 }}>
              Document Name
            </label>
            {selectedDoc ? (
              <select
                className="form-control"
                value={selectedDoc.document_name || ""}
                disabled
                style={{
                  background: "#f5f5f5",
                  color: "#333",
                  marginBottom: 8,
                }}
              >
                <option value={selectedDoc.document_name || ""}>
                  {selectedDoc.document_name || ""}
                </option>
              </select>
            ) : (
              <select
                className="form-control"
                name="document_name"
                value={docForm.document_name || ""}
                onChange={handleDocFormChange}
                style={{ background: "#fff", color: "#333", marginBottom: 8 }}
              >
                <option value="">Select Document</option>
                <option value="Casual Contract Form">
                  Casual Contract Form
                </option>
                <option value="Passport">Passport</option>
                <option value="Visa">Visa</option>
                <option value="Other">Other</option>
              </select>
            )}
          </div>
          {/* Description/Notes */}
          <div className="mb-2">
            <label style={{ fontWeight: 500, fontSize: 13 }}>
              Description (Optional)
            </label>
            <textarea
              className="form-control"
              name="notes"
              value={docForm.notes}
              onChange={handleDocFormChange}
              style={{ minHeight: 40, marginBottom: 8 }}
            />
          </div>
          {/* File/Image Preview and Actions */}
          <div
            className="mb-2"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 180,
                height: 180,
                background: "#f5f5f5",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {docForm.file_url ? (
                (() => {
                  const ext = docForm.file_url.split(".").pop().toLowerCase();
                  if (
                    ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)
                  ) {
                    return (
                      <img
                        src={docForm.file_url}
                        alt="preview"
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    );
                  } else if (["pdf"].includes(ext)) {
                    return (
                      <iframe
                        src={docForm.file_url}
                        title="Document Preview"
                        style={{ width: "100%", height: "100%", border: 0 }}
                      />
                    );
                  } else {
                    return (
                      <a
                        href={docForm.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#007bff", fontWeight: 500 }}
                      >
                        View/Download Document
                      </a>
                    );
                  }
                })()
              ) : (
                <img
                  src="/assets/images/no-image.png"
                  alt="No image"
                  style={{ width: "100%", opacity: 0.5 }}
                />
              )}
              {uploadLoading && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  <span style={{ color: "#2980b9", fontWeight: 500 }}>
                    Uploading...
                  </span>
                </div>
              )}
              {/* Action buttons */}
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 0,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                }}
              >
                <label
                  style={{
                    cursor: "pointer",
                    background: "#e74c3c",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Add/Change File"
                >
                  <i
                    className="fa fa-plus"
                    style={{ color: "#fff", fontSize: 18 }}
                  ></i>
                  <input
                    type="file"
                    name="file"
                    style={{ display: "none" }}
                    onChange={handleDocFormChange}
                  />
                </label>
                <button
                  type="button"
                  style={{
                    background: "#2980b9",
                    border: "none",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Remove"
                  onClick={() =>
                    setDocForm((prev) => ({ ...prev, file: null }))
                  }
                  disabled={!docForm.file}
                >
                  <i
                    className="fa fa-trash"
                    style={{ color: "#fff", fontSize: 18 }}
                  ></i>
                </button>
              </div>
            </div>
          </div>
          {/* Checkboxes and Conditional Inputs */}
          <div
            className="mb-2"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginBottom: 12,
            }}
          >
            <label style={{ fontWeight: 400, fontSize: 14 }}>
              <input
                type="checkbox"
                name="no"
                checked={docForm.no}
                onChange={handleDocFormChange}
                style={{ marginRight: 6 }}
              />
              Add Document Number
            </label>
            {docForm.no && (
              <input
                className="form-control"
                name="document_no"
                placeholder="Document Number"
                value={docForm.document_no}
                onChange={handleDocFormChange}
                style={{ marginBottom: 8, marginTop: 4 }}
              />
            )}
            <label style={{ fontWeight: 400, fontSize: 14 }}>
              <input
                type="checkbox"
                name="exp"
                checked={docForm.exp}
                onChange={handleDocFormChange}
                style={{ marginRight: 6 }}
              />
              Set Expiration date
            </label>
            {docForm.exp && (
              <input
                className="form-control"
                name="document_expire"
                type="date"
                placeholder="Expiration Date"
                value={docForm.document_expire}
                onChange={handleDocFormChange}
                style={{ marginBottom: 8, marginTop: 4 }}
              />
            )}
          </div>
          {/* Save Button */}
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="submit"
              className="btn btn-success"
              style={{ minWidth: 80 }}
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
