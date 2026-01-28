import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import { apiUrl } from '../../config';

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
            <p className="mt-3 text-muted">Loading study materials...</p>
        </div>
    );
};

function StudyMaterials() {
    const navigate = useNavigate();
    const [studyMaterials, setStudyMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [courses, setCourses] = useState([]);

    const fetchStudyMaterials = useCallback(async () => {
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) {
            navigate('/user-login');
            return;
        }

        try {
            // Get enrolled courses first
            const { studentId } = JSON.parse(studentInfo);
            const coursesResponse = await axios.get(`${apiUrl}/enrolled-courses/${studentId}/`);

            if (coursesResponse.data.status === 'success') {
                // Get the courses the student is enrolled in
                const enrolledCourses = coursesResponse.data.data;
                setCourses(enrolledCourses);

                // Get all study materials for each enrolled course
                let allMaterials = [];

                // Create an array of promises for parallel requests
                const promises = enrolledCourses.map(course =>
                    axios.get(`${apiUrl}/study-materials/${course.id}/`)
                );

                // Wait for all requests to complete
                const responses = await Promise.all(promises);

                // Combine all materials from each course
                responses.forEach((response, index) => {
                    if (response.data && Array.isArray(response.data)) {
                        // Add the course information to each material for display
                        const materialsWithCourse = response.data.map(material => ({
                            ...material,
                            courseName: enrolledCourses[index].title,
                            courseId: enrolledCourses[index].id
                        }));
                        allMaterials = [...allMaterials, ...materialsWithCourse];
                    }
                });

                setStudyMaterials(allMaterials);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching study materials:', error);
            setError('Failed to load study materials. Please try again later.');
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        document.title = "Study Materials | Knoology LMS";
        fetchStudyMaterials();
    }, [fetchStudyMaterials]);

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
                        background: 'linear-gradient(135deg, #08AEEA 0%, #2AF598 100%)',
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
                                    <i className="bi bi-file-earmark-pdf" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Study Materials
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        <span style={{ fontWeight: '600' }}>{studyMaterials.length}</span> materials available from
                                        <span style={{ fontWeight: '600' }}> {courses.length}</span> courses
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
                                    background: 'linear-gradient(135deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-folder2-open" style={{
                                        color: '#08AEEA',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Learning Resources
                                </h5>
                            </div>

                            <Link to="/my-courses" className="btn btn-sm" style={{
                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.5rem 1.2rem',
                                fontWeight: '500'
                            }}>
                                <i className="bi bi-journal-bookmark me-2"></i>
                                View My Courses
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

                            {studyMaterials.length === 0 ? (
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
                                        <i className="bi bi-folder" style={{
                                            color: '#08AEEA',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Study Materials Yet</h5>
                                    <p className="text-muted mb-4">No study materials available for your enrolled courses.</p>
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
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Title</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Course</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Description</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Uploaded On</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studyMaterials.map(material => (
                                                <tr key={material.id} style={{
                                                    borderBottom: '1px solid #f0f0f0',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <div className="d-flex align-items-center">
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '10px',
                                                                background: 'rgba(220, 53, 69, 0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                marginRight: '10px'
                                                            }}>
                                                                <i className="bi bi-file-pdf" style={{ color: '#dc3545', fontSize: '1.2rem' }}></i>
                                                            </div>
                                                            <div>
                                                                <p className="mb-0" style={{ fontWeight: '500', color: '#002254' }}>
                                                                    {material.title}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <Link
                                                            to={`/detail/${material.courseId}`}
                                                            style={{
                                                                color: '#506690',
                                                                textDecoration: 'none',
                                                                transition: 'color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.color = '#08AEEA'}
                                                            onMouseLeave={(e) => e.target.style.color = '#506690'}
                                                        >
                                                            <i className="bi bi-journal-text me-1" style={{ color: '#08AEEA' }}></i>
                                                            {material.courseName}
                                                        </Link>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        {material.description || <span className="text-muted">No description</span>}
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <span className="badge" style={{
                                                            background: 'rgba(108, 117, 125, 0.1)',
                                                            color: '#6c757d',
                                                            fontWeight: '500',
                                                            padding: '6px 12px',
                                                            borderRadius: '30px'
                                                        }}>
                                                            <i className="bi bi-calendar-event me-1"></i> {new Date(material.created_at).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <a
                                                            href={material.file}
                                                            className='btn btn-sm'
                                                            target='_blank'
                                                            rel='noreferrer'
                                                            style={{
                                                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '50px',
                                                                padding: '0.35rem 1rem',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            <i className="bi bi-download me-1"></i>
                                                            Download
                                                        </a>
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

export default StudyMaterials;