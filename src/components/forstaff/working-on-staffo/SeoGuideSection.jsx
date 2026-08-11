import React from "react";

export default function SeoGuideSection() {
    return (
        <section className="stf-section">
            <div className="stf-wrap">
                <div className="stf-seo-grid">
                    <article className="stf-article">
                        <div className="stf-kicker">Before you join</div>
                        <h2>What you need to start picking up shifts on Staffoo</h2>
                        <p>
                            Staffoo is for licensed, independent staff. Three things need to be sorted before your account is switched on, and none of them cost anything on our side.
                        </p>

                        <h3>1. A current security licence</h3>
                        <p>
                            You need a valid licence for the state you're working in, and the class has to match the work. Static, retail and construction shifts generally need a security officer licence; door and event work needs a crowd control licence. Once verified, only the shifts you're eligible for appear in your feed.
                        </p>
                        <table>
                            <thead>
                                <tr>
                                    <th>State</th>
                                    <th>Licence you'll need</th>
                                    <th>Regulator</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>NSW</td><td>Security Licence Class 1A / 1C</td><td>NSW Police SLED</td></tr>
                                <tr><td>VIC</td><td>Private Security Individual Operator Licence</td><td>Victoria Police LRD</td></tr>
                                <tr><td>QLD</td><td>Security Provider Licence Class 1</td><td>Office of Fair Trading</td></tr>
                                <tr><td>WA</td><td>Security Officer / Crowd Controller licence</td><td>WA Police Licensing</td></tr>
                                <tr><td>SA</td><td>Security Agents Licence</td><td>Consumer &amp; Business Services</td></tr>
                            </tbody>
                        </table>

                        <h3>2. An ABN</h3>
                        <p>
                            You work as an independent contractor rather than an employee, so you need your own ABN to be paid. Registering one is free through the Australian Business Register and takes a few minutes.
                        </p>

                        <h3>3. Photo ID and a phone</h3>
                        <p>
                            Upload your licence, ID and ABN as photos from your phone — that's the whole verification pack. Our team checks it within one business day, and shifts open up the moment your account is switched on.
                        </p>

                        <div className="stf-callout">
                            <b>Note:</b> licence classes and conditions vary by state and change from time to time. Check current requirements with your state regulator, and make sure your own insurance arrangements suit the work you take on.
                        </div>
                    </article>

                    <aside className="stf-seo-aside">
                        <div className="stf-side-cta">
                            <h4>Documents ready?</h4>
                            <p>Upload them today, get verified within a business day, and start picking shifts near you.</p>
                            <a href="#" className="stf-btn stf-btn-solid stf-btn-block">Get verified</a>
                            <div className="stf-aside-module" style={{ marginTop: "16px", background: "transparent", border: "none", padding: 0 }}>
                                <a href="#">→ Licensing &amp; requirements</a>
                                <a href="#">→ How picking shifts works</a>
                                <a href="#">→ Getting paid</a>
                                <a href="#">→ Insurance &amp; your ABN</a>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
