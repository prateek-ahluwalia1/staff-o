import { Link } from 'react-router-dom'
import staffologo from "../../assets/images/staffo.png"
import "../../styles/staffoo.css"

function Footer() {
  return (
    <footer className="nh-footer">
      <style>{`
        .nh-footer {
          background: var(--nh-ink, #14181C) !important;
          color: #AAB3AE !important;
          padding: 60px 0 28px !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          box-sizing: border-box !important;
        }

        .nh-footer * {
          box-sizing: border-box !important;
        }

        .nh-footer .nh-wrap {
          max-width: 1200px !important;
          margin: 0 auto !important;
          padding: 0 24px !important;
        }

        /* Brand container is 1.5fr, remaining 5 containers are 1fr */
        .nh-footer .nh-foot-grid {
          display: grid !important;
          grid-template-columns: 1.5fr repeat(5, minmax(0, 1fr)) !important;
          gap: 16px !important;
          align-items: flex-start !important;
          margin-bottom: 42px !important;
        }

        .nh-footer .nh-foot-col,
        .nh-footer .nh-foot-grid > div:first-child {
          max-width: 100% !important;
          width: 100% !important;
          flex: none !important;
        }

        .nh-footer .nh-foot-logo {
          display: flex !important;
          align-items: center !important;
          margin-bottom: 8px !important;
            margin-top: -8px !important;     /* 👈 Yeh line add krein (-4px se -10px tak adjust kar sakte hain) */

        }

        .nh-footer .nh-foot-logo-img {
          height: 34px !important;
          width: auto !important;
          display: block !important;
        }

        .nh-footer .nh-foot-brand p {
          font-size: 13px !important;
          line-height: 1.55 !important;
          color: #AAB3AE !important;
          margin: 0 0 16px !important;
        }

        .nh-footer .nh-foot-col h4 {
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #ffffff !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          margin: 0 0 14px !important;
        }

        .nh-footer .nh-foot-col:not(.nh-foot-brand) a {
          display: block !important;
          font-size: 13.5px !important;
          line-height: 1.5 !important;
          padding: 5px 0 !important;
          color: #AAB3AE !important;
          text-decoration: none !important;
          transition: color 0.15s ease, transform 0.15s ease !important;
        }

        .nh-footer .nh-foot-col:not(.nh-foot-brand) a:hover {
          color: var(--nh-green-light, #E1F3F0) !important;
          transform: translateX(2px) !important;
        }

        .nh-footer .nh-foot-social {
          display: flex !important;
          gap: 10px !important;
          align-items: center !important;
          margin-top: 12px !important;
        }

        .nh-footer .nh-foot-social a {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          width: 34px !important;
          height: 34px !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 8px !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #C9D2CD !important;
          font-size: 15px !important;
          line-height: 1 !important;
          text-decoration: none !important;
          transition: all 0.2s ease !important;
          box-sizing: border-box !important;
        }

        .nh-footer .nh-foot-social a:hover {
          color: #ffffff !important;
          background: var(--nh-green, #0A7C6E) !important;
          border-color: var(--nh-green, #0A7C6E) !important;
          transform: translateY(-2px) !important;
        }

        .nh-footer .nh-foot-social a i,
        .nh-footer .nh-foot-social a .fab,
        .nh-footer .nh-foot-social a [class*="fa-"] {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          margin: 0 auto !important;
          padding: 0 !important;
          line-height: 1 !important;
          font-size: 15px !important;
          width: 100% !important;
          height: auto !important;
        }

        .nh-footer .nh-foot-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
          padding-top: 22px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          flex-wrap: wrap !important;
          gap: 12px !important;
          font-size: 12.5px !important;
          color: #8D9A92 !important;
        }

        .nh-footer .nh-foot-bottom a {
          color: #AAB3AE !important;
          text-decoration: none !important;
          transition: color 0.15s ease !important;
        }

        .nh-footer .nh-foot-bottom a:hover {
          color: #ffffff !important;
        }

        /* ===== TABLET RESPONSIVENESS (681px - 1024px) ===== */
        @media (max-width: 1024px) and (min-width: 681px) {
          .nh-footer {
            padding: 50px 0 24px !important;
          }
          .nh-footer .nh-foot-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 28px 20px !important;
          }
        }

        /* ===== MOBILE RESPONSIVENESS (up to 680px) ===== */
        @media (max-width: 680px) {
          .nh-footer {
            padding: 44px 0 24px !important;
          }
          .nh-footer .nh-wrap {
            padding: 0 18px !important;
          }
          .nh-footer .nh-foot-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 24px 16px !important;
            margin-bottom: 32px !important;
          }
          .nh-footer .nh-foot-brand {
            grid-column: 1 / -1 !important;
            margin-bottom: 8px !important;
          }
          .nh-footer .nh-foot-brand p {
            max-width: 100% !important;
          }
          .nh-footer .nh-foot-bottom {
            flex-direction: column !important;
            text-align: center !important;
            justify-content: center !important;
            gap: 10px !important;
          }
        }

        /* ===== SMALL MOBILE (<= 400px) ===== */
        @media (max-width: 400px) {
          .nh-footer .nh-foot-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>

      <div className="nh-wrap">
        <div className="nh-foot-grid">
          {/* Brand */}
          <div className="nh-foot-col nh-foot-brand">
            <div className="nh-foot-logo">
              <img src={staffologo} alt="Staffoo" className="nh-foot-logo-img" />
            </div>
            <p>
              A platform connecting clients, individuals, businesses and agencies with
              independent, licensed security staff across Australia.
            </p>
            <div className="nh-foot-social">
              <a href="https://www.facebook.com/StaffooAU/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook" />
              </a>
              <a href="https://www.instagram.com/staffoo_au/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram" />
              </a>
              <a href="https://www.linkedin.com/company/staff-o/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin" />
              </a>
            </div>
          </div>

          <div className="nh-foot-col">
            <h4>Industries</h4>
            <Link to="/industries/event-crowd-control">Events and Crowd Control</Link>
            <Link to="/industries/retail-security">Retail Security</Link>
            <Link to="/industries/corporate-office">Corporate and Office</Link>
            <Link to="/industries/construction-sites">Construction Sites</Link>
            <Link to="/industries/residential-estates">Residential and Estates</Link>
          </div>
          {/* For clients */}
          <div className="nh-foot-col">
            <h4>For client</h4>
            <Link to="/forclients/post-job">Post a job</Link>
            <Link to="/forclients/how-it-works">How it works</Link>
            <Link to="/client-terms" target="_blank" rel="noopener noreferrer">Client Terms</Link>
          </div>

          {/* For staff */}
          <div className="nh-foot-col">
            <h4>For staff</h4>
            <Link to="/forstaff/working-staff">Working on Staffoo</Link>
            <Link to="/forstaff/how-to-apply">How to apply</Link>
            <Link to="/staff-terms" target="_blank" rel="noopener noreferrer">Staff Terms</Link>
          </div>

          {/* For Partner */}
          <div className="nh-foot-col">
            <h4>For Partner</h4>
            <Link to="/forpartner/become-partner">Resource Partners</Link>
            <Link to="/partner-terms" target="_blank" rel="noopener noreferrer">Partner Terms</Link>
          </div>

          {/* Company */}
          <div className="nh-foot-col">
            <h4>Company</h4>
            <Link to="/about-us">About</Link>
            <Link to="/contact-us">Contact</Link>
            {/* <Link to="/careers">Careers</Link> */}
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-use">Terms of Use</Link>
          </div>
        </div>

        <div className="nh-foot-bottom">
          <span>© 2026 STAFFOO PTY LTD · ABN 48 613 317 838 · All rights reserved.</span>
          <span>
            <Link to="/privacy-policy" style={{ color: '#AAB3AE', textDecoration: 'none', marginRight: '16px' }}>Privacy</Link>
            <Link to="/terms-of-use" style={{ color: '#AAB3AE', textDecoration: 'none', marginRight: '16px' }}>Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer