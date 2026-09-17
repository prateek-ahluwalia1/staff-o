import React from 'react'
import "../../styles/staffoo.css"

const categories = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0a7c6e" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /></svg>,
    name: 'Event and crowd control',
    desc: 'Festivals, concerts, licensed venues',
  },

  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0a7c6e" strokeWidth="1.8"><path d="M4 20V10l8-6 8 6v10" /></svg>,
    name: 'Construction sites',
    desc: 'Overnight and weekend site security',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0a7c6e" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-12z" /></svg>,
    name: 'Retail and loss prevention',
    desc: 'Stores, shopping centres',
  },

  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0a7c6e" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-12z" /></svg>,
    name: 'Corporate Offices',
    desc: 'Professional environment security',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0a7c6e" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-12z" /></svg>,
    name: 'Hospitality venues',
    desc: 'Professional environment security',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="#0a7c6e" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-12z" /></svg>,
    name: 'Government and public sites',
    desc: 'Professional environment security',
  },


]

function Categories() {
  return (
    <section className="nh-section">
      <div className="nh-wrap">
        <div className="nh-section-head">
          <div className="nh-kicker">Categories</div>
          <h2>What kind of security do you need?</h2>
          <p>Every category maps to a real Australian security license so you know exactly who you're hiring.</p>
        </div>
        <div className="nh-cat-grid">
          {categories.map((cat) => (
            <div key={cat.name} className="nh-cat-card">
              <div className="nh-cat-icon">{cat.icon}</div>
              <h3>{cat.name}</h3>
              <p>{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories