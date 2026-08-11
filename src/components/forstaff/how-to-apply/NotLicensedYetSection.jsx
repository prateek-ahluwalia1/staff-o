import React from "react";

export default function NotLicensedYetSection() {
    return (
        <section className="stf-section" style={{ background: "var(--tint)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
            <div className="stf-wrap">
                <div className="stf-seo-grid">
                    <article className="stf-article">
                        <div className="stf-kicker">Not licensed yet</div>
                        <h2>You'll need a security licence before you can apply</h2>
                        <p>
                            A current licence is the one requirement we can't waive — clients are legally required to use licensed guards, so there's no version of the application that works without one. If you don't have yours yet, that's the step to sort first.
                        </p>
                        <p>
                            It's a shorter process than most people expect: an approved course, a police check, then an application to your state regulator. Most people are licensed within a couple of months of starting.
                        </p>
                        <p>
                            Our licensing &amp; requirements guide covers which licence class matches which type of work, who the regulator is in each state and territory, what the eligibility rules are, and how renewals and interstate recognition work.
                        </p>
                        <div className="stf-callout" style={{ marginTop: "20px" }}>
                            <b>One thing worth doing while you wait on the licence:</b> get your first aid, CPR and Working with Children Check sorted. They're quick, they're on the document list above anyway, and they open up shifts other guards can't take.
                        </div>
                    </article>

                    <aside className="stf-seo-aside">
                        <div className="stf-side-cta">
                            <h4>Licensing &amp; Requirements Guide</h4>
                            <p>Read our state-by-state guide on course providers, costs, and state regulator requirements.</p>
                            <a href="#" className="stf-btn stf-btn-solid stf-btn-block">Read licensing guide</a>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}
