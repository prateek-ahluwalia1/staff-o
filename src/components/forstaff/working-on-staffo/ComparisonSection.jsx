import React from "react";

export default function ComparisonSection() {
    return (
        <>
            {/* Mid-Page CTA Strip */}
            <section style={{ padding: "40px 0 0" }}>
                <div className="stf-wrap">
                    <div className="stf-cta-strip">
                        <div>
                            <h3>Licence and ABN ready?</h3>
                            <p>Upload them today and you could be accepting shifts tomorrow.</p>
                        </div>
                        <a href="#" className="stf-btn stf-btn-solid stf-btn-lg">Get verified</a>
                    </div>
                </div>
            </section>

            {/* Comparison Table (Staffoo vs Agency) */}
            <section className="stf-section">
                <div className="stf-wrap">
                    <div className="stf-section-head">
                        <div className="stf-kicker">Staffoo vs an agency</div>
                        <h2>What changes when there's no agency in the middle</h2>
                        <p>
                            Agencies exist to coordinate guards on the client's behalf, and that coordination gets paid for out of the gap between what the client pays and what you receive. Staffoo removes the gap: the client posts a rate, you see it, and you're paid it in full.
                        </p>
                    </div>
                    <table className="stf-compare">
                        <thead>
                            <tr>
                                <th></th>
                                <th className="them">Working through an agency</th>
                                <th className="us">Working on Staffoo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="label">Knowing the pay</td>
                                <td>Often confirmed after you've committed</td>
                                <td className="us"><span className="tick">✓</span>Rate is on the shift before you accept</td>
                            </tr>
                            <tr>
                                <td className="label">What reaches you</td>
                                <td>Agency margin comes off the top</td>
                                <td className="us"><span className="tick">✓</span>Zero commission — the posted rate is yours</td>
                            </tr>
                            <tr>
                                <td className="label">Getting the work</td>
                                <td>Assigned to you, often at short notice</td>
                                <td className="us"><span className="tick">✓</span>You browse and accept what suits you</td>
                            </tr>
                            <tr>
                                <td className="label">Confirmation</td>
                                <td>Wait on a callback or a roster update</td>
                                <td className="us"><span className="tick">✓</span>Instant — accepting books the shift</td>
                            </tr>
                            <tr>
                                <td className="label">Getting paid</td>
                                <td>Invoice and wait, sometimes 30 days</td>
                                <td className="us"><span className="tick">✓</span>Funds held upfront, released after sign-off</td>
                            </tr>
                            <tr>
                                <td className="label">Your reputation</td>
                                <td>Stays with the agency</td>
                                <td className="us"><span className="tick">✓</span>Reviews build on your own profile</td>
                            </tr>
                        </tbody>
                    </table>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "20px" }}>
                        Staffoo doesn't employ or roster staff. You work as an independent contractor under your own ABN and decide which shifts to take.
                    </p>
                </div>
            </section>
        </>
    );
}
