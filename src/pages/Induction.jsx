import React, { useState, useMemo, useEffect } from "react";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import "../assets/css/induction.css";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import { Link } from 'react-router-dom';
import Select from "react-select";
import { apiURL } from "../utils/exports";
import { toast } from "react-toastify";

const getHistoryRows = (response) => {
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data?.history)) return response.data.history;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.history)) return response.history;
    if (Array.isArray(response)) return response;
    return [];
};

export default function Induction() {
    const { userdata } = useSelector((state) => state.auth);
    const userId = userdata?.id || userdata?.data?.id;

    const { data: listResponse, loading: listLoading, refetch: refetchList } = useFetch("api/questionnaire-list", { isAuth: true });
    const { data: staffResponse } = useFetch("api/admin/get-staffoo-staff?limit=1000", { isAuth: true });
    const { data: historyResponse, loading: historyLoading, refetch: refetchHistory } = useFetch("", { isAuth: true, immediate: false });

    const { submit: submitSave, loading: isSaving } = useSubmit({ isAuth: true });
    const { submit: submitDelete, loading: isDeleting } = useSubmit({ isAuth: true });
    const { submit: submitAssign, loading: isAssigning } = useSubmit({ isAuth: true });
    const { submit: uploadFile, loading: uploadLoading } = useSubmit({ isAuth: true });

    const australianStates = [
        { id: 'NSW', name: 'New South Wales' },
        { id: 'VIC', name: 'Victoria' },
        { id: 'QLD', name: 'Queensland' },
        { id: 'WA', name: 'Western Australia' },
        { id: 'SA', name: 'South Australia' },
        { id: 'TAS', name: 'Tasmania' },
        { id: 'ACT', name: 'Australian Capital Territory' },
        { id: 'NT', name: 'Northern Territory' }
    ];

    const stateOptions = australianStates.map(state => ({
        value: state.id,
        label: state.name
    }));

    const staffList = useMemo(() => {
        return staffResponse?.data?.data || [];
    }, [staffResponse?.data?.data]);

    const staffOptions = useMemo(() => {
        const options = staffList.map(staff => ({
            value: staff.id,
            label: `${staff.name} (${staff.id})`
        }));

        return [
            { value: "all", label: "Select All Staff" },
            ...options
        ];
    }, [staffList]);

    const inductions = listResponse?.data || listResponse || [];
    const historyRows = getHistoryRows(historyResponse);

    // ---------- Pagination state for history modal ----------
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);
    const historyPerPage = 10; // can be adjusted
    // --------------------------------------------------------

    const [activeModal, setActiveModal] = useState(null);
    const [selectedInduction, setSelectedInduction] = useState(null);

    const [formTitle, setFormTitle] = useState("");
    const [formSubtitles, setFormSubtitles] = useState([""]);
    const [formAttachment, setFormAttachment] = useState(null);
    const [formQuestions, setFormQuestions] = useState([
        { id: Date.now(), type: "MCQs", question: "", optiona: "", optionb: "", optionc: "", optiond: "", answer: "1", file: null, file_url: "", file_path: "" }
    ]);

    const [shareState, setShareState] = useState("");
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteInductionId, setDeleteInductionId] = useState(null);

    // React-select custom styles (unchanged)
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? '#0A7C6E' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #0A7C6E' : 'none',
            '&:hover': { borderColor: '#0A7C6E' },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#0A7C6E' : state.isFocused ? '#E6F4F2' : '#fff',
            color: state.isSelected ? '#fff' : '#000',
        }),
        singleValue: (provided) => ({ ...provided, color: '#0A7C6E', fontWeight: 500 }),
        menuPortal: base => ({ ...base, zIndex: 9999 }),
        multiValue: (provided) => ({ ...provided, backgroundColor: '#E6F4F2' }),
        multiValueLabel: (provided) => ({ ...provided, color: '#0A7C6E' }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#0A7C6E',
            ':hover': { backgroundColor: '#0A7C6E', color: 'white' },
        }),
    };

    // Extract total pages from API response
    useEffect(() => {
        if (historyResponse) {
            // Try multiple possible locations for pagination data
            const meta = historyResponse?.data?.meta || historyResponse?.meta || {};
            const lastPage = meta?.last_page || historyResponse?.data?.last_page || 1;
            setHistoryTotalPages(Number(lastPage));
        }
    }, [historyResponse]);

    // Helper to fetch history for a specific page
    const fetchHistory = (inductionId, page = 1) => {
        refetchHistory(`api/induction-history/${inductionId}?page=${page}&per_page=${historyPerPage}`);
    };

    const openModal = (type, induction = null) => {
        setSelectedInduction(induction);
        setActiveModal(type);

        if (type === "history" && induction?.id) {
            setHistoryPage(1); // reset to first page
            fetchHistory(induction.id, 1);
        }

        if (type === 'create') {
            if (induction) {
                setFormTitle(induction.title || "");
                setFormSubtitles(induction.sub_heading?.length ? induction.sub_heading : [""]);

                const mappedQuestions = induction.questionnaire?.length
                    ? induction.questionnaire.map((q, index) => ({
                        id: Date.now() + index,
                        type: q.type || "MCQs",
                        question: q.question || "",
                        optiona: q.optiona || "",
                        optionb: q.optionb || "",
                        optionc: q.optionc || "",
                        optiond: q.optiond || "",
                        answer: q.answer || "1",
                        file: null,
                        file_url: q.file || "",
                        file_path: q.file || ""
                    }))
                    : [{ id: Date.now(), type: "MCQs", question: "", optiona: "", optionb: "", optionc: "", optiond: "", answer: "1", file: null, file_url: "", file_path: "" }];

                setFormQuestions(mappedQuestions);
                setFormAttachment(null);
            } else {
                setFormTitle("");
                setFormSubtitles([""]);
                setFormAttachment(null);
                setFormQuestions([{ id: Date.now(), type: "MCQs", question: "", optiona: "", optionb: "", optionc: "", optiond: "", answer: "1", file: null, file_url: "", file_path: "" }]);
            }
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedInduction(null);
        setShareState("");
        setSelectedStaff([]);
    };

    // ---- Form handling functions (unchanged) ----
    const addSubtitle = () => setFormSubtitles([...formSubtitles, ""]);
    const removeSubtitle = (index) => {
        const updated = [...formSubtitles];
        updated.splice(index, 1);
        setFormSubtitles(updated);
    };
    const handleSubtitleChange = (index, value) => {
        const updated = [...formSubtitles];
        updated[index] = value;
        setFormSubtitles(updated);
    };

    const addQuestion = () => {
        setFormQuestions([
            ...formQuestions,
            { id: Date.now(), type: "MCQs", question: "", optiona: "", optionb: "", optionc: "", optiond: "", answer: "1", file: null, file_url: "", file_path: "" }
        ]);
    };
    const removeQuestion = (index) => {
        const updated = [...formQuestions];
        updated.splice(index, 1);
        setFormQuestions(updated);
    };
    const handleQuestionChange = (index, field, value) => {
        const updated = [...formQuestions];
        const q = updated[index];
        if (field === "file") {
            handleQuestionFileUpload(index, value);
        } else {
            q[field] = value;
            if (field === "type" && value === "True/False") {
                q.optiona = "True"; q.optionb = "False"; q.optionc = ""; q.optiond = ""; q.answer = "1";
            }
            setFormQuestions(updated);
        }
    };

    const handleSaveInduction = async () => {
        if (!formTitle.trim()) {
            toast.error("Please enter a title for the induction.");
            return;
        }
        if (formQuestions.length === 0 || !formQuestions[0].question.trim()) {
            alert("Please add at least one question.");
            return;
        }
        const formData = new FormData();

        if (selectedInduction?.id) formData.append("id", selectedInduction.id);
        formData.append("title", formTitle);
        if (userId) formData.append("admin_id", userId);

        formSubtitles.forEach((sub, i) => formData.append(`sub_heading[${i}]`, sub));
        if (formAttachment) formData.append("attachment", formAttachment);

        formQuestions.forEach((q, i) => {
            formData.append(`questionnaire[${i}][question]`, q.question);
            formData.append(`questionnaire[${i}][type]`, q.type);
            formData.append(`questionnaire[${i}][answer]`, q.answer);
            formData.append(`questionnaire[${i}][optiona]`, q.optiona || "");
            formData.append(`questionnaire[${i}][optionb]`, q.optionb || "");
            formData.append(`questionnaire[${i}][optionc]`, q.optionc || "");
            formData.append(`questionnaire[${i}][optiond]`, q.optiond || "");
            if (q.file_path) {
                formData.append(`questionnaire[${i}][file]`, q.file_path);
            } else if (q.file_url) {
                formData.append(`questionnaire[${i}][file]`, q.file_url);
            }
        });

        const res = await submitSave("api/questionnaire-save", formData, { method: "POST" });
        if (res && res.success !== false) {
            closeModal();
            refetchList();
        }
    };

    const handleDelete = async (id) => {
        setDeleteInductionId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteInductionId) return;
        const res = await submitDelete(`api/questionnaire-delete/${deleteInductionId}`, {}, { method: "GET" });
        if (res && res.success !== false) {
            setShowDeleteModal(false);
            setDeleteInductionId(null);
            refetchList();
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteInductionId(null);
    };

    const handleAssign = async () => {
        if (!shareState || selectedStaff.length === 0) {
            toast.error("Please select both state and at least one staff member");
            return;
        }
        const payload = {
            questionnaire_id: selectedInduction.id,
            state: shareState,
            staff_ids: selectedStaff
        };
        const res = await submitAssign("api/assign-questionnaire", payload, { method: "POST" });
        if (res && res.success !== false) {
            closeModal();
        }
    };

    const handleQuestionFileUpload = async (qIndex, file) => {
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "induction_documents");
        const res = await uploadFile("api/upload-file", fd, { method: "POST" });
        if (res?.success) {
            const updated = [...formQuestions];
            updated[qIndex] = {
                ...updated[qIndex],
                file_url: res.url || res.data?.url || "",
                file_path: res.path || res.data?.path || ""
            };
            setFormQuestions(updated);
        }
    };

    // ------- History modal with pagination -------
    const renderHistoryModal = () => (
        <div className="custom-modal-overlay">
            <div className="custom-modal-content" style={{ maxWidth: '700px', width: '100%' }}>
                <div className="modal-header d-flex justify-content-between p-3 p-md-4 border-bottom">
                    <h5 className="m-0 fw-bold">Induction History</h5>
                    <button onClick={closeModal} className="btn-close"></button>
                </div>
                <div className="p-3 p-md-4">
                    {historyLoading ? (
                        <div className="py-5 text-center">
                            <Loader />
                        </div>
                    ) : historyRows.length > 0 ? (
                        <>
                            <div className="table-responsive">
                                <table className="table align-middle">
                                    <thead className="table-light text-secondary small">
                                        <tr><th>GUARD NAME</th><th>DATE</th><th>STATUS</th><th>ACTION</th></tr>
                                    </thead>
                                    <tbody>
                                        {historyRows.map((record, index) => {
                                            const name = record?.name || record?.staff_name || record?.user_name || record?.guard_name || "Unknown";
                                            const date = record?.date || record?.created_at || record?.updated_at || record?.completed_at || "-";
                                            const isRead = Number(record?.read_status) === 1;
                                            const hasCertificate = Boolean(record?.certificate_path);
                                            const isCompleted = isRead && hasCertificate;
                                            const isOpen = isRead && !hasCertificate;
                                            const status = isCompleted ? "Completed" : isOpen ? "Open" : "Incomplete";
                                            const statusClass = isCompleted
                                                ? "bg-success bg-opacity-10 text-success"
                                                : isOpen
                                                    ? "bg-warning bg-opacity-10 text-warning"
                                                    : "bg-secondary bg-opacity-10 text-secondary";

                                            return (
                                                <tr key={record?.id || `${name}-${date}-${index}`}>
                                                    <td className="fw-medium text-nowrap">{name}</td>
                                                    <td className="text-muted text-nowrap">{date}</td>
                                                    <td>
                                                        <span className={`badge rounded-pill fw-normal ${statusClass}`}>
                                                            {status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {isCompleted && (
                                                            <Link className="btn btn-sm bg-success bg-opacity-10 text-success border border-success"
                                                                href={record?.certificate_path}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                title="Download certificate"
                                                            >
                                                                <i className="fa fa-download"></i>
                                                            </Link>
                                                        )}
                                                        {isOpen && (
                                                            <button
                                                                className="btn btn-sm bg-warning bg-opacity-10 text-warning border border-warning"
                                                                title="Certificate not available yet"
                                                                disabled
                                                            >
                                                                <i className="fa fa-download"></i>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination controls */}
                            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                <span className="text-muted small">
                                    Page {historyPage} of {historyTotalPages}
                                </span>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        disabled={historyPage <= 1 || historyLoading}
                                        onClick={() => {
                                            const newPage = historyPage - 1;
                                            setHistoryPage(newPage);
                                            fetchHistory(selectedInduction.id, newPage);
                                        }}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        disabled={historyPage >= historyTotalPages || historyLoading}
                                        onClick={() => {
                                            const newPage = historyPage + 1;
                                            setHistoryPage(newPage);
                                            fetchHistory(selectedInduction.id, newPage);
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-5 text-center text-muted">
                            No induction history found for this record{historyPage > 1 ? ' on this page' : ''}.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Share modal (unchanged)
    const renderShareModal = () => (
        <div className="custom-modal-overlay">
            <div className="custom-modal-content" style={{ maxWidth: '550px', width: '100%' }}>
                <div className="modal-header d-flex justify-content-between p-3 p-md-4 border-bottom">
                    <h5 className="m-0 fw-bold">Assign Induction to Staff</h5>
                    <button onClick={closeModal} className="btn-close"></button>
                </div>
                <div className="p-3 p-md-4">
                    <div className="mb-4">
                        <label className="form-label text-muted small fw-bold">Select State *</label>
                        <Select
                            options={stateOptions}
                            value={stateOptions.find((o) => o.value === shareState) || null}
                            onChange={(selectedOption) => setShareState(selectedOption ? selectedOption.value : "")}
                            placeholder="Choose a state..."
                            isClearable
                            styles={customSelectStyles}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label text-muted small fw-bold">Select Staff Members *</label>
                        <Select
                            isMulti
                            options={staffOptions}
                            value={staffOptions.filter(
                                (o) => o.value !== "all" && selectedStaff.includes(o.value)
                            )}
                            onChange={(selectedOptions) => {
                                if (!selectedOptions) {
                                    setSelectedStaff([]);
                                    return;
                                }
                                const hasSelectAll = selectedOptions.some(option => option.value === "all");
                                if (hasSelectAll) {
                                    setSelectedStaff(staffList.map(staff => staff.id));
                                } else {
                                    setSelectedStaff(selectedOptions.map(option => option.value));
                                }
                            }}
                            placeholder="Search and select staff..."
                            styles={customSelectStyles}
                            closeMenuOnSelect={false}
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                        />
                        {selectedStaff.length > 0 && (
                            <div className="mt-2 small text-primary">
                                {selectedStaff.length} staff member{selectedStaff.length !== 1 ? 's' : ''} selected
                            </div>
                        )}
                    </div>
                    <div className="text-end d-flex flex-wrap justify-content-end gap-2">
                        <button className="btn btn-light px-4 rounded-pill w-sm-100" onClick={closeModal}>Cancel</button>
                        <button
                            className="btn btn-primary-custom px-4 rounded-pill w-sm-100"
                            onClick={handleAssign}
                            disabled={isAssigning || !shareState || selectedStaff.length === 0}
                        >
                            {isAssigning ? "Sending..." : "Assign"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Delete modal (unchanged)
    const renderDeleteModal = () => (
        <div className="custom-modal-overlay">
            <div className="custom-modal-content" style={{ maxWidth: '450px', width: '100%' }}>
                <div className="p-3 p-md-4">
                    <div className="text-center mb-4">
                        <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                            <i className="fa fa-trash text-danger" style={{ fontSize: '40px' }}></i>
                        </div>
                    </div>
                    <h5 className="text-center fw-bold mb-3">Delete Induction?</h5>
                    <p className="text-center text-muted mb-4">
                        Are you sure you want to delete this induction? This action cannot be undone and all associated data will be permanently removed.
                    </p>
                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                        <button className="btn btn-light px-4 px-md-5 rounded-pill fw-medium border" onClick={cancelDelete} disabled={isDeleting}>Cancel</button>
                        <button className="btn btn-danger px-4 px-md-5 rounded-pill fw-medium" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Create/Edit modal (unchanged)
    const renderCreateModal = () => (
        <div className="custom-modal-overlay p-0">
            <div className="custom-modal-content fullscreen-modal rounded-0" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="modal-header bg-white d-flex justify-content-between px-3 px-md-4 py-3 border-bottom shadow-sm" style={{ flexShrink: 0, zIndex: 10 }}>
                    <h5 className="m-0 fw-bold text-dark text-truncate pe-3">{selectedInduction ? "Edit Induction" : "Create New Induction"}</h5>
                    <button onClick={closeModal} className="btn-close"></button>
                </div>
                <div className="p-3 p-md-4 bg-light d-flex justify-content-center" style={{ overflowY: 'auto', flexGrow: 1 }}>
                    <div className="w-100" style={{ maxWidth: '1000px' }}>
                        <div className="mb-4 bg-white p-3 p-md-4 rounded shadow-sm border border-light">
                            <div className="mb-4">
                                <label className="form-label fw-bold text-dark small">Main Induction Title</label>
                                <input type="text" className="form-control form-control-lg clean-input fw-bold text-dark" placeholder="e.g., STAFFOO Code of Conduct"
                                    value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                            </div>
                            <div className="row">
                                <div className="col-12 col-md-8 col-lg-7">
                                    <label className="form-label fw-bold small text-muted">Subheadings</label>
                                    {formSubtitles.map((sub, index) => (
                                        <div className="d-flex mb-2" key={index}>
                                            <input type="text" className="form-control clean-input me-2" placeholder="Enter subheading..."
                                                value={sub} onChange={(e) => handleSubtitleChange(index, e.target.value)} />
                                            {formSubtitles.length > 1 && (
                                                <button className="btn btn-light text-danger border flex-shrink-0" onClick={() => removeSubtitle(index)}>
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button className="btn btn-sm btn-link text-decoration-none p-0 mt-1 fw-medium" onClick={addSubtitle}>
                                        <i className="fa fa-plus-circle me-1"></i> Add Subheading
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 mt-md-5 mb-3 d-flex justify-content-between align-items-end border-bottom pb-2">
                            <h5 className="m-0 fw-bold text-dark">Questions ({formQuestions.length})</h5>
                        </div>

                        {formQuestions.map((q, qIndex) => (
                            <div key={q.id} className="border border-light rounded p-3 p-md-4 mb-4 bg-white shadow-sm position-relative">
                                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                                    <span className="badge bg-primary bg-opacity-10 text-white rounded-pill px-3 py-2 fw-bold">
                                        Question {qIndex + 1}
                                    </span>
                                    {formQuestions.length > 1 && (
                                        <button className="btn btn-sm text-muted hover-text-danger p-0" onClick={() => removeQuestion(qIndex)} title="Remove Question">
                                            <i className="fa fa-trash fs-5"></i>
                                        </button>
                                    )}
                                </div>

                                <div className="row mb-4 g-3">
                                    <div className="col-12 col-md-8">
                                        <label className="form-label small text-muted fw-bold">Question Text</label>
                                        <input type="text" className="form-control clean-input" placeholder="Type your question here..."
                                            value={q.question} onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)} />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label small text-muted fw-bold">Question Type</label>
                                        <select className="form-select clean-input" value={q.type} onChange={(e) => handleQuestionChange(qIndex, "type", e.target.value)}>
                                            <option value="MCQs">Multiple Choice</option>
                                            <option value="True/False">True / False</option>
                                            <option value="Short Question">Short Question</option>
                                        </select>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label small text-muted fw-bold mt-2">Question Document (PDF Only)</label>
                                        <div className="d-flex gap-2 align-items-center flex-wrap">
                                            <input type="file" className="form-control clean-input flex-grow-1" accept=".pdf, application/pdf"
                                                onChange={(e) => handleQuestionChange(qIndex, "file", e.target.files[0])}
                                                disabled={uploadLoading}
                                            />
                                            {uploadLoading && <span className="spinner-border spinner-border-sm text-primary"></span>}
                                        </div>
                                        {q.file_url && (
                                            <div className="mt-2 p-2 p-md-3 bg-light border rounded small d-flex flex-wrap align-items-center justify-content-between gap-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="fa fa-file-pdf-o text-danger" style={{ fontSize: '18px' }}></i>
                                                    <div>
                                                        <p className="mb-0 text-muted fw-medium line-clamp-1">File uploaded</p>
                                                        <a
                                                            href={`${apiURL}induction_documents/${q.file_url}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary small text-decoration-none text-break"
                                                            style={{ fontSize: '12px' }}
                                                        >
                                                            View PDF
                                                        </a>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-light text-danger border-0"
                                                    onClick={() => {
                                                        const updated = [...formQuestions];
                                                        updated[qIndex] = { ...updated[qIndex], file_url: "", file_path: "" };
                                                        setFormQuestions(updated);
                                                    }}
                                                    title="Remove file"
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {q.type === "MCQs" && (
                                    <div className="row g-3 mb-4">
                                        {['a', 'b', 'c', 'd'].map(opt => (
                                            <div className="col-12 col-md-6" key={opt}>
                                                <div className="d-flex align-items-center bg-light border rounded pe-2 overflow-hidden">
                                                    <span className="text-muted fw-bold px-3 py-2 border-end bg-white">{opt}</span>
                                                    <input type="text" className="form-control border-0 shadow-none bg-transparent ps-3" placeholder={`Option ${opt.toUpperCase()}`} value={q[`option${opt}`]}
                                                        onChange={(e) => handleQuestionChange(qIndex, `option${opt}`, e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="p-3 bg-light border rounded">
                                    {q.type !== "Short Question" ? (
                                        <div className="row align-items-center g-2">
                                            <div className="col-12 col-md-4">
                                                <label className="form-label small text-muted fw-bold m-0">Correct Answer:</label>
                                            </div>
                                            <div className="col-12 col-md-8">
                                                <select className="form-select clean-input fw-bold text-success border-success"
                                                    value={q.answer} onChange={(e) => handleQuestionChange(qIndex, "answer", e.target.value)}>
                                                    {q.type === "MCQs" ? (
                                                        <><option value="1">Option A</option><option value="2">Option B</option><option value="3">Option C</option><option value="4">Option D</option></>
                                                    ) : (
                                                        <><option value="1">True</option><option value="2">False</option></>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="form-label small text-muted fw-bold">Expected Answer / Guidelines</label>
                                            <textarea className="form-control clean-input" rows="3" placeholder="Define the correct criteria for this short answer..." value={q.answer}
                                                onChange={(e) => handleQuestionChange(qIndex, "answer", e.target.value)}></textarea>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="text-center mt-3 mb-4">
                            <button className="btn btn-light border text-primary rounded-pill px-4 px-md-5 py-2 fw-bold shadow-sm hover-bg-light w-100 w-md-auto" onClick={addQuestion}>
                                <i className="fa fa-plus me-2"></i> Add Question
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-3 px-md-4 py-3 bg-white border-top text-end mb-0 shadow-sm d-flex flex-wrap justify-content-end gap-2" style={{ flexShrink: 0, zIndex: 10 }}>
                    <button className="btn btn-light px-4 rounded-pill fw-medium flex-grow-1 flex-sm-grow-0" onClick={closeModal} disabled={isSaving}>Cancel</button>
                    <button className="btn btn-primary-custom px-4 px-md-5 rounded-pill fw-medium shadow-sm flex-grow-1 flex-sm-grow-0" onClick={handleSaveInduction} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Induction"}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="staffoo-page">
            <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border border-light">
                <h2 className="h4 m-0 text-dark fw-bold">Induction</h2>
                <button
                    className="btn btn-primary-custom btn-sm d-flex align-items-center gap-2 rounded-pill px-3 py-1 shadow-sm"
                    onClick={() => openModal("create")}
                >
                    <i className="fa fa-plus"></i> Create Induction
                </button>
            </div>

            {listLoading ? (
                <Loader />
            ) : (
                <div className="row g-4">
                    {inductions.length > 0 ? inductions.map((induction) => (
                        <div className="col-12 col-lg-6 col-xl-4" key={induction.id}>
                            <div className="card h-100 border-0 shadow-sm staffoo-card">
                                <div className="card-body d-flex flex-column p-3 p-xl-4">
                                    <h5 className="card-title text-dark fw-bold mb-4 lh-base" style={{ wordWrap: 'break-word' }}>
                                        {induction.title || "Untitled Questionnaire"}
                                    </h5>
                                    <div className="mt-auto pt-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
                                        <div className="d-flex align-items-center gap-2 text-muted small fw-medium text-truncate" style={{ maxWidth: '45%' }}>
                                            <i className="fa fa-user-circle fs-5"></i>
                                            <span className="text-truncate">{induction?.admin?.name || "Admin"}</span>
                                        </div>
                                        <div className="d-flex gap-1 action-icons flex-shrink-0">
                                            <button onClick={() => openModal("history", induction)}><i className="fa fa-eye"></i></button>
                                            <button onClick={() => openModal("create", induction)}><i className="fa fa-edit"></i></button>
                                            <button onClick={() => handleDelete(induction.id)}><i className="fa fa-trash"></i></button>
                                            <button onClick={() => openModal("share", induction)}><i className="fa fa-share-alt"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-12 text-center text-muted py-5">
                            <p>No inductions found. Create one to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {activeModal === "history" && renderHistoryModal()}
            {activeModal === "share" && renderShareModal()}
            {activeModal === "create" && renderCreateModal()}
            {showDeleteModal && renderDeleteModal()}
        </div>
    );
}