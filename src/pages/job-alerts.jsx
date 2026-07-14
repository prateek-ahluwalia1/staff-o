import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link } from 'react-router-dom'

export default function JobAlerts() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: "Design leadership · Remote US",
      description: "Keywords: “Head of Design, Design Manager” · Salary 150k+",
      active: true,
    },
    {
      id: 2,
      title: "Fintech product designer · Europe",
      description: "Berlin, Amsterdam, Remote EU · Weekly digest",
      active: true,
    },
    {
      id: 3,
      title: "Short contracts · UX research",
      description: "Contract length < 6 months · Rate 600+/day",
      active: false,
    },
  ]);

  const [newAlert, setNewAlert] = useState({
    roleKeywords: "",
    locations: "",
    jobType: "Full-time",
    frequency: "Daily",
    minSalary: "",
    delivery: "Email",
    notes: "",
  });

  const handleToggle = (id) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, active: !alert.active } : alert,
      ),
    );
  };

  const handleNewAlertChange = (e) => {
    const { id, value } = e.target;
    setNewAlert((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreateAlert = (e) => {
    e.preventDefault();
    toast.success("Alert saved successfully!");
    // Reset form
    setNewAlert({
      roleKeywords: "",
      locations: "",
      jobType: "Full-time",
      frequency: "Daily",
      minSalary: "",
      delivery: "Email",
      notes: "",
    });
  };

  return (
    <>
      <div className="dashboard-main">
        <div className="dashboard-page-header">
          <div>
            <h1>Job Alerts</h1>
            <p>
              {" "}
              Create targeted notifications by role, location, and compensation
              so you never miss a fit.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link to="/" className="btn btn-outline-primary">
              <i className="fa-solid fa-bell" aria-hidden="true"></i> Pause all
            </Link>
            <Link to="#newAlert" className="btn btn-primary-custom">
              <i className="fa-solid fa-plus" aria-hidden="true"></i> New alert
            </Link>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="list-card">
          <h3>Active Alerts</h3>
          <ul>
            {alerts.map((alert) => (
              <li key={alert.id}>
                <div>
                  <strong>{alert.title}</strong>
                  <p className="mb-0 text-muted">{alert.description}</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={alert.active}
                    onChange={() => handleToggle(alert.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* New Alert Form */}
        <div id="newAlert" className="settings-card mt-4">
          <div className="settings-card-header">
            <div>
              <p className=" text-muted small fw-semibold mb-1">
                Create Alert
              </p>
              <h3>Alert Builder</h3>
              <p>
                {" "}
                Combine filters to match the exact opportunities you want in
                your inbox.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateAlert}>
            <div className="settings-grid">
              <div>
                <label className="form-label" htmlFor="roleKeywords">
                  Role keywords
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="roleKeywords"
                  placeholder="Product Designer, UX Lead"
                  value={newAlert.roleKeywords}
                  onChange={handleNewAlertChange}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="locations">
                  Locations
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="locations"
                  placeholder="Remote · Seattle · Berlin"
                  value={newAlert.locations}
                  onChange={handleNewAlertChange}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="jobType">
                  Job type
                </label>
                <select
                  className="form-select"
                  id="jobType"
                  value={newAlert.jobType}
                  onChange={handleNewAlertChange}
                >
                  <option>Full-time</option>
                  <option>Contract</option>
                  <option>Freelance</option>
                  <option>Internship</option>
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="frequency">
                  Frequency
                </label>
                <select
                  className="form-select"
                  id="frequency"
                  value={newAlert.frequency}
                  onChange={handleNewAlertChange}
                >
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Instant</option>
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="minSalary">
                  Minimum salary
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="minSalary"
                  placeholder="USD 140,000"
                  value={newAlert.minSalary}
                  onChange={handleNewAlertChange}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="delivery">
                  Delivery
                </label>
                <select
                  className="form-select"
                  id="delivery"
                  value={newAlert.delivery}
                  onChange={handleNewAlertChange}
                >
                  <option>Email</option>
                  <option>In-app</option>
                  <option>SMS</option>
                </select>
              </div>

              <div className="grid-span-2">
                <label className="form-label" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  className="form-control"
                  id="notes"
                  value={newAlert.notes}
                  onChange={handleNewAlertChange}
                  placeholder="Add reminder about contract preferences, companies to exclude, etc."
                />
              </div>
            </div>

            <div className="form-actions mt-3">
              <button type="button" className="btn btn-outline-secondary">
                Reset
              </button>
              <button type="submit" className="btn btn-primary-custom">
                Save alert
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
