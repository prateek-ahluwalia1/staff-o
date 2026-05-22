import React from 'react'
import "../../styles/staffoo.css"
import { Link } from 'react-router-dom'

function Header() {
  return (
    <div><header>
  <div className="nav-left">
    <Link className="logo" href="/">
      <div className="logo-shield">
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M18 3 L33 9 L33 21 C33 28 18 34 18 34 C18 34 3 28 3 21 L3 9 Z" fill="#f0a500" opacity="0.15" stroke="#f0a500" stroke-width="1.5"/>
          <path d="M18 8 L28 12 L28 21 C28 26 18 30 18 30 C18 30 8 26 8 21 L8 12 Z" fill="#f0a500" opacity="0.1" stroke="#f0a500" stroke-width="1"/>
          <text x="18" y="23" text-anchor="middle" font-family="'Bebas Neue'" font-size="12" fill="#f0a500" letter-spacing="0">S</text>
        </svg>
      </div>
      <span className="logo-text">Staff<span>oo</span></span>
    </Link>
    <nav>
      <Link to="/">Home</Link>
      {/* <Link to="/">Jobs</Link> */}
      <Link to="/contact-us">Contact Us</Link>
      <Link to="/about-us">About</Link>
    </nav>
  </div>
  <div className="nav-right">
    <Link to="/login" className="btn-nav-ghost">Sign In</Link>
    <Link to="/register" className="btn-nav-solid">Register Free</Link>
  </div>
</header></div>
  )
}

export default Header