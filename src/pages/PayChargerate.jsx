import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import payrateimg from "../assets/images/pay.png";
import chargerateimg from "../assets/images/charge.png";
import invoiceimg from "../assets/images/invoice.png";
import payslipimg from "../assets/images/pay-slip.png";

const PayChargerate = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;

  return (
    <div className="dashboard-main dashboard-tools-page">
      <div className="dashboard-tools-header">
        <h2 className="dashboard-tools-title">Rates Management</h2>
        <p className="dashboard-tools-subtitle"
          style={{ textTransform: "none" }}
        >
          Choose a category to manage your rates.
        </p>
      </div>

      <div className="row g-4 dashboard-tools-grid">
        {/* Only show Charge Rates and Pay Rates to Admin */}
        {userType === "admin" && (
          <>
            <div className="col-12 col-md-6 col-lg-3">
              <Card
                title="Charge Rates"
                description="Amount charged from customers."
                accent="linear-gradient(135deg,#27ae60,#16a085)"
                image={chargerateimg}
                type="charge"
                onClick={() =>
                  navigate("/rates/charge", { state: { rateType: "charge" } })
                }
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <Card
                title="Pay Rates"
                description="Amount paid to the staff."
                accent="linear-gradient(135deg,#1abc9c,#2ecc71)"
                image={payrateimg}
                type="pay"
                onClick={() =>
                  navigate("/rates/pay", { state: { rateType: "pay" } })
                }
              />
            </div>
          </>
        )}

        {/* Visible to everyone */}
        <div className="col-12 col-md-6 col-lg-3">
          <Card
            title="Invoice"
            description="It is used to send an invoice to the users"
            accent="linear-gradient(135deg,#1abc9c,#2ecc71)"
            image={invoiceimg}
            type="invoice"
            onClick={() => navigate("/accounts/invoice")}
          />
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <Card
            title="Pay Slip"
            description="It is used to generate a pay slip"
            accent="linear-gradient(135deg,#1abc9c,#2ecc71)"
            image={payslipimg}
            type="pay-slip"
            onClick={() => navigate("/pay-slip")}
          />
        </div>
      </div>
    </div>
  );
};

export default PayChargerate;