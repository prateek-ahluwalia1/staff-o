import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card } from "../components/Card";
import leaveimg from "../assets/images/leave.png";
import callimg from "../assets/images/call.png";
const WFMTools = () => {
  const navigate = useNavigate();
  const { userdata } = useSelector((state) => state.auth);
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isAdmin = userType === "admin";

  return (
    <div className="dashboard-main" style={{ padding: 32 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontWeight: 700 }}>WFM Tools</h2>
        <p style={{ color: "#6b7280", marginTop: 6 }}>
          Choose a category to manage your WFM tools.
        </p>
      </div>

      {/* Put both cards inside the SAME row container */}
      <div className="row g-4">
        {/* Card 1 */}
        {isAdmin && (
          <div className="col-12 col-md-6 col-lg-4">
            <Card
              title="Leave Management"
              description="Used to display the detailed overview of staff leave requests."
              accent="linear-gradient(135deg,#27ae60,#16a085)"
              image={leaveimg}
              type="leave"
              onClick={() => navigate("/leave")}
            />
          </div>
        )}

        {/* Card 2 */}
        <div className="col-12 col-md-6 col-lg-4">
          <Card
            title="Call Management"
            description="Used to initiate and manage calls with staff members."
            accent="linear-gradient(135deg,#3498db,#2980b9)"
            image={callimg}
            type="call"
            onClick={() => navigate("/welfare-call")}
          />
        </div>
      </div>
    </div>
  );
};

export default WFMTools;
