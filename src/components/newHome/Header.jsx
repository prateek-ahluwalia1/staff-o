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

  const renderUserAvatar = () => {
    const imageUrl = getProfileImageUrl()
    const userName = userdata?.data?.name || userdata?.name || 'User'
    if (imageUrl) {
      return (
        <img src={imageUrl} alt="Profile"
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      )
    }
    return (
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        backgroundColor: '#0F7A4A', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.9rem',
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
      dispatch(logOut())
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Prevent body scroll when mobile menu open
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
            {/* For Clients */}
            <div>
              <span className="nh-nav-item">
                For clients <span className="nh-caret" />
              </span>
              <div className="nh-dropdown">
                <NavLink to="/register" onClick={handleLinkClick}>Post a job</NavLink>
                <NavLink to="/login" onClick={handleLinkClick}>Browse guards</NavLink>
                <NavLink to="/register" onClick={handleLinkClick}>Hiring for a business</NavLink>
                <NavLink to="/" onClick={handleLinkClick}>How it works</NavLink>
                <NavLink to="/pricing" onClick={handleLinkClick}>Pricing</NavLink>
              </div>
            </div>

            {/* For Guards */}
            <div>
              <span className="nh-nav-item">
                For guards <span className="nh-caret" />
              </span>
              <div className="nh-dropdown">
                <NavLink to="/login" onClick={handleLinkClick}>Browse jobs</NavLink>
                <NavLink to="/register" onClick={handleLinkClick}>How to apply</NavLink>
                <NavLink to="/register" onClick={handleLinkClick}>Licensing &amp; requirements</NavLink>
                <NavLink to="/edit-profile" onClick={handleLinkClick}>Guard dashboard</NavLink>
              </div>
            </div>

            {/* Industries */}
            <div>
              <span className="nh-nav-item">
                Industries <span className="nh-caret" />
              </span>
              <div className="nh-dropdown">
                <NavLink to="/solutions/event-security" onClick={handleLinkClick}>Event &amp; crowd control</NavLink>
                <NavLink to="/solutions/retail-security" onClick={handleLinkClick}>Retail security</NavLink>
                <NavLink to="/solutions/warehouse-logistics-security" onClick={handleLinkClick}>Warehouse &amp; logistics</NavLink>
                <NavLink to="/solutions/event-security" onClick={handleLinkClick}>Construction sites</NavLink>
                <NavLink to="/solutions/retail-security" onClick={handleLinkClick}>Residential &amp; estates</NavLink>
              </div>
            </div>

            {/* Company */}
            <div>
              <span className="nh-nav-item">
                Company <span className="nh-caret" />
              </span>
              <div className="nh-dropdown">
                <NavLink to="/about-us" onClick={handleLinkClick}>About us</NavLink>
                <NavLink to="/contact-us" onClick={handleLinkClick}>Contact</NavLink>
                <NavLink to="/careers" onClick={handleLinkClick}>Careers</NavLink>
                <NavLink to="/privacy-policy" onClick={handleLinkClick}>Privacy Policy</NavLink>
                <NavLink to="/terms-of-use" onClick={handleLinkClick}>Terms of Use</NavLink>
              </div>
            </div>
          </nav>

          {/* Desktop CTA */}
          <div className="nh-nav-cta" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #0F7A4A', flexShrink: 0 }}>
                    {renderUserAvatar()}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#14181C' }}>{displayName}</span>
                  <span className="nh-caret" style={{ borderColor: '#0F7A4A' }} />
                </div>

                {showUserMenu && (
                  <div style={{
                    position: 'absolute', right: 0, top: '50px',
                    background: 'white', border: '1px solid #E4E9E4', borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '200px', zIndex: 1000, overflow: 'hidden',
                  }}>
                    <NavLink to="/edit-profile" onClick={() => setShowUserMenu(false)}
                      style={{ display: 'block', padding: '12px 16px', color: '#232A2E', textDecoration: 'none', borderBottom: '1px solid #E4E9E4', fontSize: '14px' }}
                      onMouseEnter={(e) => { e.target.style.background = '#F5F8F5'; e.target.style.color = '#0F7A4A' }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#232A2E' }}
                    >
                      <i className="fa fa-user" style={{ marginRight: '8px' }} /> My Profile
                    </NavLink>
                    <button onClick={handleLogout}
                      style={{ display: 'block', width: '100%', padding: '12px 16px', color: '#e03535', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px' }}
                      onMouseEnter={(e) => { e.target.style.background = '#FFF5F5' }}
                      onMouseLeave={(e) => { e.target.style.background = 'transparent' }}
                    >
                      <i className="fa fa-sign-out" style={{ marginRight: '8px' }} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="nh-mobile-btn" onClick={toggleMobileMenu} aria-label="Toggle menu">
              <i className={`fa ${isMobileOpen ? 'fa-times' : 'fa-bars'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <div className={`nh-mobile-nav ${isMobileOpen ? 'open' : ''}`}>
        <NavLink to="/solutions/event-security" onClick={handleLinkClick}>Event Security</NavLink>
        <NavLink to="/solutions/retail-security" onClick={handleLinkClick}>Retail Security</NavLink>
        <NavLink to="/solutions/warehouse-logistics-security" onClick={handleLinkClick}>Warehouse &amp; Logistics</NavLink>
        <NavLink to="/pricing" onClick={handleLinkClick}>Pricing</NavLink>
        <NavLink to="/about-us" onClick={handleLinkClick}>About Us</NavLink>
        <NavLink to="/contact-us" onClick={handleLinkClick}>Contact</NavLink>
        <NavLink to="/privacy-policy" onClick={handleLinkClick}>Privacy Policy</NavLink>
        <NavLink to="/terms-of-use" onClick={handleLinkClick}>Terms of Use</NavLink>

        <div className="nh-mobile-nav-cta">
          {!token ? (
            <>
              <NavLink to="/login" onClick={handleLinkClick}
                className="nh-btn nh-btn-outline" style={{ textAlign: 'center' }}>Log in</NavLink>
              <NavLink to="/register" onClick={handleLinkClick}
                className="nh-btn nh-btn-solid" style={{ textAlign: 'center' }}>Sign up</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/edit-profile" onClick={handleLinkClick}
                className="nh-btn nh-btn-outline" style={{ textAlign: 'center' }}>My Profile</NavLink>
              <button onClick={handleLogout}
                className="nh-btn nh-btn-solid" style={{ backgroundColor: '#e03535', borderColor: '#e03535' }}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Header