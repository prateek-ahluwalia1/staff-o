import React from "react";
import { useNavigate } from "react-router-dom";
import payrateimg from "../assets/images/pay.png";
import chargerateimg from "../assets/images/charge.png";

const Card = ({ title, description, onClick, accent, image }) => (
  <div
    className="card shadow-sm"
    style={{ borderRadius: 8, overflow: "hidden" }}
  >
    <div
      style={{
        height: 160,
        background: image ? "transparent" : accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {image ? (
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" rx="4" fill="rgba(255,255,255,0.06)" />
          <path
            d="M4 12h16"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path
            d="M7 8h3v8"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path
            d="M14 6h3v12"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
      )}
    </div>
    <div className="card-body">
      <h5 className="card-title">{title}</h5>
      <p className="card-text text-muted" style={{ fontSize: 14 }}>
        {description}
      </p>
      <div style={{ marginTop: 12 }}>
        <button className="btn btn-dark" onClick={onClick}>
          Access Now
        </button>
      </div>
    </div>
  </div>
);

const PayChargerate = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-main" style={{ padding: 24 }}>
      <h3 style={{ marginBottom: 20 }}>Rates</h3>

      <div className="row" style={{ gap: 16 }}>
        <div className="col-12 col-md-4">
          <Card
            title="Charge Rates"
            description="The amount charged from customer."
            accent="linear-gradient(180deg,#27ae60 0%, #16a085 100%)"
            image={chargerateimg}
            onClick={() => navigate("/rates/charge")}
          />
        </div>

        <div className="col-12 col-md-4">
          <Card
            title="Pay Rates"
            description="The amount which is paid to the staff."
            accent="linear-gradient(180deg,#1abc9c 0%, #2ecc71 100%)"
            image={payrateimg}
            onClick={() => navigate("/rates/pay")}
          />
        </div>
      </div>
    </div>
  );
};

export default PayChargerate;

// {"title":"hyjhbjk","customer_id":131,"position":"full_time","level":"1","state":"Victoria","ot_base_rate":461,"def_metro_mon_to_fri_day_rate":"0","def_reg_mon_to_fri_day_rate":"0","def_metro_mon_to_fri_night_rate":"0","def_reg_mon_to_fri_night_rate":"0","def_metro_sat_day_rate":"0","def_reg_sat_day_rate":"0","def_metro_sun_day_rate":"0","def_reg_sun_day_rate":"0","def_metro_pub_holi_day_rate":"0","def_reg_pub_holi_day_rate":"0","eba_metro_mon_to_fri_day_rate":"3","eba_reg_mon_to_fri_day_rate":15,"eba_metro_mon_to_fri_night_rate":5,"eba_reg_mon_to_fri_night_rate":32,"eba_metro_sat_day_rate":3,"eba_reg_sat_day_rate":2,"eba_metro_sun_day_rate":3,"eba_reg_sun_day_rate":3,"eba_metro_pub_holi_day_rate":1,"eba_reg_pub_holi_day_rate":51,"award_metro_mon_to_fri_day_rate":4,"award_reg_mon_to_fri_day_rate":5,"award_metro_mon_to_fri_night_rate":0,"award_reg_mon_to_fri_night_rate":1,"award_metro_sat_day_rate":1,"award_reg_sat_day_rate":1,"award_metro_sun_day_rate":1,"award_reg_sun_day_rate":1,"award_metro_pub_holi_day_rate":1,"award_reg_pub_holi_day_rate":6,"id":14,"admin_id":94}
