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

  return (
    <div className="dashboard-main" style={{ padding: 24 }}>
      <h3 style={{ marginBottom: 12 }}>Rates</h3>
      <p className="text-muted" style={{ marginBottom: 20 }}>
        Choose a rate type to view and manage location-specific rates.
      </p>

      <div className="row" style={{ gap: 16 }}>
        {userType !== "customer" && (
          <div className="col-12 col-md-4">
            <Card
              title="Charge Rates"
              description="The amount charged from customers (location-based)."
              accent="linear-gradient(180deg,#27ae60 0%, #16a085 100%)"
              image={chargerateimg}
              type="charge"
              onClick={() =>
                navigate("/rates/charge", { state: { rateType: "charge" } })
              }
            />
          </div>
        )}
        <div className="col-12 col-md-4">
          <Card
            title="Pay Rates"
            description="The amount paid to staff (location-based)."
            accent="linear-gradient(180deg,#1abc9c 0%, #2ecc71 100%)"
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
