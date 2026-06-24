import React from "react";

const InvoiceLineItems = ({ lineItems }) => {
  return (
    <div className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="invoice-block-title mb-0 border-bottom pb-2 w-100">Invoice Items</h3>
      </div>

      <div className="table-responsive shadow-sm rounded border">
        <table className="table table-hover table-modern invoice-line-items-table mb-0" style={{ minWidth: "600px" }}>
          <colgroup>
            <col style={{ width: "50%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead className="table-light">
            <tr>
              <th className="p-3">Item</th>
              <th className="text-center p-3">Hours</th>
              <th className="text-end p-3">Price</th>
              <th className="text-end p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-5"

                  style={{ textTransform: "none" }}>
                  <i className="fa-solid fa-inbox fa-2x mb-3 d-block opacity-50"></i>
                  Search to load invoice items.
                </td>
              </tr>
            ) : (
              lineItems.map((item, idx) => {
                const lineTotal =
                  (Number(item.qty) || 0) * (Number(item.rate) || 0);
                return (
                  <tr key={`invoice-item-${idx}`}>
                    <td className="p-2">
                      <input
                        className="form-control bg-white"
                        placeholder="Service description"
                        value={item.description}
                        disabled
                        readOnly
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="form-control text-center bg-white"
                        type="number"
                        min="1"
                        value={item.qty}
                        disabled
                        readOnly
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="form-control text-end bg-white"
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.rate}
                        disabled
                        readOnly
                      />
                    </td>
                    <td className="fw-semibold text-end p-3 align-middle text-primary">
                      ${lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceLineItems;