import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem 0'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center p-5" style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          }}>            <div className="error-number mb-4" style={{
              fontSize: '150px',
              fontWeight: 800,
              background: 'linear-gradient(45deg, #FF512F 0%, #DD2476 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1',
              margin: '0 auto'
            }}>
              404
            </div>
            
            <h2 className="mb-4" style={{
              fontSize: '2.5rem',
              fontWeight: '600',
              color: '#333',
              margin: '0 auto'
            }}>
              Oops! Page Not Found
            </h2>            <p className="lead mb-4" style={{
              fontSize: '1.2rem',
              color: '#666',
              maxWidth: '80%',
              margin: '0 auto'
            }}>
              The page you are looking for might have been removed, had its name changed, 
              or is temporarily unavailable.
            </p>
            
            <div className="divider mb-5 mx-auto" style={{
              width: '80px',
              height: '5px',
              background: 'linear-gradient(45deg, #FF512F 0%, #DD2476 100%)',
              borderRadius: '50px',
              margin: '2rem auto'
            }}></div>
              <div className="mt-5 d-flex justify-content-center gap-3 flex-wrap">
              <Link to="/" className="btn btn-primary px-4 py-3 mb-2" style={{
                background: 'linear-gradient(45deg, #FF512F 0%, #DD2476 100%)',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '500',
                boxShadow: '0 4px 15px rgba(221, 36, 118, 0.3)',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}>
                <i className="bi bi-house-door me-2"></i>
                Back to Home
              </Link>
              <Link to="/all-courses" className="btn px-4 py-3 mb-2" style={{
                background: 'white',
                border: '2px solid #ddd',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '500',
                color: '#555',
                transition: 'all 0.3s ease',
                minWidth: '200px'
              }}>
                <i className="bi bi-collection me-2"></i>
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
