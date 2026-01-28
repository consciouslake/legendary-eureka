import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import Sidebar from './Sidebar';
import Swal from 'sweetalert2';

const baseUrl = 'http://127.0.0.1:8000/api';

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
            <p className="mt-3 text-muted">Loading your courses...</p>
        </div>
    );
};

function MyCourses() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [unenrolling, setUnenrolling] = useState(null);

    const fetchEnrolledCourses = useCallback(async () => {
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) {
            navigate('/user-login');
            return;
        }

        try {
            const parsedInfo = JSON.parse(studentInfo);
            // Handle different possible structures of studentInfo
            // It could be either { studentId: id } or { id: id } after profile modifications
            const studentId = parsedInfo.studentId || parsedInfo.id;

            if (!studentId) {
                setError('Student ID not found. Please try logging in again.');
                setLoading(false);
                return;
            }

            const response = await axios.get(`${baseUrl}/enrolled-courses/${studentId}/`);

            if (response.data.status === 'success') {
                setCourses(response.data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            setError('Failed to load your courses. Please try again later.');
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        document.title = "My Courses | Knoology LMS";
        fetchEnrolledCourses();
    }, [fetchEnrolledCourses]);

    const handleUnenroll = async (courseId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You will be unenrolled from this course!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, unenroll!',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                const studentInfo = localStorage.getItem('studentInfo');
                if (!studentInfo) {
                    navigate('/user-login');
                    return;
                }

                setUnenrolling(courseId);
                const parsedInfo = JSON.parse(studentInfo);
                // Use the same logic as in fetchEnrolledCourses
                const studentId = parsedInfo.studentId || parsedInfo.id;

                if (!studentId) {
                    await Swal.fire({
                        title: 'Error!',
                        text: 'Student ID not found. Please try logging in again.',
                        icon: 'error'
                    });
                    return;
                }

                await axios.post(`${baseUrl}/course-unenroll/`, {
                    student_id: studentId,
                    course_id: courseId
                });

                // Remove the unenrolled course from the state
                setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));

                await Swal.fire({
                    title: 'Unenrolled!',
                    text: 'You have been unenrolled from the course.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error unenrolling from course:', error);
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to unenroll from the course. Please try again.',
                icon: 'error'
            });
        } finally {
            setUnenrolling(null);
        }
    };

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
                        background: 'linear-gradient(135deg, #002254 0%, #1a56c9 100%)',
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
                                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(8, 174, 234, 0.3)'
                                }}>
                                    <i className="bi bi-journal-bookmark" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        My Courses
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        <span style={{ fontWeight: '600' }}>{courses.length}</span> courses enrolled
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
                            <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                Enrolled Courses
                            </h5>
                            <Link to="/all-courses" className="btn btn-sm" style={{
                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.5rem 1.2rem',
                                fontWeight: '500'
                            }}>
                                <i className="bi bi-search me-2"></i>
                                Browse More Courses
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
                                        background: 'linear-gradient(135deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <i className="bi bi-journal-bookmark" style={{
                                            color: '#08AEEA',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Enrolled Courses Yet</h5>
                                    <p className="text-muted mb-4">Start your learning journey by enrolling in a course.</p>
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
                                        Browse Courses
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table mb-0" style={{
                                        fontSize: '0.95rem'
                                    }}>
                                        <thead style={{
                                            background: 'rgba(8, 174, 234, 0.03)'
                                        }}>
                                            <tr>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Course Name</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Instructor</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.map(course => (
                                                <tr key={course.id} style={{
                                                    borderBottom: '1px solid #f0f0f0',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <Link
                                                            to={`/detail/${course.id}`}
                                                            style={{
                                                                color: '#002254',
                                                                fontWeight: '500',
                                                                textDecoration: 'none',
                                                                transition: 'color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.color = '#08AEEA'}
                                                            onMouseLeave={(e) => e.target.style.color = '#002254'}
                                                        >
                                                            <i className="bi bi-journal-text me-2" style={{ color: '#08AEEA' }}></i>
                                                            {course.title}
                                                        </Link>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        {course.teacher && (
                                                            <Link
                                                                to={`/teacher-detail/${course.teacher.id}`}
                                                                style={{
                                                                    color: '#506690',
                                                                    textDecoration: 'none',
                                                                    transition: 'color 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.color = '#08AEEA'}
                                                                onMouseLeave={(e) => e.target.style.color = '#506690'}
                                                            >
                                                                <i className="bi bi-person me-1"></i>
                                                                {course.teacher.full_name}
                                                            </Link>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <div className="d-flex gap-2">
                                                            <Link
                                                                to={`/detail/${course.id}`}
                                                                className='btn btn-sm'
                                                                style={{
                                                                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '50px',
                                                                    padding: '0.35rem 1rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-play-circle me-1"></i>
                                                                Access Course
                                                            </Link>
                                                            <Link
                                                                to={`/course-study-materials/${course.id}`}
                                                                className='btn btn-sm'
                                                                style={{
                                                                    background: 'white',
                                                                    color: '#08AEEA',
                                                                    border: '1px solid #08AEEA',
                                                                    borderRadius: '50px',
                                                                    padding: '0.35rem 1rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-file-earmark-pdf me-1"></i>
                                                                Materials
                                                            </Link>
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => handleUnenroll(course.id)}
                                                                disabled={unenrolling === course.id}
                                                                style={{
                                                                    background: 'white',
                                                                    color: '#dc3545',
                                                                    border: '1px solid #dc3545',
                                                                    borderRadius: '50px',
                                                                    padding: '0.35rem 1rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-box-arrow-right me-1"></i>
                                                                {unenrolling === course.id ? 'Unenrolling...' : 'Unenroll'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyCourses;