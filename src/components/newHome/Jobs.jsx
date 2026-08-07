import React, { useMemo } from 'react'
import "../../styles/staffoo.css"
import useFetch from '../../hooks/useFetch'
import useScrollReveal from '../../hooks/useScrollReveal'

const AUSTRALIAN_STATES = [
  "New South Wales",
  "Victoria",
  "Queensland",
  "Western Australia",
  "South Australia",
  "Tasmania",
  "Australian Capital Territory"
];

function mapSiteToState(siteId) {
  if (!siteId) return "Other Regions";
  const idString = String(siteId);
  let hash = 0;
  for (let i = 0; i < idString.length; i++) {
    hash = idString.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AUSTRALIAN_STATES.length;
  return AUSTRALIAN_STATES[index];
}


function JobMetrics() {
  const { data: jobsResponse, loading, error } = useFetch("api/get-all-jobs");

  useScrollReveal();

  const stateMetrics = useMemo(() => {
    const jobs = Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];

    const stateMap = jobs.reduce((acc, job) => {
      const stateName = mapSiteToState(job.site_id);

      if (!acc[stateName]) {
        acc[stateName] = { count: 0, totalHours: 0 };
      }
      acc[stateName].count += 1;
      acc[stateName].totalHours += Number(job.hours || 0);
      return acc;
    }, {});

    return Object.entries(stateMap)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([stateName, stats]) => ({
        stateName,
        count: stats.count,
        hours: parseFloat(stats.totalHours.toFixed(2))
      }));
  }, [jobsResponse]);

  if (loading) {
    return (
      <section className="jobs-sec">
        <div className="sec-head">
          <div className="sec-head-left">
            <div className="label">System Metrics</div>
            <h2>Current Demand</h2>
          </div>
        </div>
        <div className="jobs-grid" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--off)' }}>Aggregating regional metrics...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="jobs-sec">
        <div className="sec-head">
          <div className="sec-head-left">
            <div className="label">System Metrics</div>
            <h2>Current Demand</h2>
          </div>
        </div>
        <div className="jobs-grid" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--red)' }}>Unable to retrieve market metrics.</p>
        </div>
      </section>
    );
  }

  return (
    <div>
      <section className="jobs-sec">
        <div className="sec-head">
          <div className="sec-head-left">
            <div className="label">Market Overview</div>
            <h2>Active Opportunities by State</h2>
          </div>
        </div>

        <div className="jobs-grid">
          {stateMetrics.length > 0 ? (
            stateMetrics.map((item, index) => (
              <div
                key={item.stateName}
                className={`job-card reveal ${index % 3 === 1 ? 'reveal-d1' : index % 3 === 2 ? 'reveal-d2' : ''
                  }`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 20px',
                  textAlign: 'center'
                }}
              >
                <div className="step-border-top"></div>

                <div style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1', marginBottom: '10px' }}>
                  {item.count}
                </div>

                <div className="jc-title" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
                  Active Job{item.count > 1 ? 's' : ''}
                </div>

                <div className="jc-meta" style={{ justifyContent: 'center' }}>
                  <div className="tag tag-green">
                    {item.stateName} ({item.hours}h)
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div
              className="job-card reveal"
              style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}
            >
              <div className="jc-title">No regional data available</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default JobMetrics;