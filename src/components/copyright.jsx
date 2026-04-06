import React, { memo } from "react";
import paymenticons from "../assets/images/payment-icons.png";

const Copyright = memo(function Copyright() {
  return (
    <div className="footer-bottom">
      <div className="container">
        <div className="footer-bottom-content">
          <div className="footer-copy" style={{ marginLeft: "2rem" }}>
            Copyright &copy; {new Date().getFullYear()} Staffoo. All rights
            reserved. Design by: <a href="/">STAFFOO</a>
          </div>

          <div className="footer-payments">
            <img src={paymenticons} alt="Payment methods" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Copyright;
