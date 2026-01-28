import React from 'react';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_API_URL = 'http://127.0.0.1:8000/api/';

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
            <p className="mt-3 text-muted">Loading teachers...</p>
        </div>
    );
};

const PopularTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoading(true);
            setError('');

            try {
                // Fetch all teachers
                const teachersResponse = await axios.get(`${BASE_API_URL}teacher/`);

                // Fetch all courses to count them per teacher
                const coursesResponse = await axios.get(`${BASE_API_URL}course/`);

                // Count courses per teacher
                const teacherCourseCountMap = {};
                coursesResponse.data.forEach(course => {
                    if (course.teacher && course.teacher.id) {
                        const teacherId = course.teacher.id;
                        teacherCourseCountMap[teacherId] = (teacherCourseCountMap[teacherId] || 0) + 1;
                    }
                });

                // Add course count to teachers
                const teachersWithCourses = teachersResponse.data
                    .map(teacher => ({
                        ...teacher,
                        courseCount: teacherCourseCountMap[teacher.id] || 0
                    }))
                    // Only include teachers who have uploaded at least one course
                    .filter(teacher => teacher.courseCount > 0)
                    // Sort by number of courses in descending order
                    .sort((a, b) => b.courseCount - a.courseCount);

                setTeachers(teachersWithCourses);
            } catch (error) {
                console.error('Error fetching teachers:', error);
                setError('Failed to fetch teachers. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTeachers = teachers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(teachers.length / itemsPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="teacher-hero-section" style={{
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
                    background: 'url("https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80") center center/cover no-repeat'
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
                                    <i className="bi bi-people-fill" style={{ fontSize: '1.2rem' }}></i>
                                </div>
                                <h1 className="fw-bold mb-0" style={{ fontSize: '2.2rem', lineHeight: 1.2 }}>
                                    Popular Teachers
                                </h1>
                            </div>
                            <p className="lead mb-0" style={{ fontSize: '1.1rem', opacity: 0.85 }}>
                                Learn from the best educators in our community
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
                                <p className="mb-0">{error}</p>
                            </div>
                        </div>
                    </div>
                ) : teachers.length === 0 ? (
                    <div style={{
                        background: 'rgba(142, 68, 173, 0.05)',
                        padding: '40px',
                        borderRadius: '15px',
                        textAlign: 'center'
                    }}>
                        <i className="bi bi-info-circle" style={{ fontSize: '3rem', color: '#8e44ad', marginBottom: '20px' }}></i>
                        <h4 style={{ fontWeight: '600', marginBottom: '10px' }}>No Teachers Available</h4>
                        <p className="mb-0">No teachers have uploaded courses yet. Check back later!</p>
                    </div>
                ) : (
                    <>
                        <div className="row g-4">
                            {currentTeachers.map((teacher) => (
                                <div className="col-md-3" key={teacher.id}>
                                    <Link
                                        to={`/teacher-detail/${teacher.id}`}
                                        style={{ textDecoration: 'none', display: 'block' }}
                                    >
                                        <div style={{
                                            background: 'white',
                                            borderRadius: '20px',
                                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                            overflow: 'hidden',
                                            height: '100%',
                                            transition: 'all 0.3s ease'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-5px)';
                                                e.currentTarget.style.boxShadow = '0 15px 35px rgba(142, 68, 173, 0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
                                            }}>
                                            <div style={{
                                                height: '200px',
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.1), rgba(91, 44, 111, 0.1))'
                                            }}>
                                                <img
                                                    src={teacher.profile_img || "/teacher.png"}
                                                    alt={teacher.full_name}
                                                    style={{
                                                        width: '120px',
                                                        height: '120px',
                                                        objectFit: 'cover',
                                                        borderRadius: '50%',
                                                        border: '5px solid white',
                                                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = "/teacher.png";
                                                    }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '15px',
                                                    right: '15px',
                                                    background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                                    color: 'white',
                                                    borderRadius: '50px',
                                                    padding: '5px 12px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    boxShadow: '0 4px 10px rgba(142, 68, 173, 0.3)'
                                                }}>
                                                    <i className="bi bi-book me-1"></i>
                                                    {teacher.courseCount} {teacher.courseCount === 1 ? 'Course' : 'Courses'}
                                                </div>
                                            </div>
                                            <div className="p-3 text-center">
                                                <h5 style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                                                    {teacher.full_name}
                                                </h5>
                                                {teacher.qualification && (
                                                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                                        {teacher.qualification}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {teachers.length > itemsPerPage && (
                            <div className="d-flex justify-content-center mt-5">
                                <nav>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default PopularTeachers;