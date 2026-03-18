import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import reportimg from "../assets/images/reports.png";

const Reports = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;

  if (userType !== "admin") {
    return (
      <div className="dashboard-main" style={{ padding: 32 }}>
        <div className="alert alert-danger">
          <i className="fa fa-lock me-2"></i>
          You do not have permission to access reports management.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main" style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontWeight: 700 }}>Reports Management</h2>
        <p style={{ color: "#6b7280", marginTop: 6 }}>
          Choose a category to manage your reports.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-4">
          <Card
            title="Charge Rates"
            description="The amount which is charged from the customer."
            accent="linear-gradient(135deg,#27ae60,#16a085)"
            image={reportimg}
            type="charge"
            onClick={() => navigate("/reports")}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
