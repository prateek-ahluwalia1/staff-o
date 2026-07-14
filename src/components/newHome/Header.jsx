import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { logOut } from '../../store/slices/authSlice'
import {
  setNotifications,
  setUnreadCount,
  markNotificationRead,
  markAllRead,
} from '../../store/slices/notificationSlice'
import useSubmit from '../../hooks/useSubmit'
import useFetch from '../../hooks/useFetch'
import staffologo from "../../assets/images/staffo.png"
import { getProfileImageUrlFromUserdata } from '../../utils/profileImage'
import "../../styles/staffoo.css"

function Header() {
  const { token, userdata } = useSelector((state) => state.auth)

  // FIXED: Provide safety fallbacks so it always stays an array/number
  const items = useSelector((state) => state.notifications.items) || []
  const unreadCount = useSelector((state) => state.notifications.unreadCount) || 0

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userId = userdata?.id || userdata?.data?.id

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)

  const notificationsEndpoint = useMemo(
    () => (userId ? `api/notifications/user/${userId}` : null),
    [userId],
  )

  const unreadEndpoint = useMemo(
    () => (userId ? `api/notifications/unread/${userId}` : null),
    [userId],
  )

  const { submit } = useSubmit({ isAuth: true })
  const { data: notificationsData, refetch: refetchNotifications } = useFetch(
    notificationsEndpoint,
    {
      isAuth: true,
      immediate: Boolean(notificationsEndpoint),
    },
  )
  const { data: unreadData, refetch: refetchUnreadCount } = useFetch(
    unreadEndpoint,
    {
      isAuth: true,
      immediate: Boolean(unreadEndpoint),
    },
  )

  // FIXED: Target the nested array (.data.data) instead of the whole paginated object
  useEffect(() => {
    if (notificationsData?.success && notificationsData?.data?.data) {
      dispatch(setNotifications(notificationsData.data.data))
    } else if (Array.isArray(notificationsData)) {
      dispatch(setNotifications(notificationsData))
    }
  }, [dispatch, notificationsData])

  // FIXED: Target the actual integer count from the response
  useEffect(() => {
    if (unreadData?.success !== undefined) {
      dispatch(setUnreadCount(unreadData.count))
    } else if (unreadData !== null && unreadData !== undefined) {
      dispatch(setUnreadCount(unreadData))
    }
  }, [dispatch, unreadData])

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const getNotificationTitle = (notif) =>
    notif?.title || notif?.data?.title || 'Notification'

  const getNotificationMessage = (notif) =>
    notif?.message || notif?.data?.message || ''

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name) => {
    const colors = ['#0A7C6E']
    let hash = 0
    if (name) {
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
      }
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const getProfileImageUrl = () => {
    return getProfileImageUrlFromUserdata(userdata)
  }

  const displayName = userdata?.data?.name || userdata?.name || 'User'

  const renderUserAvatar = () => {
    const imageUrl = getProfileImageUrl()
    const userName = userdata?.data?.name || userdata?.name || 'User'

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="Profile"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            e.target.style.display = 'none'
          }}
        />
      )
    }

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: getAvatarColor(userName),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.9rem',
        }}
      >
        {getInitials(userName)}
      </div>
    )
  }

  const markSingleNotificationRead = async (notif) => {
    if (!notif?.id || notif.read_at) return

    dispatch(markNotificationRead(notif.id))
    await submit(`api/notifications/read/${notif.id}`, {}, { method: 'POST' })
  }

  const toggleNotifications = async () => {
    const nextState = !showNotifications
    setShowNotifications(nextState)

    if (nextState) {
      await Promise.all([refetchNotifications(), refetchUnreadCount()])
    }

    if (nextState && userId) {
      dispatch(markAllRead())
      await submit(
        `api/notifications/mark-all-read/${userId}`,
        {},
        { method: 'POST' },
      )
    }
  }

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu((prev) => !prev)
    if (showNotifications) {
      setShowNotifications(false)
    }
  }, [showNotifications])

  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 992) {
      setIsMobileOpen(false)
      setOpenDropdown(null)
    }
  }, [])

  return (
    <header
      className="staffoo-header"
      style={{
        backgroundColor: '#1a1a1a',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: '16px',
      }}
    >
      <div className="nav-left">
        {/* Updated Logo Layout containing your image asset */}
        <NavLink className="logo d-flex align-items-center" to="/" style={{ textDecoration: 'none' }}>
          <img
            src={staffologo}
            alt="Staffoo"
            style={{ height: "45px", width: "auto", display: "block" }}
          />
        </NavLink>
        <nav className={`main-nav ${isMobileOpen ? 'mobile-open' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div className={`nav-item-dropdown ${openDropdown === 'solutions' ? 'mobile-expanded' : ''}`}>
            <span onClick={() => { if (window.innerWidth < 992) setOpenDropdown(openDropdown === 'solutions' ? null : 'solutions') }} style={{ color: '#ccc', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em' }}>Solutions <i className="fa fa-chevron-down" style={{ color: '#0A7C6E', fontSize: '11px', fontWeight: 'semibold', marginLeft: '3px' }}></i></span>
            <div className="dropdown-content multi-col">
              <div className="dropdown-column">
                <div className="dropdown-title">Sectors</div>
                <NavLink to="/solutions/event-security" onClick={handleLinkClick}>Event Security</NavLink>
                <NavLink to="/solutions/retail-security" onClick={handleLinkClick}>Retail Security</NavLink>
                <NavLink to="/solutions/warehouse-logistics-security" onClick={handleLinkClick}>Warehouse Logistics Security</NavLink>
                {/* <NavLink to="/solutions/corporate-security" onClick={handleLinkClick}>Corporate Security</NavLink>
                <NavLink to="/solutions/government-security" onClick={handleLinkClick}>Government Security</NavLink>
                <NavLink to="/solutions/healthcare-security" onClick={handleLinkClick}>Healthcare Security</NavLink>
                <NavLink to="/solutions/transport-security" onClick={handleLinkClick}>Transport Security</NavLink>
                <NavLink to="/solutions/aviation-security" onClick={handleLinkClick}>Aviation Security</NavLink> */}
              </div>
              {/* <div className="dropdown-column">
                <div className="dropdown-title">Use Cases</div>
                <NavLink to="/solutions/for-security-companies" onClick={handleLinkClick}>For Security Companies</NavLink>
                <NavLink to="/solutions/for-security-guards" onClick={handleLinkClick}>For Security Guards</NavLink>
                <NavLink to="/solutions/security-subcontractors" onClick={handleLinkClick}>Security Subcontractors</NavLink>
                <NavLink to="/solutions/hire-security-staff" onClick={handleLinkClick}>Hire Security Staff</NavLink>
                <NavLink to="/solutions/for-event-security-providers" onClick={handleLinkClick}>For Event Security Providers</NavLink>
                <NavLink to="/solutions/for-corporate-security-teams" onClick={handleLinkClick}>For Corporate Security Teams</NavLink>
                <NavLink to="/solutions/for-labour-hire-agencies" onClick={handleLinkClick}>For Labour Hire Agencies</NavLink>
              </div> */}
            </div>
          </div>

          {/* Fixed: removed nested JSX comments that were causing syntax errors */}
          {/* <div className={`nav-item-dropdown ${openDropdown === 'features' ? 'mobile-expanded' : ''}`}>
            <span onClick={() => { if (window.innerWidth < 992) setOpenDropdown(openDropdown === 'features' ? null : 'features') }} style={{ color: '#ccc', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em' }}>Features <i className="fa fa-chevron-down" style={{ color: '#0A7C6E', fontSize: '11px', marginLeft: '3px' }}></i></span>
            <div className="dropdown-content">
              <NavLink to="/features/gps-guard-tracking" onClick={handleLinkClick}>GPS Guard Tracking</NavLink>
              <NavLink to="/features/time-rooster" onClick={handleLinkClick}>Time Rooster</NavLink>
              <NavLink to="/features/security-staff-recruitment" onClick={handleLinkClick}>Security Staff Recruitment</NavLink>
              <NavLink to="/features/visa-document-verification" onClick={handleLinkClick}>Visa/Document Verification</NavLink>
              <NavLink to="/features/attendance-analytics" onClick={handleLinkClick}>Attendance Analytics</NavLink>
              <NavLink to="/features/tracking-dashboard" onClick={handleLinkClick}>Tracking Dashboard</NavLink>
              <NavLink to="/features/payslip-pay-sheet" onClick={handleLinkClick}>Payslip, Pay Sheet</NavLink>
              <NavLink to="/features/job-handshake" onClick={handleLinkClick}>Job Handshake</NavLink>
              <NavLink to="/features/workforce-dashboard" onClick={handleLinkClick}>Workforce Dashboard</NavLink>
            </div>
          </div> */}

          <NavLink to="/pricing" onClick={handleLinkClick} style={{ color: '#ccc', textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em' }}>Pricing</NavLink>

          <div className={`nav-item-dropdown ${openDropdown === 'resources' ? 'mobile-expanded' : ''}`}>
            <span onClick={() => { if (window.innerWidth < 992) setOpenDropdown(openDropdown === 'resources' ? null : 'resources') }} style={{ color: '#ccc', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em' }}>Resources <i className="fa fa-chevron-down" style={{ color: '#0A7C6E', fontSize: '11px', marginLeft: '3px' }}></i></span>
            <div className="dropdown-content">
              <NavLink to="/resources/blogs" onClick={handleLinkClick}>Blogs</NavLink>
              {/* <NavLink to="/resources/pr-news" onClick={handleLinkClick}>PR/News</NavLink>
              <NavLink to="/resources/case-studies" onClick={handleLinkClick}>Case Studies</NavLink> */}
            </div>
          </div>

          <div className={`nav-item-dropdown ${openDropdown === 'company' ? 'mobile-expanded' : ''}`}>
            <span onClick={() => { if (window.innerWidth < 992) setOpenDropdown(openDropdown === 'company' ? null : 'company') }} style={{ color: '#ccc', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em' }}>Company <i className="fa fa-chevron-down" style={{ color: '#0A7C6E', fontSize: '11px', marginLeft: '3px' }}></i></span>
            <div className="dropdown-content">
              <NavLink to="/about-us" onClick={handleLinkClick}>About Us</NavLink>
              <NavLink to="/contact-us" onClick={handleLinkClick}>Contact Us</NavLink>
              <NavLink to="/careers" onClick={handleLinkClick}>Careers</NavLink>
              <NavLink to="/privacy-policy" onClick={handleLinkClick}>Privacy Policy</NavLink>
              <NavLink to="/terms-of-use" onClick={handleLinkClick}>Terms and Condition</NavLink>
            </div>
          </div>

          {/* Mobile Auth Links */}
          <div className="mobile-auth-links">
            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '16px 0' }}></div>
            {!token ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <NavLink to="/login" onClick={handleLinkClick} style={{ color: '#fff', border: '1px solid #fff', textAlign: 'center', padding: '10px 16px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', textTransform: "none" }}>Sign in</NavLink>
                <NavLink to="/register" onClick={handleLinkClick} style={{ backgroundColor: '#0A7C6E', color: '#fff', border: '1px solid #0A7C6E', textAlign: 'center', padding: '10px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>Register Free</NavLink>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <NavLink to="/edit-profile" onClick={handleLinkClick} style={{ color: '#ccc', textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em' }}><i className="fa fa-user" style={{ marginRight: '8px' }}></i> My Profile</NavLink>
                <NavLink to="/notifications" onClick={handleLinkClick} style={{ color: '#ccc', textDecoration: 'none', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em' }}>
                  <i className="fa fa-bell" style={{ marginRight: '8px' }}></i> Notifications
                  {unreadCount > 0 && <span style={{ marginLeft: '8px', backgroundColor: '#dc3545', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{unreadCount}</span>}
                </NavLink>
                <button
                  onClick={async () => {
                    try {
                      handleLinkClick()
                      await submit(
                        `api/logout/${userId}`,
                        {},
                        { method: 'POST' },
                      )
                      dispatch(logOut())
                      navigate('/login')
                    } catch (error) {
                      console.error('Logout error:', error)
                    }
                  }}
                  style={{ color: '#ff6b6b', background: 'none', border: 'none', padding: 0, textAlign: 'left', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', cursor: 'pointer' }}
                >
                  <i className="fa fa-sign-out" style={{ marginRight: '8px' }}></i> Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      <button
        className="mobile-menu-btn"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '20px' }}
      >
        <i className={`fa ${isMobileOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      <div className="nav-right">
        {!token ? (
          <>
            <NavLink to="/login" className="btn-nav-ghost">
              Sign in
            </NavLink>

            <NavLink to="/register" className="btn-nav-solid">
              Register Free
            </NavLink>

            <style>{`
              .btn-nav-ghost {
                color: #fff;
                border: 1px solid #fff;
                text-align: center;
                padding: 10px 16px;
                border-radius: 5px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                display: inline-block;
                margin-right: 10px;
              }

              .btn-nav-ghost:hover {
                background: #fff;
                color: #0A7C6E;
                transform: translateY(-2px);
                box-shadow: 0 6px 14px rgba(0,0,0,0.15);
              }

              .btn-nav-solid {
                background: #0A7C6E;
                color: #fff;
                border: 1px solid #0A7C6E;
                text-align: center;
                padding: 10px 16px;
                border-radius: 5px;
                text-decoration: none;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(10,124,110,0.3);
                transition: all 0.3s ease;
                display: inline-block;
              }

              .btn-nav-solid:hover {
                background: #08695d;
                border-color: #08695d;
                transform: translateY(-2px);
                box-shadow: 0 8px 18px rgba(10,124,110,0.4);
              }
            `}</style>
          </>
        ) : (
          <>
            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn position-relative p-0 border-0 bg-transparent"
                onClick={toggleNotifications}
                aria-label="Toggle notifications"
                style={{
                  fontSize: '18px',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#0A7C6E')}
                onMouseLeave={(e) => (e.target.style.color = '#fff')}
              >
                <i className="fa fa-bell"></i>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-8px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '40px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    width: '320px',
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #444', fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>
                    Notifications
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                      maxHeight: '350px',
                      overflowY: 'auto',
                    }}
                  >
                    {items.length > 0 ? (
                      items.map((notif, index) => (
                        <li
                          key={notif.id || index}
                          onClick={() => markSingleNotificationRead(notif)}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #444',
                            cursor: 'pointer',
                            whiteSpace: 'normal',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#333')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#fff' }}>
                            {getNotificationTitle(notif)}
                          </div>
                          <div className='mt-2 fw-bold' style={{ fontSize: '13px', color: '#aaa', marginTop: '4px', textTransform: "none" }}>
                            {getNotificationMessage(notif)}
                          </div>
                        </li>
                      ))
                    ) : (
                      <li style={{ padding: '12px', textAlign: 'center', color: '#777', fontSize: '13px' }}>
                        No new notifications
                      </li>
                    )}
                  </ul>
                  <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid #444' }}>
                    <NavLink
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      style={{ fontSize: '13px', color: '#0A7C6E', textDecoration: 'none', fontWeight: '500' }}
                    >
                      View All
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                className="dropdown"
                onClick={toggleUserMenu}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '2px solid #0A7C6E',
                  }}
                >
                  {renderUserAvatar()}
                </div>
                <span style={{ fontWeight: '600', fontSize: '14px', color: '#fff' }}>
                  {displayName}
                </span>
                <i className="fa fa-chevron-down" style={{ fontSize: '12px', color: '#0A7C6E' }}></i>
              </div>

              {showUserMenu && (
                <div
                  className="dropdown-menu-custom"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '50px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    minWidth: '220px',
                    zIndex: 1000,
                    overflow: 'hidden',
                  }}
                >
                  <NavLink
                    to="/edit-profile"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      color: '#fff',
                      textDecoration: 'none',
                      borderBottom: '1px solid #444',
                      transition: 'background-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#333'
                      e.target.style.color = '#0A7C6E'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = '#fff'
                    }}
                  >
                    <i className="fa fa-user" style={{ marginRight: '8px' }}></i>
                    My Profile
                  </NavLink>
                  <button
                    onClick={async () => {
                      try {
                        setShowUserMenu(false)
                        await submit(
                          `api/logout/${userId}`,
                          {},
                          { method: 'POST' },
                        )
                        dispatch(logOut())
                        navigate('/login')
                      } catch (error) {
                        console.error('Logout error:', error)
                      }
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      color: '#ff6b6b',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s, color 0.2s',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#333'
                      e.target.style.color = '#ff8787'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent'
                      e.target.style.color = '#ff6b6b'
                    }}
                  >
                    <i className="fa fa-sign-out" style={{ marginRight: '8px' }}></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header