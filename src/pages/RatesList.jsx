import React from "react";
import { useLocation } from "react-router-dom";

const sampleRows = [
  { id: 1, name: "hyjhbjk", level: 1, state: "Victoria" },
  { id: 2, name: "V1 Rates", level: 2, state: "Victoria" },
];

const RatesList = () => {
  const { pathname } = useLocation();
  const isCharge = pathname.includes("charge");
  const title = isCharge ? "Charge Rates Lists" : "Pay Rates Lists";
  const addButton = isCharge ? "Add Charge Rate" : "Add Pay Rate";

  return (
    <div className="dashboard-main" style={{ padding: 24 }}>
      <h3 style={{ marginBottom: 20 }}>{title}</h3>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ flex: 1 }} />
          <button className="btn btn-success">{addButton}</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Charged Rate</th>
                <th>Job Level</th>
                <th>State</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                  </td>
                  <td>{r.level}</td>
                  <td>{r.state}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      style={{ marginRight: 8 }}
                    >
                      <i className="fa fa-edit" />
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      <i className="fa fa-archive" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RatesList;
