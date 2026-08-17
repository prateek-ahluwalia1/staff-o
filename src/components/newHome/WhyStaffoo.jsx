
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import "../../styles/staffoo.css"

// WhyStaffoo is now "What you get on Staffoo" — the dark split section
function WhyStaffoo() {
  const { token } = useSelector((state) => state.auth)

  const postJobRoute = token ? "/edit-profile" : "/register"
  const findJobRoute = token ? "/edit-profile" : "/login"

  return (
    <section className="nh-section nh-section-tint">
      <div className="nh-wrap">
        <div className="nh-split-wrap">
          <div className="nh-split-head">
            <div className="nh-kicker">Two sides, one platform</div>
            <h2>What you get on Staffoo</h2>
            <p>Whether you're hiring or looking for work, here's exactly what's waiting for you.</p>
          </div>

          <div className="nh-split-grid">
            {/* CLIENT SIDE */}
            <div className="nh-split-col client">
              <span className="nh-split-tag">Client</span>
              <h3>Hire staff you can verify</h3>
              <p className="nh-split-sub">For individuals, businesses and agencies alike.</p>
              <ul className="nh-feat-list">
                <li><b>Post a job in 2 minutes</b> — one job or an ongoing roster, describe what you need.</li>
                <li><b>See real licence status</b> — every staff's subclass is checked, not self-reported.</li>
                <li><b>Compare rates &amp; reviews</b> — transparent hourly pricing, no hidden fees.</li>
                <li><b>Manage multiple sites</b> — running more than one contract? Track them all from one dashboard.</li>
                <li><b>Pay securely</b> — funds released once the job is confirmed complete.</li>
              </ul>
              <Link to={postJobRoute} className="nh-btn nh-btn-solid">Post your first job</Link>
            </div>

            {/* STAFF SIDE */}
            <div className="nh-split-col guard">
              <span className="nh-split-tag">Staff</span>
              <h3>Find jobs that fit your licence</h3>
              <p className="nh-split-sub">For licensed staff looking for consistent work.</p>
              <ul className="nh-feat-list">
                <li><b>Build a duty profile</b> — licences, experience and ratings, all in one place.</li>
                <li><b>Get matched automatically</b> — jobs filtered to your subclass and location.</li>
                <li><b>Set your own rate</b> — no agency cut eating into your pay.</li>
                <li><b>Apply in one tap</b> — no phone tag, no waiting on a callback.</li>
                <li><b>Get paid on time</b> — payment released as soon as a job is signed off.</li>
              </ul>
              <Link to={findJobRoute} className="nh-btn nh-btn-outline">Browse open jobs</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyStaffoo