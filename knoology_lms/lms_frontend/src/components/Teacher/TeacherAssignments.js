import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import axios from 'axios';
import { formatFileUrl } from '../../utils/fileUtils';

const BASE_API_URL = 'http://127.0.0.1:8000/api';

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
            <p className="mt-3 text-muted">Loading assignments...</p>
        </div>
    );
};

function TeacherAssignments() {
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = "Assignment Dashboard | Knoology LMS";

        const fetchAssignments = async () => {
            try {
                // Get teacher ID from localStorage
                const teacherData = localStorage.getItem('teacherData');
                if (!teacherData) {
                    window.location.href = '/teacher-login';
                    return;
                }
                const teacherId = JSON.parse(teacherData).teacherId;

                // Direct API call to get assignments for teacher's students only
                const assignmentsResponse = await axios.get(`${BASE_API_URL}/teacher-assignments/${teacherId}/`);
                if (assignmentsResponse.data.status === 'success') {
                    setAssignments(assignmentsResponse.data.assignments);
                } else {
                    setError('Failed to load assignments. Please try again later.');
                }
            } catch (error) {
                console.error('Error fetching assignments:', error);
                setError('Failed to load assignments. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    return (
        <div className='container-fluid pb-4 px-4' style={{ paddingTop: '100px' }}>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <TeacherSidebar />
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
                                    background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(37, 117, 252, 0.3)'
                                }}>
                                    <i className="bi bi-file-earmark-text" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Assignment Dashboard
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Manage and track student assignments
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
                        overflow: 'hidden',
                        marginBottom: '30px'
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
                                    <i className="bi bi-list-check" style={{
                                        color: '#2575fc',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Assignments Overview
                                </h5>
                            </div>
                        </div>
                        <div className="section-body">
                            {loading ? (
                                <div className="p-4">
                                    <Loader size="medium" />
                                </div>
                            ) : error ? (
                                <div className="alert m-4" style={{
                                    background: 'rgba(220, 53, 69, 0.1)',
                                    color: '#dc3545',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px'
                                }} role="alert">
                                    <div className="d-flex">
                                        <div style={{ marginRight: '15px' }}>
                                            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Error</h6>
                                            <p className="mb-0">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : assignments.length === 0 ? (
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
                                        <i className="bi bi-file-earmark" style={{
                                            color: '#2575fc',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Assignments Yet</h5>
                                    <p className="text-muted mb-4">There are no assignments created for your students yet.</p>
                                </div>
                            ) : (
                                <div className="table-responsive p-4">
                                    <table className="table table-hover" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(106, 17, 203, 0.03)' }}>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Student</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Course</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Title</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Due Date</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Status</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Grade</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignments.map(assignment => (
                                                <tr key={assignment.id} style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '10px' }}>
                                                    <td style={{ padding: '15px', fontWeight: '500', color: '#002254' }}>{assignment.student_name}</td>
                                                    <td style={{ padding: '15px' }}>{assignment.course_title}</td>
                                                    <td style={{ padding: '15px', fontWeight: '500' }}>{assignment.title}</td>
                                                    <td style={{ padding: '15px' }}>{assignment.due_date_formatted}</td>
                                                    <td style={{ padding: '15px' }}>
                                                        {assignment.submission_date_formatted ? (
                                                            <span className="badge" style={{
                                                                background: 'rgba(25, 135, 84, 0.1)',
                                                                color: '#198754',
                                                                fontWeight: '500',
                                                                padding: '5px 10px',
                                                                borderRadius: '30px'
                                                            }}>
                                                                <i className="bi bi-check-circle me-1"></i>
                                                                Submitted
                                                            </span>
                                                        ) : (
                                                            <span className="badge" style={{
                                                                background: 'rgba(255, 193, 7, 0.1)',
                                                                color: '#ffc107',
                                                                fontWeight: '500',
                                                                padding: '5px 10px',
                                                                borderRadius: '30px'
                                                            }}>
                                                                <i className="bi bi-clock me-1"></i>
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        {assignment.grade ? (
                                                            <span className="badge" style={{
                                                                background: 'rgba(13, 110, 253, 0.1)',
                                                                color: '#0d6efd',
                                                                fontWeight: '600',
                                                                padding: '5px 12px',
                                                                borderRadius: '30px'
                                                            }}>
                                                                {assignment.grade}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted">Not graded</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <Link
                                                            to={`/check-assignments/${assignment.student}`}
                                                            className="btn btn-sm"
                                                            style={{
                                                                background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '50px',
                                                                padding: '0.3rem 0.8rem',
                                                                fontWeight: '500',
                                                                boxShadow: '0 2px 5px rgba(37, 117, 252, 0.2)'
                                                            }}
                                                        >
                                                            <i className="bi bi-eye me-1"></i> View Details
                                                        </Link>
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

export default TeacherAssignments;