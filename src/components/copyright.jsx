import React, { memo } from "react";

const Copyright = memo(function Copyright() {
  return (
    <div className="footer-bottom">
      <div className="container">
        <div className="footer-bottom-content">
          <div className="footer-copy">
            Copyright &copy; {new Date().getFullYear()} Jobs Portal. All rights
            reserved. Design by:{" "}
            <a
              href="https://www.piratestechnologies.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pirates Technologies
            </a>
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
