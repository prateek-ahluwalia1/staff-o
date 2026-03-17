import React from "react";

const InvoiceLineItems = ({ lineItems }) => {
  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <h3 className="invoice-block-title mb-0">Invoice Items</h3>
      </div>

      <div className="table-responsive">
        <table className="table-modern">
          <thead>
            <tr>
              <th>Item</th>
              <th width="100">Hours</th>
              <th width="140">Price</th>
              <th width="160">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
                  Search to load invoice items.
                </td>
              </tr>
            ) : (
              lineItems.map((item, idx) => {
                const lineTotal =
                  (Number(item.qty) || 0) * (Number(item.rate) || 0);
                return (
                  <tr key={`invoice-item-${idx}`}>
                    <td>
                      <input
                        className="form-control"
                        placeholder="Service description"
                        value={item.description}
                        disabled
                        readOnly
                      />
                    </td>
                    <td>
                      <input
                        className="form-control"
                        type="number"
                        min="1"
                        value={item.qty}
                        disabled
                        readOnly
                      />
                    </td>
                    <td>
                      <input
                        className="form-control"
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.rate}
                        disabled
                        readOnly
                      />
                    </td>
                    <td className="fw-semibold">${lineTotal.toFixed(2)}</td>
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
