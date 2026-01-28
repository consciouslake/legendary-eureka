import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import axios from 'axios';

const baseUrl = 'http://127.0.0.1:8000/api';
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
            <p className="mt-3 text-muted">Loading courses...</p>
        </div>
    );
};

const CategoryCourses = () => {
    const [courses, setCourses] = useState([]);
    const [category, setCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const { category_slug } = useParams();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                // First get all categories to find the one with the matching slug
                const categoryResponse = await axios.get(`${baseUrl}/category/`);
                const categoryData = categoryResponse.data.find(
                    cat => cat.title.toLowerCase().replace(/\s+/g, '-') === category_slug
                );

                if (categoryData) {
                    setCategory(categoryData);
                    // Then fetch all courses
                    const courseResponse = await axios.get(`${baseUrl}/course/`);
                    // Filter courses by the category ID
                    const filteredCourses = courseResponse.data.filter(
                        course => course.category && course.category.id === categoryData.id
                    );
                    setCourses(filteredCourses);
                } else {
                    setError('Category not found');
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to fetch courses. Please try again later.');
                setLoading(false);
            }
        };

        fetchCourses();
    }, [category_slug]);

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCourses = courses.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(courses.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        // Scroll to courses section
        document.getElementById('courses-section').scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div>
                {/* Hero Section with Loading Indicator */}
                <section style={{
                    background: 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)',
                    color: 'white',
                    position: 'relative',
                    paddingTop: '120px',
                    paddingBottom: '3rem',
                    marginBottom: '2rem',
                    overflow: 'hidden'
                }}>
                    <div className="container position-relative">
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <h1 className="fw-bold mb-0" style={{ fontSize: '2.2rem', lineHeight: 1.2 }}>
                                    Loading Category...
                                </h1>
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

                <div className="container">
                    <Loader size="large" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                {/* Hero Section for Error */}
                <section style={{
                    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                    color: 'white',
                    position: 'relative',
                    paddingTop: '120px',
                    paddingBottom: '3rem',
                    marginBottom: '2rem',
                    overflow: 'hidden'
                }}>
                    <div className="container position-relative">
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <h1 className="fw-bold mb-0" style={{ fontSize: '2.2rem', lineHeight: 1.2 }}>
                                    Oops! Something went wrong
                                </h1>
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
                                <p className="mb-0">{error}</p>
                                <div className="mt-3">
                                    <Link to="/all-courses" className="btn" style={{
                                        background: 'linear-gradient(45deg, #dc3545, #c82333)',
                                        color: 'white',
                                        borderRadius: '50px',
                                        padding: '0.5rem 1.5rem',
                                        fontWeight: '500',
                                        border: 'none',
                                        boxShadow: '0 4px 10px rgba(220, 53, 69, 0.2)',
                                        transition: 'all 0.3s ease',
                                        textDecoration: 'none'
                                    }}>
                                        <i className="bi bi-arrow-left me-2"></i> Browse All Courses
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <section className="category-hero-section" style={{
                background: 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)',
                color: 'white',
                position: 'relative',
                paddingTop: '120px',
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
                    background: 'url("https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80") center center/cover no-repeat'
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
                                    <i className="bi bi-folder2-open" style={{ fontSize: '1.2rem' }}></i>
                                </div>
                                <h1 className="fw-bold mb-0" style={{ fontSize: '2.2rem', lineHeight: 1.2 }}>
                                    {category.title || 'Category'} <span style={{
                                        background: 'linear-gradient(45deg, #F5F5F5, #E0E0E0)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>Courses</span>
                                </h1>
                            </div>
                            <p className="lead mb-0" style={{ fontSize: '1.1rem', opacity: 0.85 }}>
                                Explore our collection of {category.title || 'category'} courses designed to enhance your skills
                            </p>
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

            <div id="courses-section" className="container mb-5">
                <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                        <div style={{
                            width: '5px',
                            height: '25px',
                            background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                            marginRight: '10px',
                            borderRadius: '10px'
                        }}></div>
                        <h2 className="fw-bold m-0" style={{ color: '#333' }}>{category.title} Courses</h2>
                    </div>
                    <p className="lead" style={{ color: '#506690' }}>Browse through our collection of high-quality {category.title} courses</p>
                </div>

                {courses.length === 0 ? (
                    <div style={{
                        background: 'rgba(142, 68, 173, 0.05)',
                        padding: '40px',
                        borderRadius: '15px',
                        textAlign: 'center'
                    }}>
                        <i className="bi bi-folder-x" style={{ fontSize: '3rem', color: '#8e44ad', marginBottom: '20px' }}></i>
                        <h4 style={{ fontWeight: '600', marginBottom: '10px' }}>No Courses Available</h4>
                        <p className="mb-0">No courses available in this category at the moment.</p>
                        <div className="mt-3">
                            <Link to="/all-courses" className="btn" style={{
                                background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                color: 'white',
                                borderRadius: '50px',
                                padding: '0.5rem 1.5rem',
                                fontWeight: '500',
                                border: 'none',
                                boxShadow: '0 4px 10px rgba(142, 68, 173, 0.2)',
                                transition: 'all 0.3s ease',
                                textDecoration: 'none'
                            }}>
                                <i className="bi bi-arrow-left me-2"></i> Browse All Courses
                            </Link>
                        </div>
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
                                                        `${mediaUrl}${course.featured_img}`
                                                    ) : `/course${(idx % 3) + 1}.png`}
                                                alt={course.title}
                                                style={{
                                                    width: '100%',
                                                    height: '200px',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = "/logo512.png";
                                                }}
                                            />
                                            <div className="course-overlay" style={{
                                                position: 'absolute',
                                                bottom: '0',
                                                left: '0',
                                                width: '100%',
                                                background: 'linear-gradient(0deg, rgba(142, 68, 173, 0.8) 0%, rgba(142, 68, 173, 0) 100%)',
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
                                                color: '#333',
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
                                                    <span style={{
                                                        background: 'rgba(142, 68, 173, 0.1)',
                                                        color: '#8e44ad',
                                                        padding: '5px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        <i className="bi bi-people-fill me-1"></i>
                                                        {course.total_enrolled || 0}
                                                    </span>
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
                {courses.length > itemsPerPage && (
                    <div className="d-flex justify-content-center mt-5">
                        <nav aria-label="Course pagination">
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 5px',
                                            color: '#8e44ad',
                                            fontWeight: '500',
                                            background: currentPage === 1 ? '#f8f9fa' : 'rgba(142, 68, 173, 0.1)'
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
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 5px',
                                                color: currentPage === number ? 'white' : '#8e44ad',
                                                fontWeight: '500',
                                                background: currentPage === number ? 'linear-gradient(45deg, #8e44ad, #5b2c6f)' : 'rgba(142, 68, 173, 0.1)'
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
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 5px',
                                            color: '#8e44ad',
                                            fontWeight: '500',
                                            background: currentPage === totalPages ? '#f8f9fa' : 'rgba(142, 68, 173, 0.1)'
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

export default CategoryCourses;