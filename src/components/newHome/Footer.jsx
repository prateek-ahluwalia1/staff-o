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
            <Link to="/register">Post a job</Link>
            <Link to="/login">Browse guards</Link>
            <Link to="/register">Businesses &amp; agencies</Link>
            <Link to="/pricing">Pricing</Link>
          </div>

          {/* For guards */}
          <div className="nh-foot-col">
            <h4>For guards</h4>
            <Link to="/login">Browse jobs</Link>
            <Link to="/register">How to apply</Link>
            <Link to="/register">Licensing</Link>
            <Link to="/edit-profile">Guard dashboard</Link>
          </div>

          {/* Industries */}
          <div className="nh-foot-col">
            <h4>Industries</h4>
            <Link to="/solutions/event-security">Events</Link>
            <Link to="/solutions/retail-security">Retail</Link>
            <Link to="/solutions/warehouse-logistics-security">Warehouse &amp; Logistics</Link>
            <Link to="/solutions/event-security">Construction</Link>
          </div>

          {/* Company */}
          <div className="nh-foot-col">
            <h4>Company</h4>
            <Link to="/about-us">About</Link>
            <Link to="/contact-us">Contact</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-use">Terms of Use</Link>
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