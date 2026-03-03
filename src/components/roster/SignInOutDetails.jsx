import React from "react";

export default function SignInOutDetails() {
  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <h6 className="fw-bold mb-1">SignIn Date</h6>
          <p className="text-muted">02-03-2026</p>

          <h6 className="fw-bold mb-1 mt-3">SignIn Time</h6>
          <p className="text-muted">09:56</p>

          <h6 className="fw-bold mb-1 mt-3">SignIn Notes</h6>
          <p className="text-muted">N/A</p>

          <h6 className="fw-bold mb-2 mt-3">Sign In Picture</h6>
          <div
            className="bg-light rounded d-flex align-items-center justify-content-center"
            style={{ width: "100%", height: "200px", border: "1px solid #ddd" }}
          >
            <span className="text-muted">Image Here</span>
          </div>

          <h6 className="fw-bold mb-2 mt-3">SignIn Location</h6>
          <button className="btn btn-primary btn-sm">📍 Show Map</button>
        </div>

        <div className="col-md-6 mb-3">
          <h6 className="fw-bold mb-1">SignOut Date</h6>
          <p className="text-muted">02-03-2026</p>

          <h6 className="fw-bold mb-1 mt-3">SignOut Time</h6>
          <p className="text-muted">22:30</p>

          <h6 className="fw-bold mb-1 mt-3">SignOut Notes</h6>
          <p className="text-muted">N/A</p>

          <h6 className="fw-bold mb-2 mt-3">Sign Out Picture</h6>
          <div
            className="bg-light rounded d-flex align-items-center justify-content-center"
            style={{ width: "100%", height: "200px", border: "1px solid #ddd" }}
          >
            <span className="text-muted fw-bold">Broken Image ☹</span>
          </div>

          <h6 className="fw-bold mb-2 mt-3">SignOut Location</h6>
          <button className="btn btn-primary btn-sm">📍 Show Map</button>
        </div>
      </div>
    </div>
  );
}
