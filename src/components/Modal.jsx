import React from "react";

/**
 * Premium Modal Component
 *
 * A polished, dashboard-consistent modal with:
 * - Dark navy/teal gradient header
 * - Soft glass-card body
 * - Elegant close button
 * - Smooth animations (fade + scale)
 * - Responsive & scrollable
 * - Optional `title` prop displayed in the header
 * - Optional `wide` prop for larger modals
 */
export default function Modal({ open, onClose, children, title, wide = false }) {
  if (!open) return null;

  return (
    <div
      className="modal-premium-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`modal-premium-card ${wide ? "modal-premium-wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-premium-header">
          {title && (
            <h3 className="modal-premium-title">{title}</h3>
          )}
          <button
            className="modal-premium-close-btn"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="modal-premium-body">{children}</div>
      </div>

      <style>{`
        :root {
          --modal-navy-950: #0a1930;
          --modal-navy-900: #0e2340;
          --modal-teal: #0A7C6E;
          --modal-teal-dark: #075e53;
          --modal-line: #e2e8f0;
          --modal-surface: #ffffff;
          --modal-text: #1e293b;
          --modal-muted: #64748b;
        }

        /* Overlay */
        .modal-premium-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 20, 35, 0.62);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1.5rem;
          animation: modalFadeIn 0.25s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Card */
        .modal-premium-card {
          background: var(--modal-surface);
          border-radius: 22px;
          box-shadow: 0 30px 60px -18px rgba(10, 25, 48, 0.5);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: modalPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-premium-wide {
          max-width: 900px;
        }

        @keyframes modalPopIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Header */
        .modal-premium-header {
          position: relative;
          background: linear-gradient(120deg, var(--modal-navy-950), var(--modal-navy-900) 70%, #10345a);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          overflow: hidden;
        }
        .modal-premium-header::after {
          content: "";
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(10,124,110,0.5), transparent 70%);
          pointer-events: none;
        }

        /* Title */
        .modal-premium-title {
          margin: 0;
          font-size: 19px;
          font-weight: 700;
          letter-spacing: 0.2px;
          color: #fff;
          position: relative;
          z-index: 1;
        }

        /* Close button */
        .modal-premium-close-btn {
          position: relative;
          z-index: 2;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.08);
          color: #fff;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          flex-shrink: 0;
          margin-left: auto;
        }
        .modal-premium-close-btn:hover {
          background: rgba(255,255,255,0.18);
          transform: rotate(90deg);
        }
        .modal-premium-close-btn:focus-visible {
          outline: 2px solid #6ee7d8;
          outline-offset: 2px;
        }

        /* Body */
        .modal-premium-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
          color: var(--modal-text);
        }

        /* Responsive adjustments */
        @media (max-width: 576px) {
          .modal-premium-overlay {
            padding: 0.75rem;
          }
          .modal-premium-body {
            padding: 16px;
          }
          .modal-premium-card {
            border-radius: 18px;
          }
          .modal-premium-title {
            font-size: 17px;
          }
        }
      `}</style>
    </div>
  );
}