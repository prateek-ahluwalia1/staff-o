import React from 'react'
import "../../styles/staffoo.css"

// Ticker is now the Stats Bar — 4 platform metrics
function Ticker() {
  return (
    <div className="nh-stats-bar">
      <div className="nh-wrap nh-stats-grid">
        <div className="nh-stat">
          <b>2,000+</b>
          <span>jobs filled</span>
        </div>
        <div className="nh-stat">
          <b>1,200+</b>
          <span>verified staff</span>
        </div>
        <div className="nh-stat">
          <b>4.8★</b>
          <span>average rating</span>
        </div>
        <div className="nh-stat">
          <b>34 min</b>
          <span>avg. time to fill</span>
        </div>
      </div>
    </div>
  )
}

export default Ticker