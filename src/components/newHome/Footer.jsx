import { Link } from 'react-router-dom'
import staffologo from "../../assets/images/staffo.png"
import "../../styles/staffoo.css"

function Footer() {
  return (
    <footer className="nh-footer">
      <div className="nh-wrap">
        <div className="nh-foot-grid">
          {/* Brand */}
          <div>
            <div className="nh-foot-logo">
              <img src={staffologo} alt="Staffoo" className="nh-foot-logo-img" />
            </div>
            <p>
              A platform connecting clients, individuals, businesses and agencies with
              independent, licensed security staff across Australia.
            </p>
            <div className="nh-foot-social">
              <a href="https://www.facebook.com/profile.php?id=61582204185867" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook" />
              </a>
              <a href="https://www.instagram.com/staffoo_/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram" />
              </a>
              <a href="https://www.linkedin.com/company/staff-o/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin" />
              </a>
            </div>
          </div>

          {/* For clients */}
          <div className="nh-foot-col">
            <h4>For clients</h4>
            <Link to="/forclients/postajob">Post a job</Link>
            <Link to="/forclients/howitworks">How it works</Link>
            <Link to="/client-terms">Client Terms</Link>
          </div>

          {/* For staff */}
          <div className="nh-foot-col">
            <h4>For staff</h4>
            <Link to="/forstaff/working-staff">Working on Staffoo</Link>
            <Link to="/forstaff/how-to-apply">How to apply</Link>
            <Link to="/staff-terms">Staff Terms</Link>
          </div>

          {/* Industries */}
          <div className="nh-foot-col">
            <h4>Industries</h4>
            <Link to="/industries/event-crowd-control">Events &amp; Crowd Control</Link>
            <Link to="/industries/retail-security">Retail Security</Link>
            <Link to="/industries/corporate-office">Corporate &amp; Office</Link>
            <Link to="/industries/construction-sites">Construction Sites</Link>
            <Link to="/industries/residential-estates">Residential &amp; Estates</Link>
          </div>

            {/* Company */}
          <div className="nh-foot-col">
            <h4>Company</h4>
            <Link to="/about-us">About</Link>
            <Link to="/contact-us">Contact</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-use">Terms of Use</Link>
            <Link to="/partner-terms">Partner Terms</Link>
          </div>
        </div>

        <div className="nh-foot-bottom">
          <span>© 2026 STAFFOO PTY LTD · ABN 48 613 317 838 · All rights reserved.</span>
          <span>
            <Link to="/privacy-policy" style={{ color: '#AAB3AE', textDecoration: 'none', marginRight: '16px' }}>Privacy</Link>
            <Link to="/terms-of-use" style={{ color: '#AAB3AE', textDecoration: 'none', marginRight: '16px' }}>Terms</Link>
            <span>Compliance</span>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer