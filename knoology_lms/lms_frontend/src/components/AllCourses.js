import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

const baseUrl = 'http://127.0.0.1:8000/api';
const mediaBaseUrl = 'http://127.0.0.1:8000';

// Reusable loader component
const Loader = ({ size = "medium" }) => {
  const dimensions = {
    small: { width: "30px", height: "30px" },
    medium: { width: "40px", height: "40px" },
    large: { width: "60px", height: "60px" }
  };
  
  return (
    <div className="text-center py-5">
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
      <p className="mt-3 text-muted">Loading courses...</p>
    </div>
  );
};

const AllCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        document.title = "Knoology LMS - All Courses";
        
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${baseUrl}/course/`);
                setCourses(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to fetch courses. Please try again later.');
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCourses = courses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(courses.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        // Scroll to courses section instead of page top
        document.getElementById('courses-section').scrollIntoView({ behavior: 'smooth' });
    };

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert" style={{
                    background: 'rgba(220, 53, 69, 0.1)', 
                    color: '#dc3545',
                    borderRadius: '15px',
                    border: 'none',
                    padding: '20px'
                }} role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section - Made more compact */}
            <section className="courses-hero-section" style={{
                background: 'linear-gradient(135deg, #002254 0%, #1a56c9 100%)',
                color: 'white',
                position: 'relative',
                paddingTop: '3rem',  // Reduced padding
                paddingBottom: '3rem', // Reduced padding
                marginBottom: '2rem', // Reduced margin
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
                    background: 'url("https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80") center center/cover no-repeat'
                }}></div>
                <div className="container position-relative">
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <h1 className="fw-bold mb-2" style={{ fontSize: '2.5rem', lineHeight: 1.2 }}>
                                Explore All <span style={{ 
                                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)', 
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>Courses</span>
                            </h1>
                            <p className="lead mb-0" style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                Discover our comprehensive library of courses designed to help you master new skills.
                            </p>
                        </div>
                        <div className="col-lg-5 d-none d-lg-block text-center">
                            <img src="/course-hero.svg" alt="Courses illustration" className="img-fluid" style={{
                                maxWidth: '70%',
                                maxHeight: '180px', // Limit height
                                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))'
                            }} onError={(e) => {
                                // Fallback if SVG isn't available
                                e.target.src = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
                                e.target.style.borderRadius = '20px';
                                e.target.style.maxHeight = '150px';
                                e.target.style.objectFit = 'cover';
                            }} />
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
                    lineHeight: 0,
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{
                        position: 'relative',
                        display: 'block',
                        width: 'calc(100% + 1.3px)',
                        height: '30px', // Reduced height
                        fill: '#ffffff'
                    }}>
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>
            </section>
            
            <div id="courses-section" className="container mb-5">
                <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                        <div style={{
                            width: '5px',
                            height: '25px',
                            background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                            marginRight: '10px',
                            borderRadius: '10px'
                        }}></div>
                        <h2 className="fw-bold m-0" style={{ color: '#002254' }}>Course Library</h2>
                    </div>
                    <p className="lead" style={{ color: '#506690' }}>Browse through our collection of high-quality courses</p>
                </div>
                
                {loading ? (
                    <Loader size="large" />
                ) : courses.length === 0 ? (
                    <div className="alert" style={{
                        background: 'rgba(8, 174, 234, 0.1)',
                        color: '#08AEEA',
                        borderRadius: '15px',
                        border: 'none',
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            <i className="bi bi-journal-x"></i>
                        </div>
                        <h4 className="mb-3">No Courses Available</h4>
                        <p className="mb-0">We're working on adding new courses. Please check back later!</p>
                    </div>
                ) : (
                    <div className="row g-4">
                    {currentCourses.map((course, idx) => (
                            <div className="col-lg-3 col-md-6" key={course.id}>
                                <div className="course-card" style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }} 
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-10px)';
                                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
                                }}>
                                    <Link to={`/detail/${course.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="position-relative">
                                        <img 
                                            src={course.featured_img ? 
                                                (course.featured_img.startsWith('http') ? 
                                                    course.featured_img : 
                                                    `${mediaBaseUrl}${course.featured_img}`
                                                ) : `/course${(idx%3)+1}.png`} 
                                            alt={course.title}
                                            style={{
                                                    width: '100%',
                                                    height: '200px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <div className="course-overlay" style={{
                                                position: 'absolute',
                                                bottom: '0',
                                                left: '0',
                                                width: '100%',
                                                background: 'linear-gradient(0deg, rgba(0,34,84,0.8) 0%, rgba(0,34,84,0) 100%)',
                                                padding: '30px 20px 15px',
                                            }}>
                                                {course.average_rating && course.total_ratings > 0 ? (
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
                                                        {Number(course.average_rating).toFixed(1)}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="p-4 d-flex flex-column flex-grow-1">
                                            <h5 style={{ 
                                                color: '#002254',
                                                fontWeight: '600',
                                                marginBottom: '10px',
                                                transition: 'color 0.3s ease'
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
                                                    />
                                                    <span style={{ fontSize: '0.9rem', color: '#506690' }}>
                                                        {course.teacher ? course.teacher.full_name : "Instructor"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <i className="bi bi-arrow-right-circle" style={{ 
                                                        color: '#08AEEA',
                                                        fontSize: '1.4rem'
                                                    }}></i>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
                {/* Pagination controls */}
                {!loading && !error && courses.length > itemsPerPage && (
                    <div className="d-flex justify-content-center mt-5">
                <nav aria-label="Course pagination">
                            <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => paginate(currentPage - 1)} 
                                disabled={currentPage === 1}
                                        style={{
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 5px',
                                            border: 'none',
                                            background: currentPage === 1 ? '#f1f5fb' : 'white',
                                            color: currentPage === 1 ? '#adb5bd' : '#002254',
                                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                                        }}
                                    >
                                        <i className="bi bi-chevron-left"></i>
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                <button 
                                    className="page-link" 
                                    onClick={() => paginate(number)}
                                            style={{
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 5px',
                                                border: 'none',
                                                background: currentPage === number ? 
                                                    'linear-gradient(45deg, #2AF598, #08AEEA)' : 'white',
                                                color: currentPage === number ? 'white' : '#002254',
                                                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                                                fontWeight: currentPage === number ? '600' : 'normal'
                                            }}
                                >
                                    {number}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button 
                                className="page-link" 
                                onClick={() => paginate(currentPage + 1)} 
                                disabled={currentPage === totalPages}
                                        style={{
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 5px',
                                            border: 'none',
                                            background: currentPage === totalPages ? '#f1f5fb' : 'white',
                                            color: currentPage === totalPages ? '#adb5bd' : '#002254',
                                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                                        }}
                                    >
                                        <i className="bi bi-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
                    </div>
            )}
            </div>
        </div>
    );
};

export default AllCourses;