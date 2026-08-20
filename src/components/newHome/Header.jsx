import React, { useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { logOut } from '../../store/slices/authSlice'
import useSubmit from '../../hooks/useSubmit'
import staffologo from "../../assets/images/staffo.png"
import { getProfileImageUrlFromUserdata } from '../../utils/profileImage'
import "../../styles/staffoo.css"

function Header() {
  const { token, userdata } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userId = userdata?.id || userdata?.data?.id

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const { submit } = useSubmit({ isAuth: true })

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
  }

  const getProfileImageUrl = () => getProfileImageUrlFromUserdata(userdata)
  const displayName = userdata?.data?.name || userdata?.name || 'User'
  const userEmail = userdata?.data?.email || userdata?.email || ''

  const renderUserAvatar = (size = 36) => {
    const imageUrl = getProfileImageUrl()
    const userName = userdata?.data?.name || userdata?.name || 'User'
    const style = { width: `${size}px`, height: `${size}px`, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }
    if (imageUrl) {
      return (
        <div style={style}>
          <img src={imageUrl} alt="Profile"
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
      )
    }
    return (
      <div style={{
        ...style, backgroundColor: '#0F7A4A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: size * 0.36 + 'px',
        border: '2px solid #0F7A4A',
      }}>
        {getInitials(userName)}
      </div>
    )
  }

  const toggleMobileMenu = useCallback(() => setIsMobileOpen((p) => !p), [])

  const handleLinkClick = useCallback(() => {
    setIsMobileOpen(false)
    setShowUserMenu(false)
  }, [])

  const handleLogout = async () => {
    try {
      handleLinkClick()
      await submit(`api/logout/${userId}`, {}, { method: 'POST' })
      sessionStorage.clear()
      dispatch(logOut())
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  React.useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  return (
    <>
      <header className="nh-header">
        <div className="nh-wrap nh-nav">
          {/* Logo */}
          <NavLink className="nh-logo" to="/" onClick={handleLinkClick}>
            <img src={staffologo} alt="Staffoo" style={{ height: '40px', width: 'auto' }} />
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="nh-nav-links">
            <div>
              <span className="nh-nav-item">For clients <span className="nh-caret" /></span>
              <div className="nh-dropdown">
                <NavLink to="/forclients/postajob" onClick={handleLinkClick}>Post a job</NavLink>
                <NavLink to="/forclients/howitworks" onClick={handleLinkClick}>How it works</NavLink>
              </div>
            </div>

            <div>
              <span className="nh-nav-item">For staff <span className="nh-caret" /></span>
              <div className="nh-dropdown">
                <NavLink to="/forstaff/working-staff" onClick={handleLinkClick}>Working on Staffoo</NavLink>
                <NavLink to="/forstaff/how-to-apply" onClick={handleLinkClick}>How to apply</NavLink>
                {/* <NavLink to="/forstaff/working-staff" onClick={handleLinkClick}>Licensing &amp; requirements</NavLink>
                <NavLink to="/edit-profile" onClick={handleLinkClick}>Staff dashboard</NavLink> */}
              </div>
            </div>

            <div>
              <span className="nh-nav-item">Industries <span className="nh-caret" /></span>
              <div className="nh-dropdown">
                <NavLink to="/industries/event-crowd-control" onClick={handleLinkClick}>Event &amp; crowd control</NavLink>
                <NavLink to="/industries/retail-security" onClick={handleLinkClick}>Retail security</NavLink>
                <NavLink to="/industries/corporate-office" onClick={handleLinkClick}>Corporate &amp; Office</NavLink>
                <NavLink to="/industries/construction-sites" onClick={handleLinkClick}>Construction sites</NavLink>
                <NavLink to="/industries/residential-estates" onClick={handleLinkClick}>Residential &amp; estates</NavLink>
              </div>
            </div>

            <div>
              <span className="nh-nav-item">Company <span className="nh-caret" /></span>
              <div className="nh-dropdown">
                <NavLink to="/about-us" onClick={handleLinkClick}>About us</NavLink>
                <NavLink to="/contact-us" onClick={handleLinkClick}>Contact</NavLink>
                <NavLink to="/privacy-policy" onClick={handleLinkClick}>Privacy Policy</NavLink>
                <NavLink to="/terms-of-use" onClick={handleLinkClick}>Terms of Use</NavLink>
              </div>
            </div>
          </nav>

          {/* Desktop CTA — auth buttons hidden on mobile via .nh-nav-cta-btns */}
          <div className="nh-nav-cta" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="nh-nav-cta-btns">
              {!token ? (
                <>
                  <NavLink to="/login" className="nh-btn nh-btn-ghost">Log in</NavLink>
                  <NavLink to="/register" className="nh-btn nh-btn-solid">Sign up</NavLink>
                </>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div
                    onClick={() => setShowUserMenu((p) => !p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                      padding: '6px 12px', borderRadius: '8px', transition: 'background .2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {renderUserAvatar(36)}
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#14181C' }}>{displayName}</span>
                    <span className="nh-caret" style={{ borderColor: '#0F7A4A' }} />
                  </div>

                  {showUserMenu && (
                    <div style={{
                      position: 'absolute', right: 0, top: '52px',
                      background: 'white', border: '1px solid #E4E9E4', borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '210px', zIndex: 1000, overflow: 'hidden',
                    }}>
                      <NavLink to="/edit-profile" onClick={() => setShowUserMenu(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', color: '#232A2E', textDecoration: 'none', borderBottom: '1px solid #E4E9E4', fontSize: '14px', transition: 'background .15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F8F5'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <i className="fa fa-user" style={{ color: '#0F7A4A', width: '16px' }} /> My Profile
                      </NavLink>
                      <button onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 16px', color: '#e03535', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px', transition: 'background .15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF5F5' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <i className="fa fa-sign-out" style={{ width: '16px' }} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger — always visible on mobile */}
            <button className="nh-mobile-btn" onClick={toggleMobileMenu} aria-label="Toggle menu">
              <i className={`fa ${isMobileOpen ? 'fa-times' : 'fa-bars'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── MOBILE SIDEBAR ── */}
      <div className={`nh-mobile-nav ${isMobileOpen ? 'open' : ''}`}>

        {/* Profile section at top (when logged in) */}
        {token && (
          <div style={{
            background: '#F5F8F5',
            borderRadius: '14px',
            padding: '16px',
            marginBottom: '8px',
            border: '1px solid #E4E9E4',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              {renderUserAvatar(48)}
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#14181C', fontFamily: "'Inter', sans-serif" }}>
                  {displayName}
                </div>
                {userEmail && (
                  <div style={{ fontSize: '12.5px', color: '#5B6660', marginTop: '1px', fontFamily: "'Inter', sans-serif" }}>
                    {userEmail}
                  </div>
                )}
              </div>
            </div>

            {/* My Profile button */}
            <NavLink
              to="/edit-profile"
              onClick={handleLinkClick}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px', borderRadius: '10px',
                background: '#fff', border: '1.5px solid #E4E9E4',
                color: '#14181C', textDecoration: 'none',
                fontSize: '14px', fontWeight: 600,
                marginBottom: '8px',
                fontFamily: "'Inter', sans-serif",
                transition: 'border-color .15s',
              }}
            >
              <span style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#E3F3EA', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fa fa-user" style={{ color: '#0F7A4A', fontSize: '13px' }} />
              </span>
              My Profile
              <i className="fa fa-chevron-right" style={{ marginLeft: 'auto', color: '#AAB3AE', fontSize: '11px' }} />
            </NavLink>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '11px 14px', borderRadius: '10px',
                background: '#FFF5F5', border: '1.5px solid #FFD5D5',
                color: '#e03535', cursor: 'pointer', fontSize: '14px',
                fontWeight: 600, fontFamily: "'Inter', sans-serif",
              }}
            >
              <span style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#FFE8E8', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="fa fa-sign-out" style={{ color: '#e03535', fontSize: '13px' }} />
              </span>
              Logout
            </button>
          </div>
        )}

        {/* Nav links */}
        <div style={{ borderBottom: '1px solid #E4E9E4', paddingBottom: '8px', marginBottom: '8px' }}>
          <NavLink to="/forstaff/working-staff" onClick={handleLinkClick}>Working on Staffoo</NavLink>
          <NavLink to="/forstaff/how-to-apply" onClick={handleLinkClick}>How to apply</NavLink>
          <NavLink to="/industries/event-crowd-control" onClick={handleLinkClick}>Event &amp; Crowd Control</NavLink>
          <NavLink to="/industries/retail-security" onClick={handleLinkClick}>Retail Security</NavLink>
          <NavLink to="/industries/corporate-office" onClick={handleLinkClick}>Corporate &amp; Office</NavLink>
          <NavLink to="/industries/construction-sites" onClick={handleLinkClick}>Construction Sites</NavLink>
          <NavLink to="/industries/residential-estates" onClick={handleLinkClick}>Residential &amp; Estates</NavLink>
          <NavLink to="/pricing" onClick={handleLinkClick}>Pricing</NavLink>
          <NavLink to="/about-us" onClick={handleLinkClick}>About Us</NavLink>
          <NavLink to="/contact-us" onClick={handleLinkClick}>Contact</NavLink>
          <NavLink to="/privacy-policy" onClick={handleLinkClick}>Privacy Policy</NavLink>
          <NavLink to="/terms-of-use" onClick={handleLinkClick}>Terms of Use</NavLink>
        </div>

        {/* CTA (logged-out only) */}
        {!token && (
          <div className="nh-mobile-nav-cta">
            <NavLink to="/login" onClick={handleLinkClick}
              className="nh-btn nh-btn-outline" style={{ textAlign: 'center' }}>Log in</NavLink>
            <NavLink to="/register" onClick={handleLinkClick}
              className="nh-btn nh-btn-solid" style={{ textAlign: 'center' }}>Sign up</NavLink>
          </div>
        )}
      </div>
    </>
  )
}

export default Header