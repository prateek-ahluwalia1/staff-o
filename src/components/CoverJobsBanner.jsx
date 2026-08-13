import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function CoverJobsBanner() {
  const { userdata } = useSelector((state) => state.auth);

  const availableJobsCount = userdata?.data?.available_jobs_count || userdata?.available_jobs_count || 0;
  const userType = userdata?.data?.user_type || userdata?.user_type;
  const isActive = userdata?.data?.is_active || userdata?.is_active;

  if (availableJobsCount <= 0 || (userType !== 'contractor' && userType !== 'staff') || !isActive) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0A7C6E, #075e53)',
      color: '#fff',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '8px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px rgba(10, 124, 110, 0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', }}>
        <i className="fa-solid fa-briefcase fs-4"></i>
        <div>
          <strong style={{ fontSize: '1rem', display: 'block' }}>You have {availableJobsCount} cover {availableJobsCount === 1 ? 'job' : 'jobs'} available!</strong>
          <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>Take a look and accept the ones that work best for your schedule.</span>
        </div>
      </div>
      <Link to="/cover-jobs" className="btn btn-light btn-sm fw-bold shadow-sm" style={{ color: '#0A7C6E', whiteSpace: 'nowrap' }}>
        View Cover Jobs <i className="fa-solid fa-arrow-right ms-1"></i>
      </Link>
    </div>
  );
}
