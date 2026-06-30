import React from 'react'
import "../../styles/staffoo.css"

function Testamonial() {
  return (
    <div><section className="test-sec">
      <div className="test-sec-bg">❝</div>
      <div className="test-head reveal">
        <div className="label">Stories from our community</div>
        <h2>Success Stories</h2>
      </div>
      <div className="test-grid">
        <div className="test-card reveal">
          <div className="test-stars">
            <span className="test-star">★</span><span className="test-star">★</span><span className="test-star">★</span><span className="test-star">★</span><span className="test-star">★</span>
          </div>
          <p className="test-quote"
            style={{ textTransform: "none" }}
          >Staffoo made hiring security staff effortless. Within hours we had verified professionals for our event. I can trust the quality of the staff every single time.</p>
          <div className="test-author">
            <div className="test-av av-a">D</div>
            <div>
              <div className="test-name">Dianna R.</div>
              <div className="test-role">Event Manager · Sydney</div>
            </div>
          </div>
        </div>
        <div className="test-card reveal reveal-d1">
          <div className="test-stars">
            <span className="test-star">★</span><span className="test-star">★</span><span className="test-star">★</span><span className="test-star">★</span><span className="test-star">★</span>
          </div>
          <p className="test-quote"
            style={{ textTransform: "none" }}
          >Posting jobs on Staffoo is straightforward and the staff profiles are thorough. We've filled multiple positions without any hassle. Highly recommended platform.</p>
          <div className="test-author">
            <div className="test-av av-b">M</div>
            <div>
              <div className="test-name">Michael T.</div>
              <div className="test-role">Operations Director · Melbourne</div>
            </div>
          </div>
        </div>
        <div className="test-card reveal reveal-d2">
          <div className="test-stars">
            <span className="test-star">★</span><span className="test-star">★</span><span className="test-star">★</span><span className="test-star">★</span><span className="test-star">★</span>
          </div>
          <p className="test-quote"
            style={{ textTransform: "none" }}
          >The Resource Partner dashboard is a lifesaver. Assigning jobs and monitoring progress is seamless and I always know our security needs are met by qualified staff.</p>
          <div className="test-author">
            <div className="test-av av-c">S</div>
            <div>
              <div className="test-name">Sarah K.</div>
              <div className="test-role">Resource Partner · Brisbane</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}

export default Testamonial