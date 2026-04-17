import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import reportimg from "../assets/images/reports.png";
import jobtrackingimg from "../assets/images/jobtracker.png";

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
        <p className="dashboard-tools-subtitle">
          Choose a category to manage your reports.
        </p>
      </div>

      <div className="row g-4 dashboard-tools-grid">
        <div className="col-12 col-md-6 col-lg-4">
          <Card
            title="Time Sheet"
            description="Used to display the detailed overview of staff work hours."
            accent="linear-gradient(135deg,#27ae60,#16a085)"
            image={reportimg}
            type="timesheet"
            onClick={() => navigate("/timesheet")}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <Card
            title="Job Tracker"
            description="Used to display the detailed overview of staff job progress."
            accent="linear-gradient(135deg,#27ae60,#16a085)"
            image={jobtrackingimg}
            type="jobtracker"
            onClick={() => navigate("/job-tracker")}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
