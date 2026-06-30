import React from 'react';
import "../../styles/staffoo.css";

import mainAppScreen from '../../assets/images/app-screen2.png';
import secondaryAppScreen from '../../assets/images/app-screen1.png';

function AppSection() {
  return (
    <section className="app-sec" aria-labelledby="app-section-title">
      <div className="app-banner">

        {/* Content Column */}
        <div className="app-left">
          <span className="label">Step Forward Now</span>
          <h2 id="app-section-title">Staffoo<br />App</h2>
          <p
            style={{ textTransform: "none" }}
          >
            Connecting security staff with trusted jobs aross Australia.
            Free to download. Three powerful user modes designed for professionals.
          </p>

          <div className="store-row">
            <a
              href="https://apps.apple.com/..."
              className="store-btn store-btn-hover"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Staffoo on the Apple App Store"
            >
              <i className="fab fa-apple store-btn-icon" aria-hidden="true"></i>
              <div className="store-btn-text">
                <span className="store-sub">Download from</span>
                <span className="store-name">App Store</span>
              </div>
            </a>

            <a
              href="https://play.google.com/store/..."
              className="store-btn store-btn-hover"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get Staffoo on Google Play"
            >
              <i className="fab fa-google-play store-btn-icon" aria-hidden="true"></i>
              <div className="store-btn-text">
                <span className="store-sub">Get it on</span>
                <span className="store-name">Google Play</span>
              </div>
            </a>
          </div>
        </div>

        <div className="phones-wrap" aria-hidden="true">
          {/* Secondary Phone Layout (Left Background) */}
          <div className="phone-frame phone-sec-frame float-slow">
            <img
              src={secondaryAppScreen}
              alt="Staffoo App Screen 2"
              className="phone-img"
            />
          </div>

          {/* Main Phone Layout (Right Foreground) */}
          <div className="phone-frame phone-main-frame float-fast">
            <img
              src={mainAppScreen}
              alt="Staffoo App Screen 1"
              className="phone-img"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

export default AppSection;