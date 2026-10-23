import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import useFetch from "../hooks/useFetch";
import useSubmit from "../hooks/useSubmit";
import Loader from "./Loader";
import { apiURL } from "../utils/exports";

const resolveQuestionFileUrl = (file) => {
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  return `${apiURL}induction_documents/${file}`;
};

const STATUS_META = {
  passed: { label: "Passed", bg: "rgba(22,163,74,0.1)", color: "#16a34a" },
  failed: { label: "Failed", bg: "rgba(220,38,38,0.1)", color: "#dc2626" },
  pending: { label: "Pending", bg: "rgba(217,119,6,0.1)", color: "#d97706" },
};

/**
 * Induction tab shown on the profile page for both staff and resource
 * partner (contractor) accounts. Lists every induction assigned to the
 * user, lets them take (or retake) a quiz, and shows pass/fail with the
 * score out of 100 (80 to pass).
 */
export default function InductionTab({ userId }) {
  const { data, loading, refetch } = useFetch(
    userId ? `api/get-questionnaire/${userId}` : null,
    { isAuth: true, immediate: Boolean(userId) }
  );

  const { submit, loading: submitting } = useSubmit({ isAuth: true });

  const [activeInduction, setActiveInduction] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null); // { marks, status }

  const inductions = useMemo(() => {
    if (!data?.success) return [];
    if (!Array.isArray(data.data)) return [];
    return data.data;
  }, [data]);

  const openInduction = async (induction) => {
    setActiveInduction(induction);
    setAnswers({});
    setResult(null);

    // Mark as opened/read (best-effort, ignore failure).
    submit(
      "api/update-induction-read-status",
      { guard_id: userId, id: induction.induction_id },
      { method: "POST", silentErrorToast: true }
    );
  };

  const closeInduction = () => {
    setActiveInduction(null);
    setAnswers({});
    setResult(null);
  };

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const questions = activeInduction?.questionnaire || [];
  const scorableCount = questions.filter((q) => q?.type !== "Short Question").length;
  const answeredScorableCount = questions.filter(
    (q, i) => q?.type !== "Short Question" && answers[i] !== undefined && answers[i] !== ""
  ).length;

  const handleSubmitQuiz = async () => {
    if (scorableCount > 0 && answeredScorableCount < scorableCount) {
      toast.error("Please answer every question before submitting.");
      return;
    }

    const res = await submit(
      "api/submit-guard-questionnaire",
      {
        questionnaire_id: activeInduction.id,
        guard_id: userId,
        answers,
      },
      { method: "POST" }
    );

    if (res?.success) {
      setResult({ marks: res.marks, status: res.status });
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ padding: "3rem 0" }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="content-card p-4">
      <style>{`
        .induction-tab-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .induction-tab-card {
          background: #fff; border: 1px solid #eef1f1; border-radius: 14px; padding: 18px;
          display: flex; flex-direction: column; gap: 10px;
          box-shadow: 0 2px 10px rgba(15,23,42,0.05);
        }
        .induction-tab-badge {
          display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.02em; text-transform: uppercase;
          border-radius: 999px; padding: 5px 12px; width: fit-content; align-self: flex-start;
          white-space: nowrap;
        }
        .induction-tab-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
        .induction-file-link {
          display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600;
          color: #0A7C6E; text-decoration: none; width: fit-content; align-self: flex-start;
        }
        .induction-file-link:hover { text-decoration: underline; }
        .induction-file-btn {
          display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;
          color: #0A7C6E; text-decoration: none; width: fit-content; align-self: flex-start;
          background: #fff; border: 1px solid #0A7C6E; border-radius: 8px; padding: 7px 14px;
        }
        .induction-file-btn:hover { background: #f0fdf9; color: #075e53; }
        .induction-warning-note {
          display: flex; align-items: flex-start; gap: 10px; background: #fffbeb;
          border: 1px solid #fde68a; color: #92400e; border-radius: 10px; padding: 12px 16px;
          font-size: 13px; font-weight: 500; line-height: 1.5; text-transform: none;
        }
        .induction-warning-note i { color: #d97706; font-size: 15px; margin-top: 2px; }
        .induction-tab-btn {
          border: none; border-radius: 10px; padding: 9px 16px; font-weight: 600; font-size: 13px;
          cursor: pointer; background: #0A7C6E; color: #fff;
        }
        .induction-tab-btn:hover { background: #075e53; }
        .induction-tab-btn.outline { background: #fff; color: #0A7C6E; border: 1px solid #0A7C6E; }
        .induction-question {
          background: #f8fafc; border: 1px solid #eef1f1; border-radius: 12px; padding: 16px; margin-bottom: 14px;
        }
        .induction-option {
          display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px;
          border: 1px solid #e2e8f0; margin-bottom: 8px; cursor: pointer; background: #fff;
        }
        .induction-option.selected { border-color: #0A7C6E; background: #f0fdf9; }
        .induction-result {
          text-align: center; padding: 2.5rem 1.5rem; background: #fff; border-radius: 16px;
          border: 1px solid #eef1f1;
        }
      `}</style>

      {!activeInduction && (
        <>
          <h5 className="fw-bold mb-1">Induction</h5>
          <p className="text-muted small mb-4" style={{ textTransform: "none" }}>
            Complete the inductions assigned to you. You need 80 marks out of 100 to pass.
          </p>

          {inductions.length === 0 ? (
            <div className="text-center text-muted py-5" style={{ textTransform: "none" }}>
              <i className="fa fa-clipboard-list d-block mb-2" style={{ fontSize: "28px", opacity: 0.4 }}></i>
              No inductions have been assigned to you yet.
            </div>
          ) : (
            <div className="induction-tab-list">
              {inductions.map((induction) => {
                const meta = STATUS_META[induction.status] || STATUS_META.pending;
                return (
                  <div key={induction.id} className="induction-tab-card">
                    <div className="fw-bold" style={{ fontSize: "15px" }}>{induction.title}</div>
                    <div className="d-inline-block">
                      <span className="induction-tab-badge" style={{ background: meta.bg, color: meta.color }}>
                        <span className="dot"></span>
                        {meta.label}
                        {induction.status !== "pending" && ` (${induction.marks}/100)`}
                      </span>
                    </div>
                    <div className="d-flex gap-2 mt-2 flex-wrap">
                      {induction.status !== "passed" && (
                        <button
                          type="button"
                          className="induction-tab-btn"
                          onClick={() => openInduction(induction)}
                        >
                          {induction.status === "failed" ? "Try Again" : "Start Induction"}
                        </button>
                      )}
                      {induction.status === "passed" && induction.certificate_path && (
                        <a
                          href={induction.certificate_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="induction-tab-btn"
                        >
                          Certificate
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeInduction && !result && (
        <>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="fw-bold m-0">{activeInduction.title}</h5>
            <button type="button" className="induction-tab-btn outline" onClick={closeInduction}>
              <i className="fa fa-arrow-left me-1"></i> Back
            </button>
          </div>

          <div className="induction-warning-note mb-4">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>
              Please read every question carefully — and open any attached document before
              answering — then fill out the form accurately. You need 80/100 marks to pass.
            </span>
          </div>

          {questions.map((q, index) => (
            <div key={index} className="induction-question">
              <div className="fw-semibold mb-2">
                {index + 1}. {q.question}
              </div>

              {q.file && (
                <a
                  href={resolveQuestionFileUrl(q.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="induction-file-btn mb-3"
                >
                  <i className="fa-solid fa-file-pdf"></i> View Attachment
                </a>
              )}

              {q.type === "MCQs" && (
                <>
                  {["a", "b", "c", "d"].map((letter, optIdx) => {
                    const optionValue = q[`option${letter}`];
                    if (!optionValue) return null;
                    const choiceValue = String(optIdx + 1);
                    const selected = answers[index] === choiceValue;
                    return (
                      <div
                        key={letter}
                        className={`induction-option ${selected ? "selected" : ""}`}
                        onClick={() => handleAnswerChange(index, choiceValue)}
                      >
                        <input type="radio" checked={selected} readOnly />
                        <span>{optionValue}</span>
                      </div>
                    );
                  })}
                </>
              )}

              {q.type === "True/False" && (
                <>
                  {[{ label: "True", value: "1" }, { label: "False", value: "2" }].map((opt) => {
                    const selected = answers[index] === opt.value;
                    return (
                      <div
                        key={opt.value}
                        className={`induction-option ${selected ? "selected" : ""}`}
                        onClick={() => handleAnswerChange(index, opt.value)}
                      >
                        <input type="radio" checked={selected} readOnly />
                        <span>{opt.label}</span>
                      </div>
                    );
                  })}
                </>
              )}

              {q.type === "Short Question" && (
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Type your answer..."
                  value={answers[index] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  style={{ textTransform: "none" }}
                ></textarea>
              )}
            </div>
          ))}

          <button
            type="button"
            className="induction-tab-btn"
            onClick={handleSubmitQuiz}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Induction"}
          </button>
        </>
      )}

      {activeInduction && result && (
        <div className="induction-result">
          <i
            className={`fa-solid ${result.status === "passed" ? "fa-circle-check" : "fa-circle-xmark"} d-block mb-3`}
            style={{ fontSize: "48px", color: result.status === "passed" ? "#16a34a" : "#dc2626" }}
          ></i>
          <h4 className="fw-bold mb-1">{result.marks} / 100</h4>
          <p className="fw-semibold mb-3" style={{ color: result.status === "passed" ? "#16a34a" : "#dc2626" }}>
            {result.status === "passed" ? "You passed!" : "You need 80 to pass — try again."}
          </p>
          <div className="d-flex gap-2 justify-content-center">
            {result.status !== "passed" && (
              <button
                type="button"
                className="induction-tab-btn"
                onClick={() => {
                  setAnswers({});
                  setResult(null);
                }}
              >
                Try Again
              </button>
            )}
            <button type="button" className="induction-tab-btn outline" onClick={closeInduction}>
              Back to Inductions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}