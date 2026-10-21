import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import { apiURL } from "../utils/exports";

const resolveFileUrl = (link) => {
  if (!link) return "";
  if (/^https?:\/\//i.test(link) || link.startsWith("blob:") || link.startsWith("data:")) {
    return link;
  }
  const clean = link.replace(/^\/+/, "");
  return clean.startsWith("storage/") ? `${apiURL}${clean}` : `${apiURL}storage/${clean}`;
};

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const getFileIcon = (name = "") => {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "fa-solid fa-file-image";
  if (ext === "pdf") return "fa-solid fa-file-pdf";
  if (["doc", "docx"].includes(ext)) return "fa-solid fa-file-word";
  if (["xls", "xlsx", "csv"].includes(ext)) return "fa-solid fa-file-excel";
  return "fa-solid fa-file-lines";
};

const CompanyDocuments = () => {
  // Navigation stack: [] = root. Each entry is { id, folder }.
  const [stack, setStack] = useState([]);
  const currentFolder = stack[stack.length - 1] || null;

  const [rootFolders, setRootFolders] = useState([]);
  const [childFolders, setChildFolders] = useState([]);
  const [files, setFiles] = useState([]);

  // Modal state
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState(null); // folder being renamed

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadExpiry, setUploadExpiry] = useState("");
  const [editingFile, setEditingFile] = useState(null); // file being edited

  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'folder'|'file', id, label }

  const {
    data: rootData,
    loading: rootLoading,
    refetch: refetchRoot,
  } = useFetch("api/admin/business-folder/list", { isAuth: true, immediate: true });

  const folderListEndpoint = useMemo(() => {
    if (!currentFolder) return null;
    return `api/admin/business-file/list?folder_id=${currentFolder.id}`;
  }, [currentFolder]);

  const {
    data: folderData,
    loading: folderLoading,
    refetch: refetchFolder,
  } = useFetch(folderListEndpoint, { isAuth: true, immediate: Boolean(folderListEndpoint) });

  const { submit, loading: submitting } = useSubmit({ isAuth: true });

  useEffect(() => {
    if (rootData?.success) {
      setRootFolders(Array.isArray(rootData.data) ? rootData.data : []);
    }
  }, [rootData]);

  useEffect(() => {
    if (folderData?.success) {
      setChildFolders(Array.isArray(folderData.folders) ? folderData.folders : []);
      setFiles(Array.isArray(folderData.files) ? folderData.files : []);
    }
  }, [folderData]);

  const refreshCurrentView = () => {
    if (currentFolder) {
      refetchFolder();
    } else {
      refetchRoot();
    }
  };

  // --- Navigation ---
  const openFolder = (folder) => {
    setStack((prev) => [...prev, { id: folder.id, folder: folder.folder }]);
  };

  const goBack = () => {
    setStack((prev) => prev.slice(0, -1));
  };

  // --- Folder modal ---
  const openCreateFolderModal = () => {
    setEditingFolder(null);
    setFolderName("");
    setShowFolderModal(true);
  };

  const openRenameFolderModal = (folder) => {
    setEditingFolder(folder);
    setFolderName(folder.folder);
    setShowFolderModal(true);
  };

  const closeFolderModal = () => {
    setShowFolderModal(false);
    setEditingFolder(null);
    setFolderName("");
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name.");
      return;
    }

    if (editingFolder) {
      const res = await submit("api/admin/business-folder/rename", {
        id: editingFolder.id,
        folder: folderName.trim(),
      });
      if (res?.success) {
        toast.success("Folder renamed!");
        closeFolderModal();
        refreshCurrentView();
      }
      return;
    }

    const res = await submit("api/admin/business-folder/create", {
      folder: folderName.trim(),
      parent_id: currentFolder ? currentFolder.id : null,
    });

    if (res?.success) {
      toast.success("Folder created!");
      closeFolderModal();
      refreshCurrentView();
    }
  };

  // --- Upload modal ---
  const openUploadModal = () => {
    setEditingFile(null);
    setUploadName("");
    setUploadFile(null);
    setUploadExpiry("");
    setShowUploadModal(true);
  };

  const openEditFileModal = (file) => {
    setEditingFile(file);
    setUploadName(file.name || "");
    setUploadFile(null);
    setUploadExpiry(file.expiry_date ? file.expiry_date.substring(0, 10) : "");
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setEditingFile(null);
    setUploadName("");
    setUploadFile(null);
    setUploadExpiry("");
  };

  const handleSaveFile = async () => {
    if (!uploadName.trim()) {
      toast.error("Please enter a file name.");
      return;
    }
    if (!editingFile && !uploadFile) {
      toast.error("Please choose a file to upload.");
      return;
    }
    if (!currentFolder) {
      toast.error("No folder selected.");
      return;
    }

    const formData = new FormData();
    formData.append("folder_id", currentFolder.id);
    formData.append("name", uploadName.trim());
    if (uploadExpiry) formData.append("expiry_date", uploadExpiry);
    if (uploadFile) formData.append("file", uploadFile);
    if (editingFile) formData.append("id", editingFile.id);

    const res = await submit("api/admin/business-file/save", formData);

    if (res?.success) {
      toast.success(editingFile ? "File updated!" : "File uploaded!");
      closeUploadModal();
      refreshCurrentView();
    }
  };

  // --- Delete ---
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "folder") {
      const res = await submit("api/admin/business-folder/delete", { id: deleteTarget.id });
      if (res?.success) {
        toast.success("Folder deleted!");
        setDeleteTarget(null);
        refreshCurrentView();
      }
      return;
    }

    const res = await submit("api/admin/business-file/delete", { id: deleteTarget.id });
    if (res?.success) {
      toast.success("File deleted!");
      setDeleteTarget(null);
      refreshCurrentView();
    }
  };

  const foldersToShow = currentFolder ? childFolders : rootFolders;
  const isLoading = currentFolder ? folderLoading : rootLoading;
  const isEmpty = currentFolder
    ? foldersToShow.length === 0 && files.length === 0
    : foldersToShow.length === 0;

  return (
    <div className="dashboard-main">
      <style>{`
        :root {
          --cd-teal: #0A7C6E;
          --cd-teal-dark: #075e53;
          --cd-line: #eef1f1;
          --cd-muted: #64748b;
          --cd-ink: #0f172a;
        }
        .cd-topbar {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .cd-topbar-title {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .cd-topbar-title h1 {
          font-size: 20px;
          font-weight: 700;
          color: var(--cd-ink);
          margin: 0;
        }
        .cd-back-btn {
          width: 36px; height: 36px;
          border-radius: 10px;
          border: 1px solid var(--cd-line);
          background: #fff;
          color: var(--cd-ink);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }
        .cd-back-btn:hover { background: #f6f8fa; }
        .cd-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .cd-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.15s;
        }
        .cd-btn-primary {
          background: var(--cd-teal);
          color: #fff;
        }
        .cd-btn-primary:hover { background: var(--cd-teal-dark); }
        .cd-btn-outline {
          background: #fff;
          color: var(--cd-teal);
          border: 1px solid var(--cd-teal);
        }
        .cd-btn-outline:hover { background: #f0fdf9; }

        .cd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
        }
        .cd-card {
          position: relative;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
          padding: 20px 16px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          min-height: 150px;
        }
        .cd-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15,23,42,0.10);
        }
        .cd-card-icon-folder {
          font-size: 48px;
          color: #f6d751;
          margin-bottom: 10px;
        }
        .cd-card-icon-file {
          font-size: 42px;
          color: #94a3b8;
          margin-bottom: 10px;
        }
        .cd-card-name {
          font-weight: 600;
          color: var(--cd-ink);
          font-size: 14px;
          word-break: break-word;
        }
        .cd-card-sub {
          font-size: 12px;
          color: var(--cd-muted);
          margin-top: 4px;
        }
        .cd-card-actions {
          position: absolute;
          bottom: 10px;
          right: 12px;
          display: flex;
          gap: 10px;
        }
        .cd-card-actions button {
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 14px;
        }
        .cd-card-actions .edit { color: #2563eb; }
        .cd-card-actions .delete { color: #dc2626; }

        .cd-empty {
          text-align: center;
          padding: 3rem 2rem;
          background: #fff;
          border-radius: 16px;
          border: 1px solid var(--cd-line);
          color: var(--cd-muted);
          font-size: 0.95rem;
        }
        .cd-empty i { font-size: 1.8rem; margin-right: 0.5rem; vertical-align: middle; color: var(--cd-teal); }

        .cd-form-group { margin-bottom: 16px; }
        .cd-form-group label {
          display: block;
          font-weight: 600;
          font-size: 13px;
          color: var(--cd-ink);
          margin-bottom: 6px;
        }
        .cd-form-group input[type="text"],
        .cd-form-group input[type="date"],
        .cd-form-group input[type="file"] {
          width: 100%;
          border: 1px solid var(--cd-line);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
        }
        .cd-form-group input[type="text"]:focus,
        .cd-form-group input[type="date"]:focus {
          border-color: var(--cd-teal);
        }
        .cd-modal-save {
          width: 100%;
          margin-top: 8px;
        }
      `}</style>

      <div className="cd-topbar">
        <div className="cd-topbar-title">
          {currentFolder && (
            <button className="cd-back-btn" onClick={goBack} type="button" aria-label="Back">
              <i className="fa-solid fa-arrow-left"></i>
            </button>
          )}
          <h1>{currentFolder ? "Files and Folders" : "Company Documents"}</h1>
        </div>
        <div className="cd-actions">
          <button className="cd-btn cd-btn-primary" onClick={openCreateFolderModal} type="button">
            <i className="fa-solid fa-folder-plus"></i>
            {currentFolder ? "Create Folder" : "Create New Folder"}
          </button>
          {currentFolder && (
            <button className="cd-btn cd-btn-outline" onClick={openUploadModal} type="button">
              <i className="fa-solid fa-upload"></i>
              Upload Files
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="d-flex align-items-center justify-content-center" style={{ padding: "3rem 0" }}>
          <Loader />
        </div>
      ) : isEmpty ? (
        <div className="cd-empty">
          <i className="fa-solid fa-folder-open"></i>
          {currentFolder ? "This folder is empty." : "No document folders yet. Create one to get started."}
        </div>
      ) : (
        <div className="cd-grid">
          {foldersToShow.map((folder) => (
            <div key={`folder-${folder.id}`} className="cd-card" onClick={() => openFolder(folder)}>
              <i className="fa-solid fa-folder cd-card-icon-folder"></i>
              <div className="cd-card-name">{folder.folder}</div>
              <div className="cd-card-actions">
                <button
                  className="edit"
                  type="button"
                  title="Rename folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    openRenameFolderModal(folder);
                  }}
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
                <button
                  className="delete"
                  type="button"
                  title="Delete folder"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({ type: "folder", id: folder.id, label: folder.folder });
                  }}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}

          {currentFolder &&
            files.map((file) => (
              <div
                key={`file-${file.id}`}
                className="cd-card"
                onClick={() => window.open(resolveFileUrl(file.file_link), "_blank", "noopener,noreferrer")}
              >
                <i className={`${getFileIcon(file.name)} cd-card-icon-file`}></i>
                <div className="cd-card-name">{file.name}</div>
                {file.expiry_date && <div className="cd-card-sub">{formatDate(file.expiry_date)}</div>}
                <div className="cd-card-actions">
                  <button
                    className="edit"
                    type="button"
                    title="Edit file"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditFileModal(file);
                    }}
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button
                    className="delete"
                    type="button"
                    title="Delete file"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ type: "file", id: file.id, label: file.name });
                    }}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Create / Rename Folder Modal */}
      <Modal open={showFolderModal} onClose={closeFolderModal} title={editingFolder ? "Rename Folder" : "Create Folder"}>
        <div className="cd-form-group">
          <label>Name</label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name"
            autoFocus
          />
        </div>
        <button className="cd-btn cd-btn-primary cd-modal-save" onClick={handleSaveFolder} disabled={submitting} type="button">
          {submitting ? "Saving..." : "Save"}
        </button>
      </Modal>

      {/* Upload / Edit File Modal */}
      <Modal open={showUploadModal} onClose={closeUploadModal} title={editingFile ? "Edit File" : "Upload File"}>
        <div className="cd-form-group">
          <label>File Name</label>
          <input
            type="text"
            value={uploadName}
            onChange={(e) => setUploadName(e.target.value)}
            placeholder="Enter File Name"
            autoFocus
          />
        </div>
        <div className="cd-form-group">
          <label>Upload File{editingFile ? " (leave empty to keep existing file)" : ""}</label>
          <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
        </div>
        <div className="cd-form-group">
          <label>Expiry</label>
          <input type="date" value={uploadExpiry} onChange={(e) => setUploadExpiry(e.target.value)} />
        </div>
        <button className="cd-btn cd-btn-primary cd-modal-save" onClick={handleSaveFile} disabled={submitting} type="button">
          {submitting ? "Saving..." : "Save"}
        </button>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete">
        <p style={{ marginBottom: 20 }}>
          Are you sure you want to delete <strong>{deleteTarget?.label}</strong>? This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="cd-btn cd-btn-outline"
            style={{ flex: 1 }}
            onClick={() => setDeleteTarget(null)}
            type="button"
          >
            Cancel
          </button>
          <button
            className="cd-btn cd-btn-primary"
            style={{ flex: 1, background: "#dc2626" }}
            onClick={confirmDelete}
            disabled={submitting}
            type="button"
          >
            {submitting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CompanyDocuments;