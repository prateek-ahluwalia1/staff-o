import React, { useState } from "react";
import "../assets/css/induction.css";

const inductionTitles = [
    "STAFFOO Code of Conduct", "Use of Force", "PPE Use in the Workplace",
    "Covid Safe Practices", "Work Health & Safety Practices", "Site Induction Procedures"
];

const mockInductions = inductionTitles.map((title, index) => ({
    id: index + 1,
    title: title,
    author: ["STARC", "SMB", "USMAN", "SHAHBAZ"][index % 4],
}));

const mockHistoryData = [
    { id: 1, name: "Amelia Charlotte", date: "24-01-2024 20:44", status: "Uncompleted" },
    { id: 2, name: "Micheal Scott", date: "23-01-2024 16:59", status: "Completed" },
    { id: 3, name: "Nitin Prashar", date: "22-01-2024 22:40", status: "Uncompleted" },
];

export default function Induction() {
    const [activeModal, setActiveModal] = useState(null);
    const [selectedInduction, setSelectedInduction] = useState(null);

    const [formTitle, setFormTitle] = useState("");
    const [formSubtitles, setFormSubtitles] = useState([""]);
    const [formAttachment, setFormAttachment] = useState(null);
    const [formQuestions, setFormQuestions] = useState([
        {
            id: Date.now(), type: "MCQs", question: "",
            optiona: "", optionb: "", optionc: "", optiond: "", answer: "1"
        }
    ]);

    const openModal = (type, induction = null) => {
        setSelectedInduction(induction);
        setActiveModal(type);
        if (type === 'create') {
            setFormTitle("");
            setFormSubtitles([""]);
            setFormAttachment(null);
            setFormQuestions([{ id: Date.now(), type: "MCQs", question: "", optiona: "", optionb: "", optionc: "", optiond: "", answer: "1" }]);
        }
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedInduction(null);
    };

    const addSubtitle = () => {
        setFormSubtitles([...formSubtitles, ""]);
    };
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
            { id: Date.now(), type: "MCQs", question: "", optiona: "", optionb: "", optionc: "", optiond: "", answer: "1" }
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
        q[field] = value;

        if (field === "type" && value === "True/False") {
            q.optiona = "True"; q.optionb = "False"; q.optionc = ""; q.optiond = ""; q.answer = "1";
        }
        setFormQuestions(updated);
    };

    const handleSaveInduction = () => {
        const payload = {
            title: formTitle,
            subtitles: formSubtitles,
            attachment: formAttachment,
            questions: formQuestions
        };
        console.log("Saving Payload:", JSON.stringify(payload, null, 2));
        closeModal();
        alert("Induction saved! Check console for payload.");
    };

    const renderHistoryModal = () => (
        <div className="custom-modal-overlay">
            <div className="custom-modal-content" style={{ maxWidth: '700px' }}>
                <div className="modal-header d-flex justify-content-between p-4 border-bottom">
                    <h5 className="m-0 fw-bold">Induction History</h5>
                    <button onClick={closeModal} className="btn-close"></button>
                </div>
                <div className="p-4">
                    <table className="table align-middle">
                        <thead className="table-light text-secondary small">
                            <tr><th>GUARD NAME</th><th>DATE</th><th>STATUS</th><th>ACTION</th></tr>
                        </thead>
                        <tbody>
                            {mockHistoryData.map((record) => (
                                <tr key={record.id}>
                                    <td className="fw-medium">{record.name}</td>
                                    <td className="text-muted">{record.date}</td>
                                    <td>
                                        <span className={`badge rounded-pill fw-normal ${record.status === 'Completed' ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td>
                                        {record.status === "Completed" && (
                                            <button className="btn btn-sm text-primary" title="Download"><i className="fa fa-download"></i></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderShareModal = () => (
        <div className="custom-modal-overlay">
            <div className="custom-modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header d-flex justify-content-between p-4 border-bottom">
                    <h5 className="m-0 fw-bold">Share Induction</h5>
                    <button onClick={closeModal} className="btn-close"></button>
                </div>
                <div className="p-4">
                    <div className="mb-3">
                        <label className="form-label text-muted small fw-bold">Select State</label>
                        <select className="form-select clean-input"><option>Tasmania</option><option>Victoria</option></select>
                    </div>
                    <div className="mb-4">
                        <label className="form-label text-muted small fw-bold">Select Customers *</label>
                        <select className="form-select clean-input"><option>Select...</option><option>Customer A</option></select>
                    </div>
                    <div className="text-end">
                        <button className="btn btn-primary px-4 rounded-pill" onClick={closeModal}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCreateModal = () => (
        <div className="custom-modal-overlay p-0">
            <div className="custom-modal-content fullscreen-modal rounded-0" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div className="modal-header bg-white d-flex justify-content-between px-4 py-3 border-bottom shadow-sm" style={{ flexShrink: 0, zIndex: 10 }}>
                    <h5 className="m-0 fw-bold text-dark">{selectedInduction ? "Edit Induction" : "Create New Induction"}</h5>
                    <button onClick={closeModal} className="btn-close"></button>
                </div>
                <div className="p-4 bg-light d-flex justify-content-center" style={{ overflowY: 'auto', flexGrow: 1 }}>
                    <div className="w-100" style={{ maxWidth: '1000px' }}>
                        <div className="mb-4 bg-white p-4 rounded shadow-sm border border-light">
                            <div className="mb-4">
                                <label className="form-label fw-bold text-dark small text-uppercase">Main Induction Title</label>
                                <input type="text" className="form-control form-control-lg clean-input fw-bold text-dark" placeholder="e.g., STAFFOO Code of Conduct"
                                    value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                            </div>

                            <div className="row">
                                <div className="col-md-7">
                                    <label className="form-label fw-bold small text-muted text-uppercase">Subheadings</label>
                                    {formSubtitles.map((sub, index) => (
                                        <div className="d-flex mb-2" key={index}>
                                            <input type="text" className="form-control clean-input me-2" placeholder="Enter subheading..."
                                                value={sub} onChange={(e) => handleSubtitleChange(index, e.target.value)} />
                                            {formSubtitles.length > 1 && (
                                                <button className="btn btn-light text-danger border" onClick={() => removeSubtitle(index)}>
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button className="btn btn-sm btn-link text-decoration-none p-0 mt-1 fw-medium" onClick={addSubtitle}>
                                        <i className="fa fa-plus-circle me-1"></i> Add Subheading
                                    </button>
                                </div>

                                <div className="col-md-5">
                                    <label className="form-label fw-bold small text-muted text-uppercase">Global Attachment (Optional)</label>
                                    <input type="file" className="form-control clean-input"
                                        onChange={(e) => setFormAttachment(e.target.files[0])} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 mb-3 d-flex justify-content-between align-items-end border-bottom pb-2">
                            <h5 className="m-0 fw-bold text-dark">Questions ({formQuestions.length})</h5>
                        </div>

                        {formQuestions.map((q, qIndex) => (
                            <div key={q.id} className="border border-light rounded p-4 mb-4 bg-white shadow-sm position-relative">

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-bold">
                                        Question {qIndex + 1}
                                    </span>
                                    {formQuestions.length > 1 && (
                                        <button className="btn btn-sm text-muted hover-text-danger p-0" onClick={() => removeQuestion(qIndex)} title="Remove Question">
                                            <i className="fa fa-trash fs-5"></i>
                                        </button>
                                    )}
                                </div>

                                <div className="row mb-4">
                                    <div className="col-md-8">
                                        <label className="form-label small text-muted fw-bold">Question Text</label>
                                        <input type="text" className="form-control clean-input" placeholder="Type your question here..."
                                            value={q.question} onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)} />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small text-muted fw-bold">Question Type</label>
                                        <select className="form-select clean-input" value={q.type} onChange={(e) => handleQuestionChange(qIndex, "type", e.target.value)}>
                                            <option value="MCQs">Multiple Choice</option>
                                            <option value="True/False">True / False</option>
                                            <option value="Short Question">Short Question</option>
                                        </select>
                                    </div>
                                </div>
                                {q.type === "MCQs" && (
                                    <div className="row g-3 mb-4">
                                        {['a', 'b', 'c', 'd'].map(opt => (
                                            <div className="col-md-6" key={opt}>
                                                <div className="d-flex align-items-center bg-light border rounded pe-2 overflow-hidden">
                                                    <span className="text-muted fw-bold px-3 py-2 border-end text-uppercase bg-white">{opt}</span>
                                                    <input type="text" className="form-control border-0 shadow-none bg-transparent ps-3" placeholder={`Option ${opt.toUpperCase()}`} value={q[`option${opt}`]}
                                                        onChange={(e) => handleQuestionChange(qIndex, `option${opt}`, e.target.value)} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="p-3 bg-light border rounded">
                                    {q.type !== "Short Question" ? (
                                        <div className="row align-items-center">
                                            <div className="col-md-4">
                                                <label className="form-label small text-muted fw-bold m-0">Correct Answer:</label>
                                            </div>
                                            <div className="col-md-8">
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
                                            <textarea className="form-control clean-input" rows="2" placeholder="Define the correct criteria for this short answer..." value={q.answer}
                                                onChange={(e) => handleQuestionChange(qIndex, "answer", e.target.value)}></textarea>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="text-center mt-2 mb-5">
                            <button className="btn btn-light border text-primary rounded-pill px-5 py-2 fw-bold shadow-sm hover-bg-light" onClick={addQuestion}>
                                <i className="fa fa-plus me-2"></i> Add Question
                            </button>
                        </div>

                    </div>
                </div>

                <div className="px-4 py-3 bg-white border-top text-end mb-0 shadow-sm" style={{ flexShrink: 0, zIndex: 10 }}>
                    <button className="btn btn-light me-3 px-4 rounded-pill fw-medium" onClick={closeModal}>Cancel</button>
                    <button className="btn btn-primary px-5 rounded-pill fw-medium shadow-sm" onClick={handleSaveInduction}>Save Induction</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="staffoo-page">
            <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border border-light">
                <h2 className="h4 m-0 text-dark fw-bold">Induction</h2>
                <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 shadow-sm" onClick={() => openModal("create")}>
                    <i className="fa fa-plus"></i> Create Induction
                </button>
            </div>

            <div className="row g-4">
                {mockInductions.map((induction) => (
                    <div className="col-12 col-md-6 col-lg-4" key={induction.id}>
                        <div className="card h-100 border-0 shadow-sm staffoo-card">
                            <div className="card-body d-flex flex-column p-4">
                                <h5 className="card-title text-dark fw-bold mb-4 lh-base">{induction.title}</h5>
                                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center gap-2 text-muted small fw-medium">
                                        <i className="fa fa-user-circle fs-5"></i> {induction.author}
                                    </div>
                                    <div className="d-flex gap-2 action-icons">
                                        <button onClick={() => openModal("history", induction)}><i className="fa fa-eye"></i></button>
                                        <button onClick={() => openModal("create", induction)}><i className="fa fa-edit"></i></button>
                                        <button onClick={() => console.log("Delete")}><i className="fa fa-trash"></i></button>
                                        <button onClick={() => openModal("share", induction)}><i className="fa fa-share-alt"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {activeModal === "history" && renderHistoryModal()}
            {activeModal === "share" && renderShareModal()}
            {activeModal === "create" && renderCreateModal()}
        </div>
    );
}