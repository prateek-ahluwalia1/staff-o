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
import { getProfileImageUrlFromUserdata } from '../../utils/profileImage'
import "../../styles/staffoo.css"

function Header() {
  const { token, userdata } = useSelector((state) => state.auth)
  const { items, unreadCount } = useSelector((state) => state.notifications)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userId = userdata?.id || userdata?.data?.id

  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

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

  useEffect(() => {
    if (notificationsData) {
      dispatch(setNotifications(notificationsData))
    }
  }, [dispatch, notificationsData])

  useEffect(() => {
    if (unreadData !== null && unreadData !== undefined) {
      dispatch(setUnreadCount(unreadData))
    }
  }, [dispatch, unreadData])

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
    await submit(`/notifications/read/${notif.id}`, {}, { method: 'POST' })
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

  return (
    <header className="staffoo-header" style={{ backgroundColor: '#1a1a1a', padding: '12px 20px' }}>
      <div className="nav-left">
        <NavLink className="logo" to="/">
          <div className="logo-shield">
            <svg viewBox="0 0 36 36" fill="none">
              <path d="M18 3 L33 9 L33 21 C33 28 18 34 18 34 C18 34 3 28 3 21 L3 9 Z" fill="#0A7C6E" opacity="0.15" stroke="#0A7C6E" strokeWidth="1.5" />
              <path d="M18 8 L28 12 L28 21 C28 26 18 30 18 30 C18 30 8 26 8 21 L8 12 Z" fill="#0A7C6E" opacity="0.1" stroke="#0A7C6E" strokeWidth="1" />
              <text x="18" y="23" textAnchor="middle" fontFamily="'Bebas Neue'" fontSize="12" fill="#0A7C6E" letterSpacing="0">S</text>
            </svg>
          </div>
          <span className="logo-text" style={{ color: '#fff' }}>Staff<span>oo</span></span>
        </NavLink>
        <nav>
          <NavLink to="/" style={{ color: '#ccc' }}>Home</NavLink>
          <NavLink to="/contact-us" style={{ color: '#ccc' }}>Contact Us</NavLink>
          <NavLink to="/about-us" style={{ color: '#ccc' }}>About</NavLink>
        </nav>
      </div>

      <button
        className="mobile-menu-btn"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
        style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
      >
        <i className="fa fa-bars"></i>
      </button>

      <div className="nav-right" style={{ display: token && isMobileOpen ? 'flex' : undefined }}>
        {!token ? (
          <>
            <NavLink to="/login" className="btn-nav-ghost" style={{ color: '#fff', borderColor: '#fff' }}>Sign In</NavLink>
            <NavLink to="/register" className="btn-nav-solid">Register Free</NavLink>
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
                          <div style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>
                            {getNotificationMessage(notif)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#777', marginTop: '4px' }}>
                            {notif.created_at || 'Just now'}
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
                    to="/dashboard"
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
                    <i className="fa fa-home" style={{ marginRight: '8px' }}></i>
                    Dashboard
                  </NavLink>
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
                    <i className="fa fa-user-circle" style={{ marginRight: '8px' }}></i>
                    Edit Profile
                  </NavLink>
                  <NavLink
                    to="/payment-history"
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
                    <i className="fa fa-credit-card" style={{ marginRight: '8px' }}></i>
                    Payment History
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