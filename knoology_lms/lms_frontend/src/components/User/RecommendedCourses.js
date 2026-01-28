import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Sidebar from './Sidebar';
import axios from 'axios';
import { apiUrl } from '../../config';

// Define mediaUrl constant similar to other components
const mediaUrl = 'http://127.0.0.1:8000';

// Reusable loader component
const Loader = ({ size = "medium" }) => {
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
            color: '#08AEEA',
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
            background: "linear-gradient(45deg, rgba(42, 245, 152, 0.3), rgba(8, 174, 234, 0.3))"
          }}></div>
        </div>
      </div>
      <p className="mt-3 text-muted">Loading recommended courses...</p>
    </div>
  );
};

function RecommendedCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Recommended Courses | Knoology LMS";
    const fetchRecommendedCourses = async () => {
      const studentInfo = localStorage.getItem('studentInfo');
      if (!studentInfo) {
        navigate('/user-login');
        return;
      }

      try {
        const { studentId } = JSON.parse(studentInfo);
        const response = await axios.get(`${apiUrl}/recommended-courses/${studentId}/`);

        if (response.data.status === 'success') {
          setCourses(response.data.data);
        } else {
          setError('Failed to load recommendations');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommended courses:', error);
        setError('Failed to load recommended courses. Please try again later.');
        setLoading(false);
      }
    };

    fetchRecommendedCourses();
  }, [navigate]);

  if (loading) {
    return (
      <div className='container-fluid px-4' style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
        <div className='row g-4'>
          <div className='col-md-3'>
            <Sidebar />
          </div>
          <div className='col-md-9'>
            <Loader size="medium" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container-fluid px-4' style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
      <div className='row g-4'>
        <div className='col-md-3'>
          <Sidebar />
        </div>
        <div className='col-md-9'>
          {/* Page Header */}
          <div className="page-header" style={{
            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
            borderRadius: '20px',
            padding: '25px',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              zIndex: '0'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '10%',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              zIndex: '0'
            }}></div>

            <div className="position-relative" style={{ zIndex: '1' }}>
              <div className="d-flex align-items-center">
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: 'linear-gradient(45deg, #2575fc, #6a11cb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px',
                  boxShadow: '0 10px 20px rgba(37, 117, 252, 0.3)'
                }}>
                  <i className="bi bi-lightning" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                </div>

                <div>
                  <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                    Recommended Courses
                  </h3>
                  <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    <span style={{ fontWeight: '600' }}>{courses.length}</span> courses suggested for you
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="card-section" style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}>
            <div className="section-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 25px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <div className="d-flex align-items-center">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.1), rgba(37, 117, 252, 0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px'
                }}>
                  <i className="bi bi-stars" style={{
                    color: '#6a11cb',
                    fontSize: '1.2rem'
                  }}></i>
                </div>
                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                  AI-Powered Recommendations
                </h5>
              </div>

              <Link to="/all-courses" className="btn btn-sm" style={{
                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '0.5rem 1.2rem',
                fontWeight: '500'
              }}>
                <i className="bi bi-search me-2"></i>
                Browse All Courses
              </Link>
            </div>

            <div className="section-body">
              {error && (
                <div className="alert m-4" style={{
                  background: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '15px'
                }} role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              {courses.length === 0 ? (
                <div className="empty-state p-5 text-center">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.1), rgba(37, 117, 252, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <i className="bi bi-lightning" style={{
                      color: '#6a11cb',
                      fontSize: '2rem'
                    }}></i>
                  </div>
                  <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Recommendations Yet</h5>
                  <p className="text-muted mb-4">We'll recommend courses based on your interests and learning history.</p>
                  <Link to="/all-courses" className="btn" style={{
                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                    color: 'white',
                    fontWeight: '500',
                    borderRadius: '50px',
                    padding: '0.6rem 1.5rem',
                    border: 'none',
                    boxShadow: '0 5px 15px rgba(8, 174, 234, 0.2)'
                  }}>
                    <i className="bi bi-search me-2"></i>
                    Browse All Courses
                  </Link>
                </div>
              ) : (
                <div className="row g-4 p-4">
                  {courses.map(course => (
                    <div key={course.id} className="col-xl-4 col-md-6">
                      <div className="course-card" style={{
                        background: 'white',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)';
                          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.05)';
                        }}>
                        <div className="course-image" style={{ position: 'relative' }}>
                          <img
                            src={course.featured_img ?
                              (course.featured_img.startsWith('http') ?
                                course.featured_img :
                                `${mediaUrl}${course.featured_img}`
                              ) : "/course1.png"
                            }
                            alt={course.title}
                            style={{
                              width: '100%',
                              height: '180px',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x180?text=Course';
                            }}
                          />
                          <div
                            className="position-absolute top-0 start-0 m-2"
                            style={{
                              background: 'rgba(106, 17, 203, 0.9)',
                              color: 'white',
                              padding: '5px 10px',
                              borderRadius: '50px',
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            Recommended
                          </div>
                        </div>

                        <div className="course-content p-3 d-flex flex-column flex-grow-1">
                          <Link
                            to={`/detail/${course.id}`}
                            style={{
                              textDecoration: 'none',
                            }}
                          >
                            <h5 style={{
                              fontWeight: '600',
                              color: '#002254',
                              marginBottom: '10px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: '2',
                              WebkitBoxOrient: 'vertical',
                              minHeight: '48px'
                            }}>{course.title}</h5>
                          </Link>

                          <div className="instructor mb-2">
                            {course.teacher && (
                              <Link
                                to={`/teacher-detail/${course.teacher.id}`}
                                style={{
                                  color: '#506690',
                                  textDecoration: 'none',
                                  fontSize: '0.9rem',
                                  transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#08AEEA'}
                                onMouseLeave={(e) => e.target.style.color = '#506690'}
                              >
                                <i className="bi bi-person me-1"></i>
                                {course.teacher.full_name}
                              </Link>
                            )}
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-auto">
                            <div>
                              {(course.average_rating && course.total_ratings > 0) ? (
                                <div className="d-flex align-items-center">
                                  <div style={{ color: '#ffc107' }}>
                                    <i className="bi bi-star-fill me-1"></i>
                                  </div>
                                  <span style={{ fontWeight: '500' }}>
                                    {Number(course.average_rating).toFixed(1)}
                                  </span>
                                  <span className="text-muted ms-1" style={{ fontSize: '0.85rem' }}>
                                    ({course.total_ratings})
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>No ratings</span>
                              )}
                            </div>

                            <Link
                              to={`/detail/${course.id}`}
                              className='btn btn-sm'
                              style={{
                                background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.35rem 1rem',
                                fontWeight: '500'
                              }}
                            >
                              <i className="bi bi-arrow-right me-1"></i>
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
        </div>
      </div>
    </div>
  );
}

export default RecommendedCourses;