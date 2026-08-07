import React, { memo } from "react";
import { Link } from "react-router-dom";

const Footer = memo(function Footer() {
  return (
    <footer className="footer-modern jw-footer">
      <style>{`
        .jw-footer {
          position: relative;
          background: linear-gradient(135deg, #0A7C6E 0%, #075e53 100%) !important;
          isolation: isolate;
          overflow: hidden;
        }
        .jw-footer::before {
          content: "";
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #6ee7d8, #0A7C6E 40%, #0a1930);
          z-index: 1;
        }
        .jw-footer::after {
          content: "";
          position: absolute; bottom: -80px; right: -80px; width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(10,25,48,0.35) 0%, rgba(10,25,48,0) 70%);
          z-index: -1;
        }
        .jw-footer .footer-title {
          color: #fff !important;
          font-weight: 800 !important;
          font-size: 1.05rem !important;
          letter-spacing: 0.2px;
          margin-bottom: 18px !important;
          position: relative;
          padding-bottom: 10px;
        }
        .jw-footer .footer-title::after {
          content: "";
          position: absolute; left: 0; bottom: 0; width: 30px; height: 2px;
          background: rgba(255,255,255,0.5); border-radius: 2px;
        }
        .jw-footer .footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .jw-footer .footer-links li { display: flex; align-items: center; }
        .jw-footer .footer-links a {
          color: rgba(255,255,255,0.78) !important;
          text-decoration: none !important;
          font-size: 0.9rem;
          transition: color 0.15s, padding-left 0.15s;
        }
        .jw-footer .footer-links a:hover { color: #fff !important; padding-left: 4px; }
        .jw-footer .footer-links li p {
          color: rgba(255,255,255,0.78) !important;
          margin: 0; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;
        }
        .jw-footer .footer-links li p::before {
          content: "\\f00c";
          font-family: "Font Awesome 6 Free"; font-weight: 900;
          font-size: 9px; color: #6ee7d8; flex-shrink: 0;
        }
        .jw-footer .footer-contact { list-style: none; padding: 0; margin: 0 0 18px; display: flex; flex-direction: column; gap: 12px; }
        .jw-footer .footer-contact li {
          display: flex; align-items: flex-start; gap: 10px;
          color: rgba(255,255,255,0.85) !important; font-size: 0.88rem; line-height: 1.4;
        }
        .jw-footer .footer-contact li i {
          width: 26px; height: 26px; border-radius: 8px; background: rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; margin-top: 1px;
        }
        .jw-footer .footer-contact a { color: rgba(255,255,255,0.85) !important; text-decoration: none !important; transition: color 0.15s; }
        .jw-footer .footer-contact a:hover { color: #fff !important; }
        .jw-footer .footer-social { display: flex; gap: 10px; }
        .jw-footer .footer-social a {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.12) !important; border: 1px solid rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          color: #fff !important; transition: all 0.15s;
        }
        .jw-footer .footer-social a:hover { background: #fff !important; color: #0A7C6E !important; transform: translateY(-2px); }
      `}</style>
      <div className="footer-main">
        <div className="container">
          <div className="row g-4">
            {/* Quick Links */}
            <div className="col-sm-6 col-lg-3">
              <h5 className="footer-title">Quick Links</h5>
              <ul className="footer-links">
                <li>
                  <Link to="/">Home</Link>
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
                  <p>Security License</p>
                </li>
                <li>
                  <p>MISC Time License</p>
                </li>
                <li>
                  <p>Working With Children</p>
                </li>
                <li>
                  <p>First Aid</p>
                </li>
                <li>
                  <p>CPR</p>
                </li>
                <li>
                  <p>White Card</p>
                </li>
                <li>
                  <p>Traffic Controller</p>
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
                  <Link to="mailto:admin@staffoo.com.au"
                    style={{ textTransform: "none" }}
                  >admin@staffoo.com.au</Link>
                </li>
                <li>
                  <i className="fa fa-phone" aria-hidden="true"></i>
                  <Link to="tel:1800 782 366">1800 782 366</Link>
                </li>
              </ul>

              <div className="footer-social">
                <a href="https://www.facebook.com/profile.php?id=61582204185867"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook" aria-hidden="true"></i>
                </a>
                <a href="https://www.instagram.com/staffoo_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram" aria-hidden="true"></i>
                </a>
                <a href="https://www.linkedin.com/company/staff-o/"
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
    </footer>
  );
});

export default Footer;