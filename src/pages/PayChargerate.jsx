import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import payrateimg from "../assets/images/pay.png";
import chargerateimg from "../assets/images/charge.png";

const PayChargerate = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;

  if (userType !== "admin") {
    return (
      <div className="dashboard-main" style={{ padding: 32 }}>
        <div className="alert alert-danger">
          <i className="fa fa-lock me-2"></i>
          You do not have permission to access rates management.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-main" style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontWeight: 700 }}>Rates Management</h2>
        <p style={{ color: "#6b7280", marginTop: 6 }}>
          Choose a category to manage your rates.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-4">
          <Card
            title="Charge Rates"
            description="Manage what customers are charged per location."
            accent="linear-gradient(135deg,#27ae60,#16a085)"
            image={chargerateimg}
            type="charge"
            onClick={() =>
              navigate("/rates/charge", { state: { rateType: "charge" } })
            }
          />
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <Card
            title="Pay Rates"
            description="Configure how staff members are paid."
            accent="linear-gradient(135deg,#1abc9c,#2ecc71)"
            image={payrateimg}
            type="pay"
            onClick={() =>
              navigate("/rates/pay", { state: { rateType: "pay" } })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default PayChargerate;
