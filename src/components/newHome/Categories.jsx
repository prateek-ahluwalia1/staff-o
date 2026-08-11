import React from 'react'
import { Link } from 'react-router-dom'
import "../../styles/staffoo.css"

const categories = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /></svg>,
    name: 'Event & crowd control',
    desc: 'Festivals, concerts, licensed venues',
    to: '/industries/event-crowd-control',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>,
    name: 'Corporate & office',
    desc: 'Reception, access control, patrols',
    to: '/industries/corporate-office',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.8"><path d="M4 20V10l8-6 8 6v10" /></svg>,
    name: 'Construction sites',
    desc: 'Overnight & weekend site security',
    to: '/industries/construction-sites',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-12z" /></svg>,
    name: 'Retail & loss prevention',
    desc: 'Stores, shopping centres',
    to: '/industries/retail-security',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></svg>,
    name: 'Mobile patrol',
    desc: 'Multi-site roaming coverage',
    to: '/industries/construction-sites',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.8"><path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7z" /></svg>,
    name: 'Residential & estates',
    desc: 'Gated communities, private homes',
    to: '/industries/residential-estates',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.8"><path d="M4 10h16M4 14h16M9 4v16M15 4v16" /></svg>,
    name: 'Concierge & front-of-house',
    desc: 'Buildings, hotels, front desks',
    to: '/industries/corporate-office',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.8"><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
    name: 'Cash-in-transit',
    desc: 'Class 1C licensed guards',
    to: '/industries/retail-security',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.8"><path d="M12 2l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L4 9l6-1z" /></svg>,
    name: 'Close protection',
    desc: 'Executive & VIP bodyguards',
    to: '/industries/event-crowd-control',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.8"><path d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 3" /></svg>,
    name: 'Alarm response',
    desc: 'Monitoring & rapid callout',
    to: '/industries/residential-estates',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0116 0v1" /></svg>,
    name: 'All categories',
    desc: 'Browse the full directory →',
    to: '/login',
  },
]

function Categories() {
  return (
    <section className="nh-section">
      <div className="nh-wrap">
        <div className="nh-section-head">
          <div className="nh-kicker">Categories</div>
          <h2>What kind of security do you need?</h2>
          <p>Every category maps to a real Australian security licence — so you know exactly who you're hiring.</p>
        </div>
        <div className="nh-cat-grid">
          {categories.map((cat) => (
            <Link key={cat.name} to={cat.to} className="nh-cat-card">
              <div className="nh-cat-icon">{cat.icon}</div>
              <h3>{cat.name}</h3>
              <p>{cat.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories