import React, { memo } from "react";

const Copyright = memo(function Copyright() {
  return (
    <div className="footer-bottom">
      <div className="container">
        <div className="footer-bottom-content">
          <div className="footer-copy">
            Copyright &copy; {new Date().getFullYear()} Staffoo. All rights
            reserved. Design by: <a href="/">STAFFOO</a>
          </div>

          <div className="footer-payments">
            <img src="/assets/images/payment-icons.png" alt="Payment methods" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Copyright;
