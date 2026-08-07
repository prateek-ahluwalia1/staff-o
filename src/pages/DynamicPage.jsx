import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

const DynamicPage = ({ category }) => {
  const { slug } = useParams();
  const location = useLocation();

  const title = slug 
    ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : category;

  return (
    <div style={{ padding: '40px', minHeight: '60vh', backgroundColor: '#f9f9f9', color: '#333' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#0A7C6E', borderBottom: '2px solid #0A7C6E', paddingBottom: '10px' }}>
          {category} - {title}
        </h1>
        <p style={{ fontSize: '18px', lineHeight: '1.6', marginTop: '20px' }}>
          Welcome to the <strong>{title}</strong> page. 
        </p>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#666' }}>
          This is a dummy page generated for the <code>{location.pathname}</code> route. 
          The actual content for this section will be implemented here later.
        </p>
        
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#eef8f6', borderRadius: '6px' }}>
          <h3 style={{ color: '#0A7C6E', marginTop: 0 }}>Dummy Content Section</h3>
          <ul>
            <li>Placeholder detail 1 for {title}</li>
            <li>Placeholder detail 2 for {title}</li>
            <li>Placeholder detail 3 for {title}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;
