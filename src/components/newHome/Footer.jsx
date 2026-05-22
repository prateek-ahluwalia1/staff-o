import React from 'react'
import "../../styles/staffoo.css"
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <div><footer>
  <div className="footer-top">
    <div className="footer-brand">
      <div className="footer-brand-logo">
        <div className="fl-shield">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="M16 3L28 8v12C28 26 16 30 16 30S4 26 4 20V8Z" fill="#f0a500" opacity="0.15" stroke="#f0a500" stroke-width="1.5"/>
            <text x="16" y="22" text-anchor="middle" font-family="'Bebas Neue'" font-size="12" fill="#f0a500">S</text>
          </svg>
        </div>
        <span className="fl-text">Staff<span>oo</span></span>
      </div>
      <p>Australia's leading platform for security jobs and staffing. Connecting verified security professionals across every state and territory with trusted employers.</p>
      <div className="pay-row">
        <span className="pay-chip">Stripe</span>
        <span className="pay-chip">VISA</span>
        <span className="pay-chip">Mastercard</span>
        <span className="pay-chip">EFTPOS</span>
      </div>
    </div>

    <div className="footer-col">
      <div className="footer-col-title">Quick Links</div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/">Jobs Board</Link></li>
        <li><Link to="/">About Staffoo</Link></li>
        <li><Link to="/">Contact Us</Link></li>
        <li><Link to="/">Blog</Link></li>
        <li><Link to="/">FAQ</Link></li>
      </ul>
    </div>

    <div className="footer-col">
      <div className="footer-col-title">Resources</div>
      <ul>
        <li><Link to="/">Privacy Policy</Link></li>
        <li><Link to="/">Terms of Service</Link></li>
        <li><Link to="/">Safety Standards</Link></li>
        <li><Link to="/">Compliance Docs</Link></li>
      </ul>
    </div>

    <div className="footer-col">
      <div className="footer-col-title">Job Types</div>
      <ul>
        <li><Link to="/">Security Licence</Link></li>
        <li><Link to="/">HISC Licence</Link></li>
        <li><Link to="/">Working With Children</Link></li>
        <li><Link to="/">First Aid</Link></li>
        <li><Link to="/">CPR</Link></li>
        <li><Link to="/">Crowd Control</Link></li>
        <li><Link to="/">Traffic Controller</Link></li>
      </ul>
    </div>

    <div className="footer-col">
      <div className="footer-col-title">Contact Us</div>
      <div className="footer-contact-item">
        <span className="fci-icon">◈</span>
        <span>Victoria, Australia</span>
      </div>
      <div className="footer-contact-item">
        <span className="fci-icon">✉</span>
        <span>contact@company.com</span>
      </div>
      <div className="footer-contact-item">
        <span className="fci-icon">◷</span>
        <span>Support hours: Mon–Fri 8am–6pm AEST</span>
      </div>
    </div>
  </div>

  <div className="footer-bottom">
    <span>© 2026 STAFFOO PTY LTD · ABN 00 000 000 000 · ALL RIGHTS RESERVED</span>
    <div className="footer-bottom-links">
      <Link to="/">Privacy</Link>
      <Link to="/">Terms</Link>
      <Link to="/">Cookies</Link>
      <Link to="/">Sitemap</Link>
    </div>
  </div>
</footer>
</div>
  )
}

export default Footer