
import React from "react";
import Header from "../../components/newHome/Header";
import Footer from "../../components/newHome/Footer";
import teamsimg from "../../assets/images/teams.png";

export default function RetailSecurity() {
    const features = [
        {
            icon: "fa-map-marker",
            title: "GPS Guard Tracking",
            desc: "Live tracking and geo-fenced check-ins ensure guards are always on-site and visible."
        },
        {
            icon: "fa-clock-o",
            title: "Smart Scheduling",
            desc: "Automated shift allocation and availability matching for seamless operations."
        },
        {
            icon: "fa-id-card",
            title: "Licence Verification",
            desc: "Automatic compliance checks keep every security professional deployment-ready."
        },
        {
            icon: "fa-bar-chart",
            title: "Attendance Analytics",
            desc: "Detailed reports for audits, attendance, and workforce performance."
        },
        {
            icon: "fa-file-text-o",
            title: "Payroll Management",
            desc: "Automated payslips and invoicing reduce administration overhead."
        },
        {
            icon: "fa-handshake-o",
            title: "Digital Agreements",
            desc: "Clear acceptance of shifts and responsibilities for both clients and guards."
        }
    ];

    const audiences = [
        {
            icon: "fa-building",
            title: "Retail Security Providers",
            desc: "Scale staffing requirements without increasing operational overhead."
        },
        {
            icon: "fa-user",
            title: "Independent Guards",
            desc: "Access reliable shifts and receive timely payments every time."
        },
        {
            icon: "fa-calendar",
            title: "Venue Managers",
            desc: "Book qualified professionals quickly with full visibility."
        }
    ];

    const process = [
        {
            title: "Submit Your Brief",
            desc: "Provide dates, locations and staffing requirements."
        },
        {
            title: "Match & Verify",
            desc: "We verify licences and assign suitable professionals."
        },
        {
            title: "Deploy Staff",
            desc: "Guards confirm and arrive prepared for duty."
        },
        {
            title: "Track & Manage",
            desc: "Monitor activity while payroll and invoicing are handled automatically."
        }
    ];

    const related = [
        "Corporate Security",
        "Event Security",
        "Warehouse & Logistics Security"
    ];

    return (
        <>
            <Header />

            <style>{`
        .stf-page-wrapper{
          background:#0d1216;
          color:#fff;
          min-height:100vh;
          padding-bottom:80px;
        }

        .stf-container{
          max-width:1200px;
          margin:auto;
          padding:0 24px;
        }

        .stf-hero{
          text-align:center;
          padding:120px 0 60px;
        }

        .stf-badge{
          color:#0A7C6E;
          background:rgba(10,124,110,.1);
          padding:8px 16px;
          border-radius:20px;
          display:inline-flex;
          gap:10px;
          font-size:.8rem;
          font-weight:700;
          margin-bottom:24px;
        }

        .stf-hero h1{
          font-size:3.5rem;
          font-weight:800;
          margin-bottom:24px;
        }

        .stf-hero p{
          color:#9ca3af;
          max-width:700px;
          margin:auto;
          line-height:1.7;
        }

        .stf-card{
          background:#12191d;
          border:1px solid #1f2933;
          border-radius:8px;
          padding:48px;
          margin-bottom:32px;
        }

        .stf-card h2{
          font-size:2.2rem;
          margin-bottom:24px;
        }

        .stf-card p{
          color:#9ca3af;
          line-height:1.7;
        }

        .stf-split{
          display:flex;
          gap:48px;
          align-items:center;
        }

        .stf-split-text{
          flex:1.2;
        }

        .stf-split-img{
          flex:1;
        }

        .stf-split-img img{
          width:100%;
          border-radius:8px;
        }

        .stf-grid-3{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:24px;
          margin-bottom:32px;
        }

        .stf-highlight-card{
          background:#12191d;
          border:1px solid #1f2933;
          border-radius:8px;
          padding:32px;
          transition:.2s;
        }

        .stf-highlight-card:hover{
          border-color:#0A7C6E;
          transform:translateY(-5px);
        }

        .stf-highlight-header{
          display:flex;
          gap:16px;
          align-items:center;
          margin-bottom:16px;
        }

        .stf-highlight-icon{
          color:#0A7C6E;
          font-size:1.5rem;
        }

        .stf-highlight-card h3{
          margin:0;
        }

        .stf-highlight-card p{
          color:#9ca3af;
          line-height:1.6;
        }

        .process-number{
          width:40px;
          height:40px;
          background:#0A7C6E;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          margin-bottom:16px;
          font-weight:700;
        }

        .cta-card{
          text-align:center;
        }

        .cta-btn{
          background:#0A7C6E;
          border:none;
          color:white;
          padding:14px 28px;
          border-radius:6px;
          margin-top:20px;
          cursor:pointer;
        }

        @media(max-width:992px){
          .stf-split{
            flex-direction:column;
          }

          .stf-grid-3{
            grid-template-columns:repeat(2,1fr);
          }
        }

        @media(max-width:768px){
          .stf-grid-3{
            grid-template-columns:1fr;
          }

          .stf-card{
            padding:32px 24px;
          }

          .stf-hero h1{
            font-size:2.5rem;
          }
        }
      `}</style>

            <div className="stf-page-wrapper">

                {/* Hero */}
                <section className="stf-hero">
                    <div className="stf-container">
                        <span className="stf-badge">
                            <i className="fa fa-shield"></i>
                            Retail Security
                        </span>

                        <h1>Professional Retail Security Staffing</h1>

                        <p>
                            Reliable and verified retail security personnel for stores,
                            shopping centres and commercial environments.
                        </p>
                    </div>
                </section>

                <div className="stf-container">

                    {/* Overview */}
                    <div className="stf-card">
                        <div className="stf-split">
                            <div className="stf-split-text">
                                <h2>Everything You Need To Protect Your Business</h2>

                                <p>
                                    Staffoo manages the complete staffing cycle, from licence
                                    verification and scheduling to deployment and payroll.
                                </p>

                                <p>
                                    Focus on your customers while our experienced professionals
                                    maintain safety and compliance.
                                </p>
                            </div>

                            <div className="stf-split-img">
                                <img src={teamsimg} alt="Retail Security" />
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="stf-grid-3">
                        {features.map((item, index) => (
                            <div className="stf-highlight-card" key={index}>
                                <div className="stf-highlight-header">
                                    <i className={`fa ${item.icon} stf-highlight-icon`}></i>
                                    <h3>{item.title}</h3>
                                </div>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Who It's For */}
                    <div className="stf-card">
                        <h2>Who It's For</h2>

                        <div className="stf-grid-3">
                            {audiences.map((item, index) => (
                                <div className="stf-highlight-card" key={index}>
                                    <div className="stf-highlight-header">
                                        <i className={`fa ${item.icon} stf-highlight-icon`}></i>
                                        <h3>{item.title}</h3>
                                    </div>

                                    <p>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Process */}
                    <div className="stf-card">
                        <h2>How It Works</h2>

                        <div className="stf-grid-3">
                            {process.map((step, index) => (
                                <div className="stf-highlight-card" key={index}>
                                    <div className="process-number">{index + 1}</div>

                                    <h3>{step.title}</h3>

                                    <p>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Related Solutions */}
                    <div className="stf-card">
                        <h2>Related Solutions</h2>

                        <div className="stf-grid-3">
                            {related.map((item, index) => (
                                <div className="stf-highlight-card" key={index}>
                                    <h3>{item}</h3>
                                    <p>Explore this security solution.</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="stf-card cta-card">
                        <h2>Ready To Secure Your Business?</h2>

                        <p>
                            Speak with our specialists and receive a tailored security
                            solution for your organisation.
                        </p>

                        <button className="cta-btn">
                            Request Security Staff
                        </button>
                    </div>

                </div>
            </div>

            <Footer />
        </>
    );
}

