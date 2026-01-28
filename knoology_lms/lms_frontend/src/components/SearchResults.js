import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../config';

const mediaUrl = 'http://127.0.0.1:8000';

// Reusable loader component
const Loader = ({ size = "medium", color = "#8e44ad" }) => {
  const dimensions = {
    small: { width: "30px", height: "30px" },
    medium: { width: "40px", height: "40px" },
    large: { width: "60px", height: "60px" }
  };
  
  return (
    <div className="text-center py-4">
      <div className="position-relative" style={{ ...dimensions[size], margin: "0 auto" }}>
        <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
          <div className="spinner-border" style={{ 
            color: color,
            ...dimensions[size]
          }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center animate__animated animate__pulse animate__infinite">
          <div style={{
            width: dimensions[size].width,
            height: dimensions[size].height,
            borderRadius: "50%",
            background: "linear-gradient(45deg, rgba(142, 68, 173, 0.3), rgba(91, 44, 111, 0.3))"
          }}></div>
        </div>
      </div>
      <p className="mt-3 text-muted">Loading search results...</p>
    </div>
  );
};

function SearchResults() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    document.title = "Search Results | Knoology LMS";

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${apiUrl}/search-courses/?q=${encodeURIComponent(query)}`);
        if (response.data.status === 'success') {
          setCourses(response.data.data);
        }
        else {
          // Handle unexpected response format
          setError('Invalid response format from server. Please try again.');
          console.error('Invalid response format:', response.data);
        }
      } catch (err) {
        // Log detailed error information
        console.error('Search error:', err);
        console.error('Error response:', err.response?.data);
        
        // Provide more informative error message to the user
        if (err.response?.status === 400) {
          setError('Invalid search query. Please try different keywords.');
        } else {
          setError('Failed to fetch search results. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }else {
      // Reset state when no query is present
      setCourses([]);
      setLoading(false);
      setError(null);
    }
  }, [query]);

  return (
    <div>
      {/* Hero Section */}
      <section className="search-hero-section" style={{
          background: 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)',
          color: 'white',
          position: 'relative',
          paddingTop: '3rem',
          paddingBottom: '3rem',
          marginBottom: '2rem',
          overflow: 'hidden'
      }}>
        {/* Abstract background elements */}
        <div className="hero-bg" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            background: 'url("https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80") center center/cover no-repeat'
        }}></div>
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center mb-2">
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px'
                }}>
                  <i className="bi bi-search" style={{ fontSize: '1.2rem' }}></i>
                </div>
                <h1 className="fw-bold mb-0" style={{ fontSize: '2.2rem', lineHeight: 1.2 }}>
                  Search Results for "<span style={{ 
                      fontStyle: 'italic',
                      color: 'rgba(255, 255, 255, 0.85)'
                  }}>{query}</span>"
                </h1>
              </div>
              {!loading && (
                <p className="lead mb-0" style={{ fontSize: '1.1rem', opacity: 0.85 }}>
                  <span className="fw-bold">{courses.length}</span> {courses.length === 1 ? 'course' : 'courses'} found matching your search
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Wave shape divider at bottom */}
        <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            overflow: 'hidden',
            lineHeight: 0
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{
              position: 'relative',
              display: 'block',
              width: 'calc(100% + 1.3px)',
              height: '30px',
              fill: '#ffffff'
          }}>
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      <div className="container mb-5">
        {loading ? (
          <Loader size="large" />
        ) : error ? (
          <div style={{
            background: 'rgba(220, 53, 69, 0.1)',
            color: '#dc3545',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '20px',
            border: 'none'
          }}>
            <div className="d-flex">
              <div style={{ marginRight: '20px' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2rem' }}></i>
              </div>
              <div>
                <h5 style={{ fontWeight: '600', marginBottom: '10px' }}>Error</h5>
                <p className="mb-3">{error}</p>
                <Link to="/all-courses" className="btn" style={{
                  background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '0.5rem 1.5rem',
                  fontWeight: '500',
                  boxShadow: '0 4px 15px rgba(142, 68, 173, 0.2)'
                }}>
                  <i className="bi bi-grid me-2"></i>
                  Browse All Courses
                </Link>
              </div>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div style={{
            background: 'rgba(142, 68, 173, 0.05)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            marginBottom: '2rem',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(142, 68, 173, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 25px'
            }}>
              <i className="bi bi-search" style={{ fontSize: '2rem', color: '#8e44ad' }}></i>
            </div>
            <h4 style={{ fontWeight: '600', color: '#333', marginBottom: '15px' }}>No courses found</h4>
            <p className="text-muted mb-4">No courses found matching your search. Try different keywords or explore our course library.</p>
            <Link to="/all-courses" className="btn" style={{
              background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              padding: '0.7rem 2rem',
              fontWeight: '500',
              boxShadow: '0 4px 15px rgba(142, 68, 173, 0.2)'
            }}>
              <i className="bi bi-grid me-2"></i>
              Browse All Courses
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {courses.map((course, idx) => (
              <div className="col-lg-4 col-md-6" key={course.id}>
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }} 
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
                }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={course.featured_img ? 
                        (course.featured_img.startsWith('http') ? 
                          course.featured_img : 
                          `${mediaUrl}${course.featured_img}`
                        ) : `/course${(idx%3)+1}.png`}
                      alt={course.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = '/logo512.png';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      width: '100%',
                      background: 'linear-gradient(0deg, rgba(91,44,111,0.8) 0%, rgba(91,44,111,0) 100%)',
                      padding: '30px 20px 15px',
                    }}>
                      {(course.average_rating && course.total_ratings > 0) && (
                        <div style={{
                          display: 'inline-block',
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(5px)',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          <i className="bi bi-star-fill me-1" style={{ color: '#FFD700' }}></i>
                          {parseFloat(course.average_rating).toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <h5 style={{ 
                      color: '#333',
                      fontWeight: '600',
                      marginBottom: '12px'
                    }}>
                      {course.title}
                    </h5>
                    <p className="text-muted mb-4" style={{ 
                      fontSize: '0.9rem',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: '2',
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {course.description?.substring(0, 100) || "Explore this course to learn more"}
                      {course.description?.length > 100 ? "..." : ""}
                    </p>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <img 
                          src="/teacher.png"
                          alt="Teacher"
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            marginRight: '10px'
                          }}
                          onError={(e) => {
                            e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(course.teacher?.full_name || "Teacher");
                          }}
                        />
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          {course.teacher?.full_name || "Instructor"}
                        </span>
                      </div>
                      <Link to={`/detail/${course.id}`} className="btn btn-sm" style={{
                        background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        padding: '0.5rem 1rem',
                        fontWeight: '500'
                      }}>
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;