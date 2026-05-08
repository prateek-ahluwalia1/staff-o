import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import leaveimg from "../assets/images/leave.png";
import publicHolidayImg from "../assets/images/public-holiday.png";
const WFMTools = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";

  return (
    <div className="dashboard-main dashboard-tools-page">
      <div className="dashboard-tools-header">
        <h2 className="dashboard-tools-title">WFM Tools</h2>
        <p className="dashboard-tools-subtitle">
          Leave tools are managed here. Calls now start directly from chat.
        </p>
      </div>

      <div className="row g-4 dashboard-tools-grid">
        {isAdmin && (
          <>
            <div className="col-12 col-md-6 col-lg-3">
              <Card
                title="Leave Management"
                description="Used to display the detailed overview of staff leave requests."
                accent="linear-gradient(135deg,#27ae60,#16a085)"
                image={leaveimg}
                type="leave"
                onClick={() => navigate("/leave")}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <Card
                title="Public Holidays"
                description="Used to display the detailed overview of public holidays."
                accent="linear-gradient(135deg,#27ae60,#16a085)"
                image={publicHolidayImg}
                type="holidays"
                onClick={() => navigate("/holidays")}
              />
            </div>
          </>
        )}

        {!isAdmin && (
          <div className="col-12">
            <div className="dashboard-tools-empty-state">
              <i className="fa fa-info-circle"></i>
              Leave management is currently available for admin users only.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WFMTools;
