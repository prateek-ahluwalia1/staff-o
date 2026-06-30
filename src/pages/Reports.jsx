import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import reportimg from "../assets/images/reports.png";
import jobtrackingimg from "../assets/images/jobtracker.png";
import visaimg from "../assets/images/visa-check.png";
import paysheetimg from "../assets/images/pay-sheet.png";

const Reports = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;

  if (userType !== "admin") {
    return (
      <div className="dashboard-main dashboard-tools-page">
        <div className="dashboard-tools-access-state">
          <i className="fa fa-lock"></i>
          You do not have permission to access reports management.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main dashboard-tools-page">
      <div className="dashboard-tools-header">
        <h2 className="dashboard-tools-title">Reports Management</h2>
        <p className="dashboard-tools-subtitle"
          style={{ textTransform: "none" }}
        >
          Choose a category to manage your reports.
        </p>
      </div>

      <div className="row g-4 dashboard-tools-grid">
        <div className="col-12 col-md-6 col-lg-3">
          <Card
            title="Time Sheet"
            description="Used to display the detailed overview of staff work hours."
            accent="linear-gradient(135deg,#27ae60,#16a085)"
            image={reportimg}
            type="timesheet"
            onClick={() => navigate("/timesheet")}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card
            title="Job Tracker"
            description="Used to display the detailed overview of staff job progress."
            accent="linear-gradient(135deg,#27ae60,#16a085)"
            image={jobtrackingimg}
            type="jobtracker"
            onClick={() => navigate("/job-tracker")}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card
            title="Visa Check"
            description="Run visa verification checks and view visa check results."
            accent="linear-gradient(135deg,#1d4ed8,#0ea5e9)"
            image={visaimg}
            type="visacheck"
            onClick={() => navigate("/visa-management")}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card
            title="Pay Sheet"
            description="View and manage staff pay sheet information."
            accent="linear-gradient(135deg,#1d4ed8,#0ea5e9)"
            image={paysheetimg}
            type="paysheet"
            onClick={() => navigate("/pay-sheet")}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
