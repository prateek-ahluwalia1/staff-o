import React, { memo } from "react";
import stripeLogo from "../assets/images/stripe.png";
import masterLogo from "../assets/images/master.png";
import visaLogo from "../assets/images/visa.png";

const Copyright = memo(function Copyright() {
  const paymentLogoStyle = {
    width: "100px",
    height: "100px",
    objectFit: "contain",
    display: "block",
  };

  return (
    <div className="footer-bottom">
      <div className="container">
        <div className="footer-bottom-content">
          <div className="footer-copy" style={{ marginLeft: "2rem" }}>
            Copyright &copy; {new Date().getFullYear()} Staffoo. All rights
            reserved. Design by: <a href="/">STAFFOO</a>
          </div>

          <div className="footer-payments">
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.1rem" }}
              aria-label="Payment methods"
            >
              <img src={stripeLogo} alt="Stripe" style={paymentLogoStyle} />
              <img src={visaLogo} alt="Visa" style={paymentLogoStyle} />
              <img src={masterLogo} alt="Mastercard" style={paymentLogoStyle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Copyright;
