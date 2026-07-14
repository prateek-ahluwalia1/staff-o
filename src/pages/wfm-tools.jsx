import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import leaveimg from "../assets/images/leave.png";
import publicHolidayImg from "../assets/images/public-holiday.png";
import staffoostaffimg from "../assets/images/capital-security-staff.png";
const WFMTools = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";

  return (
    <div className="dashboard-main dashboard-tools-page">
      <div className="dashboard-tools-header">
        <h2 className="dashboard-tools-title">WFM Tools</h2>
        <p className="dashboard-tools-subtitle"
          style={{ textTransform: "none" }}
        >
          Leave tools and registered staff are managed here.
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
            <div className="col-12 col-md-6 col-lg-3">
              <Card
                title="Staffoo Staff"
                description="Used to display the detailed overview of staff members."
                accent="linear-gradient(135deg,#27ae60,#16a085)"
                image={staffoostaffimg}
                type="staff"
                onClick={() => navigate("/staff-management")}
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
