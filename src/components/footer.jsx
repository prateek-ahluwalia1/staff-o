// import React, { memo } from "react";
// import { Link } from "react-router-dom";

// const Footer = memo(function Footer() {
//   return (
//     <footer className="footer-modern jw-footer">
//       <style>{`
//         .jw-footer {
//           position: relative;
//           background: linear-gradient(135deg, #0A7C6E 0%, #075e53 100%) !important;
//           isolation: isolate;
//           overflow: hidden;
//         }
//         .jw-footer::before {
//           content: "";
//           position: absolute; top: 0; left: 0; right: 0; height: 3px;
//           background: linear-gradient(90deg, #6ee7d8, #0A7C6E 40%, #0a1930);
//           z-index: 1;
//         }
//         .jw-footer::after {
//           content: "";
//           position: absolute; bottom: -80px; right: -80px; width: 260px; height: 260px; border-radius: 50%;
//           background: radial-gradient(circle, rgba(10,25,48,0.35) 0%, rgba(10,25,48,0) 70%);
//           z-index: -1;
//         }
//         .jw-footer .footer-title {
//           color: #fff !important;
//           font-weight: 800 !important;
//           font-size: 1.05rem !important;
//           letter-spacing: 0.2px;
//           margin-bottom: 18px !important;
//           position: relative;
//           padding-bottom: 10px;
//         }
//         .jw-footer .footer-title::after {
//           content: "";
//           position: absolute; left: 0; bottom: 0; width: 30px; height: 2px;
//           background: rgba(255,255,255,0.5); border-radius: 2px;
//         }
//         .jw-footer .footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
//         .jw-footer .footer-links li { display: flex; align-items: center; }
//         .jw-footer .footer-links a {
//           color: rgba(255,255,255,0.78) !important;
//           text-decoration: none !important;
//           font-size: 0.9rem;
//           transition: color 0.15s, padding-left 0.15s;
//         }
//         .jw-footer .footer-links a:hover { color: #fff !important; padding-left: 4px; }
//         .jw-footer .footer-links li p {
//           color: rgba(255,255,255,0.78) !important;
//           margin: 0; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;
//         }
//         .jw-footer .footer-links li p::before {
//           content: "\\f00c";
//           font-family: "Font Awesome 6 Free"; font-weight: 900;
//           font-size: 9px; color: #6ee7d8; flex-shrink: 0;
//         }
//         .jw-footer .footer-contact { list-style: none; padding: 0; margin: 0 0 18px; display: flex; flex-direction: column; gap: 12px; }
//         .jw-footer .footer-contact li {
//           display: flex; align-items: flex-start; gap: 10px;
//           color: rgba(255,255,255,0.85) !important; font-size: 0.88rem; line-height: 1.4;
//         }
//         .jw-footer .footer-contact li i {
//           width: 26px; height: 26px; border-radius: 8px; background: rgba(255,255,255,0.12);
//           display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; margin-top: 1px;
//         }
//         .jw-footer .footer-contact a { color: rgba(255,255,255,0.85) !important; text-decoration: none !important; transition: color 0.15s; }
//         .jw-footer .footer-contact a:hover { color: #fff !important; }
//         .jw-footer .footer-social { display: flex; gap: 10px; }
//         .jw-footer .footer-social a {
//           width: 34px; height: 34px; border-radius: 50%;
//           background: rgba(255,255,255,0.12) !important; border: 1px solid rgba(255,255,255,0.18);
//           display: flex; align-items: center; justify-content: center;
//           color: #fff !important; transition: all 0.15s;
//         }
//         .jw-footer .footer-social a:hover { background: #fff !important; color: #0A7C6E !important; transform: translateY(-2px); }

//         @media (max-width: 768px) {
//           .jw-footer .footer-links {
//             gap: 14px;
//           }
//           .jw-footer .footer-links a,
//           .jw-footer .footer-links li,
//           .jw-footer .footer-links li p {
//             line-height: 1.65;
//           }
//           .jw-footer .footer-contact {
//             gap: 16px;
//           }
//           .jw-footer .footer-contact li {
//             line-height: 1.65;
//           }
//         }
//       `}</style>
//       <div className="footer-main">
//         <div className="container">
//           <div className="row g-4">
//             {/* Quick Links */}
//             <div className="col-sm-6 col-lg-3">
//               <h5 className="footer-title">Quick Links</h5>
//               <ul className="footer-links">
//                 <li>
//                   <Link to="/">Home</Link>
//                 </li>
//                 <li>
//                   <Link to="/contact-us">Contact Us</Link>
//                 </li>
//                 <li>
//                   <Link to="/faqs">FAQs</Link>
//                 </li>
//                 <li>
//                   <Link to="/about-us">About Us</Link>
//                 </li>
//               </ul>
//             </div>

//             {/* Resources */}
//             <div className="col-sm-6 col-lg-3">
//               <h5 className="footer-title">Resources</h5>
//               <ul className="footer-links">
//                 {/* <li>
//                   <Link to="/blog">Our Blog</Link>
//                 </li> */}
//                 {/* <li>
//                   <Link to="/career-advice">Career Advice</Link>
//                 </li> */}
//                 {/* <li>
//                   <Link to="/help-center">Help Center</Link>
//                 </li> */}
//                 <li>
//                   <Link to="/privacy-policy">Privacy Policy</Link>
//                 </li>
//                 <li>
//                   <Link to="/terms-of-use">Terms Of Use</Link>
//                 </li>
//                 {/* <li>
//                   <Link to="/employers">For Employers</Link>
//                 </li> */}
//               </ul>
//             </div>

//             {/* Job Types */}
//             <div className="col-sm-6 col-lg-3">
//               <h5 className="footer-title">Job Types</h5>
//               <ul className="footer-links">
//                 <li>
//                   <p>Security License</p>
//                 </li>
//                 <li>
//                   <p>MISC Time License</p>
//                 </li>
//                 <li>
//                   <p>Working With Children</p>
//                 </li>
//                 <li>
//                   <p>First Aid</p>
//                 </li>
//                 <li>
//                   <p>CPR</p>
//                 </li>
//                 <li>
//                   <p>White Card</p>
//                 </li>
//                 <li>
//                   <p>Traffic Controller</p>
//                 </li>
//               </ul>
//             </div>

//             {/* Contact Us + Social */}
//             <div className="col-sm-6 col-lg-3">
//               <h5 className="footer-title">Contact Us</h5>
//               <ul className="footer-contact">
//                 <li>
//                   <i className="fa fa-map-marker" aria-hidden="true"></i>
//                   21 Tanglewood Bvd Truganina VIC 3029
//                 </li>
//                 <li>
//                   <i className="fa fa-envelope" aria-hidden="true"></i>
//                   <Link to="mailto:admin@staffoo.com.au"
//                     style={{ textTransform: "none" }}
//                   >admin@staffoo.com.au</Link>
//                 </li>
//                 <li>
//                   <i className="fa fa-phone" aria-hidden="true"></i>
//                   <Link to="tel:1800 782 366">1800 782 366</Link>
//                 </li>
//               </ul>

//               <div className="footer-social">
//                 <a href="https://www.facebook.com/profile.php?id=61582204185867"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   aria-label="Facebook"
//                 >
//                   <i className="fab fa-facebook" aria-hidden="true"></i>
//                 </a>
//                 <a href="https://www.instagram.com/staffoo_/"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   aria-label="Instagram"
//                 >
//                   <i className="fab fa-instagram" aria-hidden="true"></i>
//                 </a>
//                 <a href="https://www.linkedin.com/company/staff-o/"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   aria-label="LinkedIn"
//                 >
//                   <i className="fab fa-linkedin" aria-hidden="true"></i>
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// });

// export default Footer;


import { Link } from 'react-router-dom'
// import staffologo from "../../assets/images/staffo.png"


import staffologo from "../assets/images/staffo.png"

// import "../../styles/staffoo.css"


import "../styles/staffoo.css"

function Footer() {
  return (
    <footer className="nh-footer" >
      <style>{`
        .nh-footer {
          background: var(--nh-ink, #14181C) !important;
          color: #AAB3AE !important;
          padding: 60px 0 28px !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          box-sizing: border-box !important;
        }

        .nh-footer * {
          box-sizing: border-box !important;
        }

        .nh-footer .nh-wrap {
          max-width: 1200px !important;
          margin: 0 auto !important;
          padding: 0 0px 0 80px !important;
        }

        /* Brand container is 1.5fr, remaining 5 containers are 1fr */
        .nh-footer .nh-foot-grid {
          display: grid !important;
          grid-template-columns: 1.5fr repeat(5, minmax(0, 1fr)) !important;
          gap: 16px !important;
          align-items: flex-start !important;
          margin-bottom: 42px !important;
        }

        .nh-footer .nh-foot-col,
        .nh-footer .nh-foot-grid > div:first-child {
          max-width: 100% !important;
          width: 100% !important;
          flex: none !important;
        }

        .nh-footer .nh-foot-logo {
          display: flex !important;
          align-items: center !important;
          margin-bottom: 8px !important;
            margin-top: -8px !important;     /* 👈 Yeh line add krein (-4px se -10px tak adjust kar sakte hain) */

        }

        .nh-footer .nh-foot-logo-img {
          height: 34px !important;
          width: auto !important;
          display: block !important;
        }

        .nh-footer .nh-foot-brand p {
          font-size: 13px !important;
          line-height: 1.55 !important;
          color: #AAB3AE !important;
          margin: 0 0 16px !important;
        }

        .nh-footer .nh-foot-col h4 {
          font-family: 'Inter', sans-serif !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #ffffff !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          margin: 0 0 14px !important;
        }

        .nh-footer .nh-foot-col:not(.nh-foot-brand) a {
          display: block !important;
          font-size: 13.5px !important;
          line-height: 1.5 !important;
          padding: 5px 0 !important;
          color: #AAB3AE !important;
          text-decoration: none !important;
          transition: color 0.15s ease, transform 0.15s ease !important;
        }

        .nh-footer .nh-foot-col:not(.nh-foot-brand) a:hover {
          color: var(--nh-green-light, #E1F3F0) !important;
          transform: translateX(2px) !important;
        }

        .nh-footer .nh-foot-social {
          display: flex !important;
          gap: 10px !important;
          align-items: center !important;
          margin-top: 12px !important;
        }

        .nh-footer .nh-foot-social a {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          width: 34px !important;
          height: 34px !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 8px !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #C9D2CD !important;
          font-size: 15px !important;
          line-height: 1 !important;
          text-decoration: none !important;
          transition: all 0.2s ease !important;
          box-sizing: border-box !important;
        }

        .nh-footer .nh-foot-social a:hover {
          color: #ffffff !important;
          background: var(--nh-green, #0A7C6E) !important;
          border-color: var(--nh-green, #0A7C6E) !important;
          transform: translateY(-2px) !important;
        }

        .nh-footer .nh-foot-social a i,
        .nh-footer .nh-foot-social a .fab,
        .nh-footer .nh-foot-social a [class*="fa-"] {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          margin: 0 auto !important;
          padding: 0 !important;
          line-height: 1 !important;
          font-size: 15px !important;
          width: 100% !important;
          height: auto !important;
        }

        .nh-footer .nh-foot-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
          padding-top: 22px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          flex-wrap: wrap !important;
          gap: 12px !important;
          font-size: 12.5px !important;
          color: #8D9A92 !important;
        }

        .nh-footer .nh-foot-bottom a {
          color: #AAB3AE !important;
          text-decoration: none !important;
          transition: color 0.15s ease !important;
        }

        .nh-footer .nh-foot-bottom a:hover {
          color: #ffffff !important;
        }

        /* ===== TABLET RESPONSIVENESS (681px - 1024px) ===== */
        @media (max-width: 1024px) and (min-width: 681px) {
          .nh-footer {
            padding: 50px 0 24px !important;
          }
          .nh-footer .nh-foot-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 28px 20px !important;
          }
        }

        /* ===== MOBILE RESPONSIVENESS (up to 680px) ===== */
        @media (max-width: 680px) {
          .nh-footer {
            padding: 44px 0 24px !important;
          }
          .nh-footer .nh-wrap {
            padding: 0 18px !important;
          }
          .nh-footer .nh-foot-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 24px 16px !important;
            margin-bottom: 32px !important;
          }
          .nh-footer .nh-foot-brand {
            grid-column: 1 / -1 !important;
            margin-bottom: 8px !important;
          }
          .nh-footer .nh-foot-brand p {
            max-width: 100% !important;
          }
          .nh-footer .nh-foot-bottom {
            flex-direction: column !important;
            text-align: center !important;
            justify-content: center !important;
            gap: 10px !important;
          }
        }

        /* ===== SMALL MOBILE (<= 400px) ===== */
        @media (max-width: 400px) {
          .nh-footer .nh-foot-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
      `}</style>

      <div className="nh-wrap">
        <div className="nh-foot-grid">
          {/* Brand */}
          <div className="nh-foot-col nh-foot-brand">
            <div className="nh-foot-logo">
              <img src={staffologo} alt="Staffoo" className="nh-foot-logo-img" />
            </div>
            <p>
              A platform connecting clients, individuals, businesses and agencies with
              independent, licensed security staff across Australia.
            </p>
            <div className="nh-foot-social">
              <a href="https://www.facebook.com/StaffooAU/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="fab fa-facebook" />
              </a>
              <a href="https://www.instagram.com/staffoo_au/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="fab fa-instagram" />
              </a>
              <a href="https://www.linkedin.com/company/staff-o/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin" />
              </a>
            </div>
          </div>

          <div className="nh-foot-col">
            <h4>Industries</h4>
            <Link to="/industries/event-crowd-control">Events and Crowd Control</Link>
            <Link to="/industries/retail-security">Retail Security</Link>
            <Link to="/industries/corporate-office">Corporate and Office</Link>
            <Link to="/industries/construction-sites">Construction Sites</Link>
            <Link to="/industries/residential-estates">Residential and Estates</Link>
          </div>
          {/* For clients */}
          <div className="nh-foot-col">
            <h4>For client</h4>
            <Link to="/forclients/post-job">Post a job</Link>
            <Link to="/forclients/how-it-works">How it works</Link>
            <Link to="/client-terms" target="_blank" rel="noopener noreferrer">Client Terms</Link>
          </div>

          {/* For staff */}
          <div className="nh-foot-col">
            <h4>For staff</h4>
            <Link to="/forstaff/working-staff">Working on Staffoo</Link>
            <Link to="/forstaff/how-to-apply">How to apply</Link>
            <Link to="/staff-terms" target="_blank" rel="noopener noreferrer">Staff Terms</Link>
          </div>

          {/* For Partner */}
          <div className="nh-foot-col">
            <h4>For Partner</h4>
            <Link to="/forpartner/become-partner">Resource Partners</Link>
            <Link to="/partner-terms" target="_blank" rel="noopener noreferrer">Partner Terms</Link>
          </div>

          {/* Company */}
          <div className="nh-foot-col">
            <h4>Company</h4>
            <Link to="/about-us">About</Link>
            <Link to="/contact-us">Contact</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-use">Terms of Use</Link>
          </div>
        </div>

        <div className="nh-foot-bottom">
          <span>© 2026 STAFFOO PTY LTD · ABN 48 613 317 838 · All rights reserved.</span>
          <span>
            <Link to="/privacy-policy" style={{ color: '#AAB3AE', textDecoration: 'none', marginRight: '16px' }}>Privacy</Link>
            <Link to="/terms-of-use" style={{ color: '#AAB3AE', textDecoration: 'none', marginRight: '16px' }}>Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer