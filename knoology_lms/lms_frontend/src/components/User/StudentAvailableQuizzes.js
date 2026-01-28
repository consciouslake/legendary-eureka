import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import axios from 'axios';
import Swal from 'sweetalert2';
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
            <p className="mt-3 text-muted">Loading quizzes...</p>
        </div>
    );
};

function StudentAvailableQuizzes() {
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch available quizzes when component loads
    useEffect(() => {
        document.title = "Available Quizzes | Knoology LMS";
        // Check if student is logged in
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) {
            navigate('/user-login');
            return;
        }

        const { studentId } = JSON.parse(studentInfo);
        if (!studentId) {
            navigate('/student-login');
            return;
        }

        fetchAvailableQuizzes(studentId);
    }, [navigate]);

    // Fetch all available quizzes for this student
    const fetchAvailableQuizzes = async (studentId) => {
        setLoading(true);
        try {
            console.log(`Fetching quizzes for student ID: ${studentId}`);
            const response = await axios.get(`${apiUrl}/student-available-quizzes/${studentId}/`);
            console.log('Quiz data received:', response.data);

            if (response.data && response.data.data) {
                setQuizData(response.data.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setQuizData([]);
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load quizzes. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
            setQuizData([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container-fluid px-4' style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
            <div className="row g-4">
                <div className="col-md-3">
                    <Sidebar />
                </div>
                <div className="col-md-9">
                    {/* Page Header */}
                    <div className="page-header" style={{
                        background: 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)',
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
                                    background: 'linear-gradient(45deg, #ffc107, #ff9800)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(255, 193, 7, 0.3)'
                                }}>
                                    <i className="bi bi-question-circle" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Available Quizzes
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        <span style={{ fontWeight: '600' }}>{quizData.length}</span> quizzes available
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
                                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-pencil-square" style={{
                                        color: '#ffc107',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Quiz Challenges
                                </h5>
                            </div>

                            <Link to="/student-quiz-results" className="btn btn-sm" style={{
                                background: 'white',
                                color: '#ffc107',
                                border: '1px solid #ffc107',
                                borderRadius: '50px',
                                padding: '0.5rem 1.2rem',
                                fontWeight: '500'
                            }}>
                                <i className="bi bi-trophy me-2"></i>
                                View Results
                            </Link>
                        </div>

                        <div className="section-body">
                            {loading ? (
                                <div className="p-5">
                                    <Loader size="medium" />
                                </div>
                            ) : quizData.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table mb-0" style={{
                                        fontSize: '0.95rem'
                                    }}>
                                        <thead style={{
                                            background: 'rgba(255, 193, 7, 0.03)'
                                        }}>
                                            <tr>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Quiz</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Course</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Questions</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Total Marks</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Status</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quizData.map((quiz, index) => (
                                                <tr key={index} style={{
                                                    borderBottom: '1px solid #f0f0f0',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <p className="mb-0" style={{ fontWeight: '500', color: '#002254' }}>
                                                            <i className="bi bi-journal-text me-2" style={{ color: '#ffc107' }}></i>
                                                            {quiz.quiz_title}
                                                        </p>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        {quiz.course_title}
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <span className="badge" style={{
                                                            background: 'rgba(255, 193, 7, 0.1)',
                                                            color: '#ffc107',
                                                            fontWeight: '500',
                                                            padding: '6px 12px',
                                                            borderRadius: '30px'
                                                        }}>
                                                            <i className="bi bi-list-ol me-1"></i> {quiz.total_questions} Questions
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <span style={{ fontWeight: '600', color: '#002254' }}>
                                                            {quiz.total_marks} Points
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        {quiz.already_attempted ? (
                                                            <span className="badge" style={{
                                                                background: 'rgba(40, 167, 69, 0.1)',
                                                                color: '#28a745',
                                                                fontWeight: '500',
                                                                padding: '6px 12px',
                                                                borderRadius: '30px'
                                                            }}>
                                                                <i className="bi bi-check-circle me-1"></i> Completed
                                                            </span>
                                                        ) : (
                                                            <span className="badge" style={{
                                                                background: 'rgba(23, 162, 184, 0.1)',
                                                                color: '#17a2b8',
                                                                fontWeight: '500',
                                                                padding: '6px 12px',
                                                                borderRadius: '30px'
                                                            }}>
                                                                <i className="bi bi-pencil-square me-1"></i> Not Attempted
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        {quiz.already_attempted ? (
                                                            <Link
                                                                to={`/student-quiz-results`}
                                                                className="btn btn-sm"
                                                                style={{
                                                                    background: 'white',
                                                                    color: '#28a745',
                                                                    border: '1px solid #28a745',
                                                                    borderRadius: '50px',
                                                                    padding: '0.35rem 1rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-eye me-1"></i>
                                                                View Results
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                to={`/attempt-quiz/${quiz.quiz_id}/${JSON.parse(localStorage.getItem('studentInfo')).studentId}/${quiz.course_id}`}
                                                                className="btn btn-sm"
                                                                style={{
                                                                    background: 'linear-gradient(45deg, #ff9800, #ffc107)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '50px',
                                                                    padding: '0.35rem 1rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-play-fill me-1"></i>
                                                                Start Quiz
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state p-5 text-center">
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <i className="bi bi-clipboard-x" style={{
                                            color: '#ffc107',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Quizzes Available</h5>
                                    <p className="text-muted mb-0">No quizzes are available for you at this time.</p>
                                    <p className="text-muted mt-2 mb-4">Quizzes are assigned by teachers to specific courses, so make sure to enroll in courses.</p>
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentAvailableQuizzes;