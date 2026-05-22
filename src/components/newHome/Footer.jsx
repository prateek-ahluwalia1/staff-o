import React from 'react'
import "../../styles/staffoo.css"
import { Link } from 'react-router-dom'
import staffologo from "../../assets/images/staffo.png"

function Footer() {
  return (
    <div>
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            {/* Updated Logo Layout containing your image asset */}
            <div className="footer-brand-logo">
              <img
                src={staffologo}
                alt="Staffoo"
                style={{ height: "45px", width: "auto", display: "block" }}
              />
            </div>
            <p>Australia's leading platform for security jobs and staffing. Connecting verified security professionals across every state and territory with trusted employers.</p>
            <div className="pay-row">
              <span className="pay-chip">Stripe</span>
              <span className="pay-chip">VISA</span>
              <span className="pay-chip">Mastercard</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <div className="footer-col-title">Quick Links</div>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/contact-us">Contact Us</Link></li>
              <li><Link to="/faqs">FAQs</Link></li>
              <li><Link to="/about-us">About Us</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-col">
            <div className="footer-col-title">Resources</div>
            <ul>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-of-use">Terms Of Use</Link></li>
            </ul>
          </div>

          {/* Job Types */}
          <div className="footer-col">
            <div className="footer-col-title">Job Types</div>
            <ul>
              <li><p>Security License</p></li>
              <li><p>MISC Time License</p></li>
              <li><p>Working With Children</p></li>
              <li><p>First Aid</p></li>
              <li><p>CPR</p></li>
              <li><p>White Card</p></li>
              <li><p>Traffic Controller</p></li>
            </ul>
          </div>

          {/* Contact Us + Social */}
          <div className="footer-col">
            <div className="footer-col-title">Contact Us</div>
            <div className="footer-contact-item">
              <span className="fci-icon"><i className="fa fa-map-marker" aria-hidden="true"></i></span>
              <span>21 Tanglewood Bvd Truganina VIC 3029</span>
            </div>
            <div className="footer-contact-item">
              <span className="fci-icon"><i className="fa fa-envelope" aria-hidden="true"></i></span>
              <a href="mailto:staffoapp@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>staffoapp@gmail.com</a>
            </div>
            <div className="footer-contact-item">
              <span className="fci-icon"><i className="fa fa-phone" aria-hidden="true"></i></span>
              <a href="tel:0478916034" style={{ color: 'inherit', textDecoration: 'none' }}>0478916034</a>
            </div>

            {/* Shared the social icon structure using standard anchor tags for external link handling */}
            <div className="footer-social" style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <a
                href="https://www.facebook.com/profile.php?id=61582204185867"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                style={{ color: '#aaa', fontSize: '18px' }}
              >
                <i className="fab fa-facebook" aria-hidden="true"></i>
              </a>
              <a
                href="https://www.instagram.com/staffoo_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                style={{ color: '#aaa', fontSize: '18px' }}
              >
                <i className="fab fa-instagram" aria-hidden="true"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/staff-o/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                style={{ color: '#aaa', fontSize: '18px' }}
              >
                <i className="fab fa-linkedin" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 STAFFOO PTY LTD · ABN 00 000 000 000 · ALL RIGHTS RESERVED</span>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-of-use">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer