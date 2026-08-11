import React from "react";

export default function AfterActivationSection() {
    return (
        <section className="stf-section">
            <div className="stf-wrap">
                <div className="stf-section-head">
                    <div className="stf-kicker">Once you're live</div>
                    <h2>What your first day on the platform looks like</h2>
                    <p>
                        Submitting the last form switches your profile on immediately. Shifts appear filtered to your licence and sorted by distance from your suburb, with the pay rate on every listing before you commit to anything.
                    </p>
                </div>
                <div className="stf-inside-grid">
                    <div className="stf-inside-card">
                        <div className="stf-inside-shot">
                            <div className="stf-mini-box">
                                <div className="stf-mini-dot"></div>
                                <div className="stf-mini-line" style={{ width: "48%" }}></div>
                                <span className="stf-mini-pill">$52/hr</span>
                            </div>
                            <div className="stf-mini-box">
                                <div className="stf-mini-dot" style={{ background: "linear-gradient(160deg,#14181C,#075E53)" }}></div>
                                <div className="stf-mini-line" style={{ width: "56%" }}></div>
                                <span className="stf-mini-pill">$47/hr</span>
                            </div>
                            <div className="stf-mini-box">
                                <div className="stf-mini-dot" style={{ background: "linear-gradient(160deg,#075E53,#0A7C6E)" }}></div>
                                <div className="stf-mini-line" style={{ width: "42%" }}></div>
                                <span className="stf-mini-pill">$44/hr</span>
                            </div>
                        </div>
                        <div className="stf-inside-body">
                            <h3>Browse shifts near you</h3>
                            <p>Only jobs your licence and certificates cover, sorted by distance. Filter by rate, shift type and day, then save the search for alerts.</p>
                        </div>
                    </div>

                    <div className="stf-inside-card">
                        <div className="stf-inside-shot">
                            <div className="stf-mini-line short"></div>
                            <div className="stf-mini-box">
                                <div className="stf-mini-line" style={{ width: "58%" }}></div>
                                <span className="stf-mini-pill">Booked</span>
                            </div>
                            <div className="stf-mini-box">
                                <div className="stf-mini-line" style={{ width: "44%" }}></div>
                                <span className="stf-mini-pill">Site brief</span>
                            </div>
                            <div className="stf-mini-line accent" style={{ height: "26px", borderRadius: "8px", width: "46%" }}></div>
                        </div>
                        <div className="stf-inside-body">
                            <h3>Accept and it's yours</h3>
                            <p>No application, no approval wait. The site address, contact and run sheet appear the moment you accept.</p>
                        </div>
                    </div>

                    <div className="stf-inside-card">
                        <div className="stf-inside-shot">
                            <div className="stf-mini-box">
                                <div className="stf-mini-line" style={{ width: "38%" }}></div>
                                <span className="stf-mini-pill">Checked in</span>
                            </div>
                            <div className="stf-mini-line" style={{ width: "70%" }}></div>
                            <div className="stf-mini-line short"></div>
                            <div className="stf-mini-box">
                                <div className="stf-mini-line" style={{ width: "32%" }}></div>
                                <span className="stf-mini-pill">Paid</span>
                            </div>
                        </div>
                        <div className="stf-inside-body">
                            <h3>Work it, then get paid</h3>
                            <p>Check in on site from your phone. Once the client signs off, your pay is released — usually within two business days.</p>
                        </div>
                    </div>
                </div>
                <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", marginTop: "26px" }}>
                    More on what the day-to-day looks like on <a href="/forstaff/working-staff" style={{ color: "var(--green-dark)", fontWeight: 600, borderBottom: "1px solid #BFDCCC" }}>working on Staffoo</a>, or read <a href="#" style={{ color: "var(--green-dark)", fontWeight: 600, borderBottom: "1px solid #BFDCCC" }}>how getting paid works</a>.
                </p>
            </div>
        </section>
    );
}
