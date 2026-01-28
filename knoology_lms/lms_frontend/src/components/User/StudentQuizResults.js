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
            <p className="mt-3 text-muted">Loading quiz results...</p>
        </div>
    );
};

function StudentQuizResults() {
    const navigate = useNavigate();
    const [quizResults, setQuizResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAttempt, setSelectedAttempt] = useState(null);
    const [attemptDetails, setAttemptDetails] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    // Student info state
    const [studentId, setStudentId] = useState(null);

    useEffect(() => {
        document.title = "Quiz Results | Knoology LMS";
        // Get student info from localStorage
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) {
            navigate('/user-login');
            return;
        }

        try {
            const { studentId } = JSON.parse(studentInfo);
            if (!studentId) {
                navigate('/user-login');
                return;
            }
            setStudentId(studentId);
            fetchQuizResults(studentId);
        } catch (error) {
            console.error('Error parsing student info:', error);
            navigate('/user-login');
        }
    }, [navigate]);

    const fetchQuizResults = async (id) => {
        setLoading(true);
        try {
            console.log(`Fetching quiz results for student ID: ${id}`);
            const response = await axios.get(`${apiUrl}/student-quiz-results/${id}/`);
            console.log('Quiz results received:', response.data);

            if (response.data.status === 'success') {
                setQuizResults(response.data.data);
            } else {
                console.error('Unexpected response format:', response.data);
                setQuizResults([]);
            }
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load quiz results. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false);
        }
    };

    const viewAttemptDetails = async (attemptId) => {
        try {
            console.log(`Fetching details for attempt ID: ${attemptId}`);
            const response = await axios.get(`${apiUrl}/quiz-attempt-detail/${attemptId}/`);

            if (response.data.status === 'success') {
                setAttemptDetails(response.data);
                setSelectedAttempt(attemptId);
                setShowDetails(true);
            } else {
                console.error('Unexpected response format:', response.data);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to load attempt details. The data format is unexpected.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error fetching attempt details:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load attempt details. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    const closeDetails = () => {
        setShowDetails(false);
        setSelectedAttempt(null);
        setAttemptDetails(null);
    };

    // Format date
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
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
                        background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
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
                                    background: 'linear-gradient(45deg, #ff9800, #ffc107)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(255, 193, 7, 0.3)'
                                }}>
                                    <i className="bi bi-trophy" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Quiz Results
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        <span style={{ fontWeight: '600' }}>{quizResults.length}</span> quiz attempts
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
                                    <i className="bi bi-list-check" style={{
                                        color: '#ffc107',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Your Quiz History
                                </h5>
                            </div>

                            <Link to="/student-available-quizzes" className="btn btn-sm" style={{
                                background: 'linear-gradient(45deg, #ff9800, #ffc107)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.5rem 1.2rem',
                                fontWeight: '500'
                            }}>
                                <i className="bi bi-pencil-square me-2"></i>
                                Take More Quizzes
                            </Link>
                        </div>

                        <div className="section-body">
                            {loading ? (
                                <div className="p-5">
                                    <Loader size="medium" />
                                </div>
                            ) : quizResults.length > 0 ? (
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
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Date Attempted</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Score</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Percentage</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quizResults.map((result, index) => (
                                                <tr key={index} style={{
                                                    borderBottom: '1px solid #f0f0f0',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <p className="mb-0" style={{ fontWeight: '500', color: '#002254' }}>
                                                            <i className="bi bi-question-circle me-2" style={{ color: '#ffc107' }}></i>
                                                            {result.quiz_title}
                                                        </p>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        {result.course_title}
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <span className="badge" style={{
                                                            background: 'rgba(108, 117, 125, 0.1)',
                                                            color: '#6c757d',
                                                            fontWeight: '500',
                                                            padding: '6px 12px',
                                                            borderRadius: '30px'
                                                        }}>
                                                            <i className="bi bi-calendar-event me-1"></i> {formatDate(result.attempted_at)}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <span style={{ fontWeight: '600', color: '#002254' }}>
                                                            {result.obtained_marks}
                                                        </span>
                                                        <span style={{ color: '#6c757d' }}>
                                                            /{result.total_marks}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <div className="d-flex align-items-center">
                                                            <div style={{ width: '120px' }}>
                                                                <div style={{
                                                                    height: '8px',
                                                                    width: '100%',
                                                                    backgroundColor: 'rgba(220, 220, 220, 0.3)',
                                                                    borderRadius: '10px',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <div
                                                                        style={{
                                                                            height: '100%',
                                                                            width: `${result.percentage}%`,
                                                                            background: result.percentage >= 70 ? 'linear-gradient(45deg, #28a745, #20c997)' :
                                                                                result.percentage >= 40 ? 'linear-gradient(45deg, #ffc107, #fd7e14)' :
                                                                                    'linear-gradient(45deg, #dc3545, #fd7e14)',
                                                                            borderRadius: '10px'
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <span className="ms-2" style={{
                                                                fontWeight: '600',
                                                                color: result.percentage >= 70 ? '#28a745' :
                                                                    result.percentage >= 40 ? '#ffc107' : '#dc3545'
                                                            }}>
                                                                {result.percentage.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <button
                                                            onClick={() => viewAttemptDetails(result.attempt_id)}
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
                                                            <i className="bi bi-eye me-1"></i>
                                                            View Details
                                                        </button>
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
                                        <i className="bi bi-journal-text" style={{
                                            color: '#ffc107',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Quiz Results Yet</h5>
                                    <p className="text-muted mb-4">You haven't taken any quizzes yet.</p>
                                    <Link to="/student-available-quizzes" className="btn" style={{
                                        background: 'linear-gradient(45deg, #ff9800, #ffc107)',
                                        color: 'white',
                                        fontWeight: '500',
                                        borderRadius: '50px',
                                        padding: '0.6rem 1.5rem',
                                        border: 'none',
                                        boxShadow: '0 5px 15px rgba(255, 193, 7, 0.2)'
                                    }}>
                                        <i className="bi bi-pencil-square me-2"></i>
                                        View Available Quizzes
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quiz Attempt Details Modal */}
            {showDetails && attemptDetails && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050
                }}>
                    <div className="modal-dialog" style={{
                        maxWidth: '70%',
                        width: 'auto',
                        margin: '0 auto'
                    }}>
                        <div className="modal-content" style={{
                            borderRadius: '15px',
                            border: '3px solid #fff',
                            boxShadow: '0 0 30px 5px rgba(255, 152, 0, 0.5)',
                            backgroundColor: '#fff'
                        }}>
                            <div className="modal-header" style={{
                                background: 'linear-gradient(45deg, #ff9800, #ffc107)',
                                color: 'white',
                                borderRadius: '10px 10px 0 0',
                                border: 'none',
                                padding: '15px 20px'
                            }}>
                                <h5 className="modal-title" style={{ fontWeight: '700', fontSize: '1.2rem' }}>
                                    <i className="bi bi-card-checklist me-2"></i>
                                    Quiz Attempt Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeDetails}
                                    aria-label="Close"
                                    style={{ filter: 'brightness(0) invert(1)' }}
                                ></button>
                            </div>
                            <div className="modal-body" style={{
                                padding: '20px 15px',
                                backgroundColor: '#fff',
                                color: '#000',
                                maxHeight: '70vh',
                                overflowY: 'auto'
                            }}>
                                <div className="mb-3 p-3" style={{
                                    background: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '10px'
                                }}>
                                    <h5 style={{ color: '#002254', fontWeight: '600' }}>{attemptDetails.attempt.quiz_title}</h5>
                                    <p style={{ color: '#506690' }}>Course: <span style={{ fontWeight: '500' }}>{attemptDetails.attempt.course_title}</span></p>
                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center">
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(108, 117, 125, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '10px'
                                                }}>
                                                    <i className="bi bi-calendar-date" style={{ color: '#6c757d', fontSize: '1.2rem' }}></i>
                                                </div>
                                                <div>
                                                    <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Attempted On</p>
                                                    <p className="mb-0" style={{ fontWeight: '500', color: '#002254' }}>
                                                        {formatDate(attemptDetails.attempt.attempted_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center">
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(255, 193, 7, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '10px'
                                                }}>
                                                    <i className="bi bi-award" style={{ color: '#ffc107', fontSize: '1.2rem' }}></i>
                                                </div>
                                                <div>
                                                    <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Score</p>
                                                    <p className="mb-0" style={{ fontWeight: '500', color: '#002254' }}>
                                                        {attemptDetails.attempt.obtained_marks} / {attemptDetails.attempt.total_marks}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="d-flex align-items-center">
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    background: attemptDetails.attempt.percentage >= 70 ? 'rgba(40, 167, 69, 0.1)' :
                                                        attemptDetails.attempt.percentage >= 40 ? 'rgba(255, 193, 7, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '10px'
                                                }}>
                                                    <i className="bi bi-percent" style={{
                                                        color: attemptDetails.attempt.percentage >= 70 ? '#28a745' :
                                                            attemptDetails.attempt.percentage >= 40 ? '#ffc107' : '#dc3545',
                                                        fontSize: '1.2rem'
                                                    }}></i>
                                                </div>
                                                <div>
                                                    <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>Percentage</p>
                                                    <p className="mb-0" style={{
                                                        fontWeight: '600',
                                                        color: attemptDetails.attempt.percentage >= 70 ? '#28a745' :
                                                            attemptDetails.attempt.percentage >= 40 ? '#ffc107' : '#dc3545'
                                                    }}>
                                                        {attemptDetails.attempt.percentage.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h6 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>
                                    <i className="bi bi-list-ol me-2"></i>
                                    Questions and Answers
                                </h6>
                                {attemptDetails.responses.map((response, index) => (
                                    <div
                                        key={index}
                                        className="mb-3"
                                        style={{
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            border: `2px solid ${response.is_correct ? '#28a745' : '#dc3545'}`,
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: '10px 15px',
                                                background: response.is_correct ? '#e8f5e9' : '#ffebee',
                                                borderBottom: `1px solid ${response.is_correct ? '#28a745' : '#dc3545'}`
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                                    Question {index + 1}
                                                </h6>
                                                <span className="badge" style={{
                                                    background: response.is_correct ? '#28a745' : '#dc3545',
                                                    color: 'white',
                                                    fontWeight: '500',
                                                    padding: '6px 12px',
                                                    borderRadius: '30px'
                                                }}>
                                                    <i className={`bi ${response.is_correct ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                                                    {response.is_correct ? 'Correct' : 'Incorrect'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ padding: '15px', backgroundColor: '#fff' }}>
                                            <p className="fw-bold mb-3" style={{ color: '#002254' }}>{response.question_text}</p>
                                            <div className="row">
                                                <div className="col-md-6 mb-3 mb-md-0">
                                                    <p className="mb-2" style={{ fontWeight: '600', color: '#002254' }}>Options:</p>
                                                    <ol className="ps-3" style={{ color: '#333' }}>
                                                        <li className={response.ans1 === response.right_answer ? 'fw-bold text-success' : ''}
                                                            style={{ marginBottom: '8px' }}>
                                                            {response.ans1}
                                                        </li>
                                                        <li className={response.ans2 === response.right_answer ? 'fw-bold text-success' : ''}
                                                            style={{ marginBottom: '8px' }}>
                                                            {response.ans2}
                                                        </li>
                                                        <li className={response.ans3 === response.right_answer ? 'fw-bold text-success' : ''}
                                                            style={{ marginBottom: '8px' }}>
                                                            {response.ans3}
                                                        </li>
                                                        <li className={response.ans4 === response.right_answer ? 'fw-bold text-success' : ''}
                                                            style={{ marginBottom: '8px' }}>
                                                            {response.ans4}
                                                        </li>
                                                    </ol>
                                                </div>
                                                <div className="col-md-6" style={{ backgroundColor: '#fafafa', padding: '15px', borderRadius: '8px' }}>
                                                    <p className="mb-2" style={{ fontWeight: '600', color: '#002254' }}>Your Answer:</p>
                                                    <p className={response.is_correct ? 'text-success' : 'text-danger'} style={{ fontWeight: '500', backgroundColor: response.is_correct ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)', padding: '8px', borderRadius: '5px' }}>
                                                        <i className={`bi ${response.is_correct ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
                                                        {response.selected_answer}
                                                    </p>

                                                    <p className="mb-2 mt-3" style={{ fontWeight: '600', color: '#002254' }}>Correct Answer:</p>
                                                    <p className="text-success" style={{ fontWeight: '500', backgroundColor: 'rgba(40, 167, 69, 0.1)', padding: '8px', borderRadius: '5px' }}>
                                                        <i className="bi bi-check-circle me-2"></i>
                                                        {response.right_answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="modal-footer" style={{
                                border: 'none',
                                padding: '15px',
                                backgroundColor: '#f8f9fa'
                            }}>
                                <button
                                    type="button"
                                    className="btn btn-sm"
                                    onClick={closeDetails}
                                    style={{
                                        background: 'linear-gradient(45deg, #ff9800, #ffc107)',
                                        color: 'white',
                                        fontWeight: '500',
                                        borderRadius: '50px',
                                        padding: '0.5rem 1.25rem',
                                        border: 'none',
                                        boxShadow: '0 5px 15px rgba(255, 152, 0, 0.2)'
                                    }}
                                >
                                    <i className="bi bi-x me-1"></i>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentQuizResults;