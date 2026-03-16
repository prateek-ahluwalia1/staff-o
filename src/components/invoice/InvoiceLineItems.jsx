import React from "react";

const InvoiceLineItems = ({
  lineItems,
  onUpdateLineItem,
  onAddLineItem,
  onRemoveLineItem,
}) => {
  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <h3 className="invoice-block-title mb-0">Invoice Items</h3>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={onAddLineItem}
        >
          <i className="fa-solid fa-plus me-2"></i> Add Item
        </button>
      </div>

      <div className="table-responsive">
        <table className="table-modern">
          <thead>
            <tr>
              <th>Description</th>
              <th width="100">Qty</th>
              <th width="140">Rate</th>
              <th width="160">Line Total</th>
              <th width="64"></th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => {
              const lineTotal =
                (Number(item.qty) || 0) * (Number(item.rate) || 0);
              return (
                <tr key={`invoice-item-${idx}`}>
                  <td>
                    <input
                      className="form-control"
                      placeholder="Service description"
                      value={item.description}
                      onChange={(e) =>
                        onUpdateLineItem(idx, "description", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        onUpdateLineItem(idx, "qty", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.rate}
                      onChange={(e) =>
                        onUpdateLineItem(idx, "rate", e.target.value)
                      }
                    />
                  </td>
                  <td className="fw-semibold">${lineTotal.toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-light btn-sm"
                      onClick={() => onRemoveLineItem(idx)}
                      title="Remove item"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceLineItems;
