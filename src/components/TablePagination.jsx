import React from "react";

/**
 * Modern, consistent pagination bar for Staff-O tables.
 *
 * @param {number} currentPage - Active page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {number} totalItems - Total records across all pages
 * @param {number} perPage - Rows per page (default: 20)
 * @param {Array<number>} perPageOptions - Available items per page (default: [20, 50, 100, 200])
 * @param {Function} onPageChange - Callback when a page is selected (newPage: number)
 * @param {Function} onPerPageChange - Callback when perPage changes (newPerPage: number)
 * @param {boolean} showRowsPerPage - Whether to show rows per page dropdown (default: false)
 * @param {boolean} showRecordCount - Whether to show record count text (default: false)
 * @param {boolean} loading - Optional loading indicator state
 */
export default function TablePagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  perPage = 20,
  perPageOptions = [20, 50, 100, 200],
  onPageChange,
  onPerPageChange,
  showRowsPerPage = false,
  showRecordCount = false,
  loading = false,
}) {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const safeCurrentPage = Math.min(Math.max(1, Number(currentPage) || 1), safeTotalPages);
  const hasTotal = typeof totalItems === "number" && totalItems > 0;

  const startRecord = hasTotal ? (safeCurrentPage - 1) * perPage + 1 : (safeCurrentPage - 1) * perPage + 1;
  const endRecord = hasTotal ? Math.min(safeCurrentPage * perPage, totalItems) : safeCurrentPage * perPage;

  // Generate numbered pages with smart ellipsis
  const getPageNumbers = () => {
    const delta = 1;
    const pages = [];

    for (let i = 1; i <= safeTotalPages; i++) {
      if (
        i === 1 ||
        i === safeTotalPages ||
        (i >= safeCurrentPage - delta && i <= safeCurrentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === safeCurrentPage - delta - 1 && i > 1) ||
        (i === safeCurrentPage + delta + 1 && i < safeTotalPages)
      ) {
        pages.push("...");
      }
    }

    return pages.filter((item, index) => {
      if (item === "..." && pages[index - 1] === "...") return false;
      return true;
    });
  };

  const pageNumbers = getPageNumbers();
  const hasLeftContent = showRowsPerPage || showRecordCount;

  return (
    <div
      className={`table-pagination-container d-flex ${
        hasLeftContent ? "flex-column flex-md-row justify-content-between" : "justify-content-center"
      } align-items-center gap-3 py-3 px-4 border-top`}
      style={{
        background: "#ffffff",
        borderTop: "1px solid #f1f5f9",
      }}
    >
      <style>{`
        .table-pagination-container {
          background: #ffffff;
        }
        .btn-pagination-nav {
          height: 38px;
          padding: 0 16px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }
        .btn-pagination-nav:hover:not(:disabled) {
          background: #f0fdfa;
          border-color: #0A7C6E;
          color: #0A7C6E;
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(10, 124, 110, 0.12);
        }
        .btn-pagination-nav:disabled {
          background: #f8fafc;
          border-color: #f1f5f9;
          color: #94a3b8;
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }
        .btn-pagination-page {
          min-width: 38px;
          height: 38px;
          padding: 0 10px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }
        .btn-pagination-page:hover:not(:disabled):not(.active) {
          background: #f0fdfa;
          border-color: #0A7C6E;
          color: #0A7C6E;
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(10, 124, 110, 0.1);
        }
        .btn-pagination-page.active {
          border: none;
          background: linear-gradient(135deg, #0A7C6E 0%, #075e53 100%);
          color: #ffffff;
          font-weight: 700;
          cursor: default;
          box-shadow: 0 4px 14px rgba(10, 124, 110, 0.38);
          transform: translateY(-1px);
        }
        .pagination-select {
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-size: 0.825rem;
          font-weight: 600;
          color: #334155;
          background-color: #f8fafc;
          padding: 6px 30px 6px 12px;
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .pagination-select:focus {
          border-color: #0A7C6E;
          box-shadow: 0 0 0 3px rgba(10, 124, 110, 0.15);
          outline: none;
        }
      `}</style>

      {/* Optional Left side (when requested) */}
      {hasLeftContent && (
        <div className="d-flex align-items-center gap-3 flex-wrap text-muted small">
          {showRecordCount && (
            <div>
              {hasTotal ? (
                <>
                  Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of{" "}
                  <strong>{totalItems}</strong> records
                </>
              ) : (
                <>
                  Showing Page <strong>{safeCurrentPage}</strong> of <strong>{safeTotalPages}</strong>
                </>
              )}
            </div>
          )}

          {showRowsPerPage && (
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary fw-medium">Rows per page:</span>
              <select
                className="form-select form-select-sm pagination-select"
                value={perPage}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onPerPageChange?.(val);
                }}
                disabled={loading}
              >
                {perPageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Page navigation: Prev button, Numbers, Next button */}
      <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center">
        {/* Previous Button */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange?.(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1 || loading}
          title="Previous Page"
        >
          <i className="fa-solid fa-chevron-left" style={{ fontSize: "0.75rem" }}></i>
          <span>Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        {pageNumbers.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-muted fw-bold"
                style={{ fontSize: "0.85rem", userSelect: "none" }}
              >
                ...
              </span>
            );
          }

          const isActive = p === safeCurrentPage;
          return (
            <button
              key={`page-${p}`}
              type="button"
              className={`btn-pagination-page ${isActive ? "active" : ""}`}
              onClick={() => onPageChange?.(p)}
              disabled={loading || isActive}
            >
              {p}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          className="btn-pagination-nav"
          onClick={() => onPageChange?.(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= safeTotalPages || loading}
          title="Next Page"
        >
          <span>Next</span>
          <i className="fa-solid fa-chevron-right" style={{ fontSize: "0.75rem" }}></i>
        </button>
      </div>
    </div>
  );
}
