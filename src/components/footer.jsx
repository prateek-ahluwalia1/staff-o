export default function Footer() {
  return (
    <footer className="footer-modern">
      <div className="footer-main">
        <div className="container">
          <div className="row g-4">
            {/* Quick Links */}
            <div className="col-sm-6 col-lg-3">
              <h5 className="footer-title">Quick Links</h5>
              <ul className="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="/contact-us">Contact Us</a></li>
                {/* ... */}
              </ul>
            </div>

            {/* Jobs By Functional Area */}
            <div className="col-sm-6 col-lg-3">
              <h5 className="footer-title">Jobs By Functional Area</h5>
              <ul className="footer-links">{/* ... */}</ul>
            </div>

            {/* Jobs By Industry */}
            <div className="col-sm-6 col-lg-3">{/* ... */}</div>

            {/* Contact Us */}
            <div className="col-sm-6 col-lg-3">
              <h5 className="footer-title">Contact Us</h5>
              <ul className="footer-contact">{/* ... */}</ul>
              <div className="footer-social">{/* social icons */}</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}