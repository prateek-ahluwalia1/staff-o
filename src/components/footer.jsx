import React, { memo } from "react";
import { Link } from "react-router-dom";
import Copyright from "../components/copyright";

const Footer = memo(function Footer() {
  return (
    <footer className="footer-modern">
      <div className="footer-main">
        <div className="container">
          <div className="row g-4">
            {/* Quick Links */}
            <div className="col-sm-6 col-lg-3">
              <h5 className="footer-title">Quick Links</h5>
              <ul className="footer-links">
                <li>
                  <Link to="/home">Home</Link>
                </li>
                <li>
                  <Link to="/contact-us">Contact Us</Link>
                </li>
                <li>
                  <Link to="/faqs">FAQs</Link>
                </li>
                <li>
                  <Link to="/about-us">About Us</Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="col-sm-6 col-lg-3">
              <h5 className="footer-title">Resources</h5>
              <ul className="footer-links">
                {/* <li>
                  <Link to="/blog">Our Blog</Link>
                </li> */}
                {/* <li>
                  <Link to="/career-advice">Career Advice</Link>
                </li> */}
                {/* <li>
                  <Link to="/help-center">Help Center</Link>
                </li> */}
                <li>
                  <Link to="/privacy-policy">Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms-of-use">Terms Of Use</Link>
                </li>
                {/* <li>
                  <Link to="/employers">For Employers</Link>
                </li> */}
              </ul>
            </div>

            {/* Job Types */}
            <div className="col-sm-6 col-lg-3">
              <h5 className="footer-title">Job Types</h5>
              <ul className="footer-links">
                <li>
                  <Link to="/jobs/security-license">Security License</Link>
                </li>
                <li>
                  <Link to="/jobs/misc-time-license">MISC Time License</Link>
                </li>
                <li>
                  <Link to="/jobs/working-with-children">
                    Working With Children
                  </Link>
                </li>
                <li>
                  <Link to="/jobs/first-aid">First Aid</Link>
                </li>
                <li>
                  <Link to="/jobs/cpr">CPR</Link>
                </li>
                <li>
                  <Link to="/jobs/white-card">White Card</Link>
                </li>
                <li>
                  <Link to="/jobs/traffic-controller">Traffic Controller</Link>
                </li>
              </ul>
            </div>

            {/* Contact Us + Social */}
            <div className="col-sm-6 col-lg-3">
              <h5 className="footer-title">Contact Us</h5>
              <ul className="footer-contact">
                <li>
                  <i className="fa fa-map-marker" aria-hidden="true"></i>
                  21 Tanglewood Bvd Truganina VIC 3029
                </li>
                <li>
                  <i className="fa fa-envelope" aria-hidden="true"></i>
                  <a href="mailto:staffoapp@gmail.com">staffoapp@gmail.com</a>
                </li>
                <li>
                  <i className="fa fa-phone" aria-hidden="true"></i>
                  <a href="tel:+13025550123">+1 (302) 555-0123</a>
                </li>
              </ul>

              <div className="footer-social">
                <a
                  href="https://www.facebook.com/profile.php?id=61582204185867"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook" aria-hidden="true"></i>
                </a>
                <a
                  href="https://www.instagram.com/staffoapp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram" aria-hidden="true"></i>
                </a>
                <a
                  href="https://www.linkedin.com/company/staff-o/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <i className="fab fa-linkedin" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Copyright />
    </footer>
  );
});

export default Footer;
