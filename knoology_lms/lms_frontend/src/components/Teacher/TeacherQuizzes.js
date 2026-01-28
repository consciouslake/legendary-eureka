import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
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
                        color: '#8e44ad',
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
            <p className="mt-3 text-muted">Loading quizzes...</p>
        </div>
    );
};

function TeacherQuizzes() {
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [totalMarks, setTotalMarks] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [teacherId, setTeacherId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch teacher's quizzes when component loads
    useEffect(() => {
        document.title = "My Quizzes | Knoology LMS";

        // Check if teacher is logged in
        const teacherData = localStorage.getItem('teacherData');
        if (!teacherData) {
            navigate('/teacher-login');
            return;
        }

        const { teacherId } = JSON.parse(teacherData);
        setTeacherId(teacherId);
        fetchQuizzes(teacherId);
    }, []);

    // Fetch all quizzes created by this teacher
    const fetchQuizzes = async (teacherId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/teacher-quizzes/${teacherId}/`);
            setQuizData(response.data);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load quizzes. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle quiz creation
    const handleCreateQuiz = async (e) => {
        e.preventDefault();

        // Validation
        if (!quizTitle || !quizDescription || !totalMarks) {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill all the fields',
                icon: 'error',
                confirmButtonText: 'OK',
            });
            return;
        }

        // Create quiz data object
        const quizFormData = {
            title: quizTitle,
            description: quizDescription,
            total_marks: parseInt(totalMarks),
        };

        try {
            const response = await axios.post(
                `${apiUrl}/teacher-quizzes/${teacherId}/`,
                quizFormData
            );

            if (response.status === 201) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Quiz has been created successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });

                // Reset form
                setQuizTitle('');
                setQuizDescription('');
                setTotalMarks('');
                setShowModal(false);

                // Refresh quiz list
                fetchQuizzes(teacherId);
            }
        } catch (error) {
            console.error('Error creating quiz:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to create quiz. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    // Handle quiz deletion
    const handleDeleteQuiz = async (quizId) => {
        // Confirm deletion
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8e44ad',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`${apiUrl}/quiz-detail/${quizId}/`);

                if (response.status === 200) {
                    Swal.fire(
                        'Deleted!',
                        'Your quiz has been deleted.',
                        'success'
                    );
                    // Refresh quiz list
                    fetchQuizzes(teacherId);
                }
            } catch (error) {
                console.error('Error deleting quiz:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete quiz. It might be used in courses.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        }
    };

    return (
        <div className='container-fluid pb-4 px-4' style={{ paddingTop: '100px' }}>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <TeacherSidebar />
                </div>
                <div className='col-md-9'>
                    {/* Page Header */}
                    <div className="page-header" style={{
                        background: 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)',
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
                                    background: 'linear-gradient(45deg, #5b2c6f, #8e44ad)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(142, 68, 173, 0.3)'
                                }}>
                                    <i className="bi bi-question-diamond" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        My Quizzes
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
                                    background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.1), rgba(91, 44, 111, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-list-check" style={{
                                        color: '#8e44ad',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Quiz Management
                                </h5>
                            </div>

                            <button
                                className="btn"
                                style={{
                                    background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    padding: '0.5rem 1.5rem',
                                    fontWeight: '500',
                                    boxShadow: '0 4px 10px rgba(142, 68, 173, 0.2)'
                                }}
                                onClick={() => setShowModal(true)}
                            >
                                <i className="bi bi-plus-circle me-2"></i>
                                Create Quiz
                            </button>
                        </div>

                        <div className="section-body p-4">
                            {loading ? (
                                <Loader />
                            ) : quizData.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table" style={{
                                        borderCollapse: 'separate',
                                        borderSpacing: '0 10px'
                                    }}>
                                        <thead>
                                            <tr style={{
                                                background: 'rgba(142, 68, 173, 0.05)'
                                            }}>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                                                }}>Title</th>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                                                }}>Description</th>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                                                }}>Marks</th>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                                                }}>Questions</th>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                                                }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quizData.map((quiz, index) => (
                                                <tr key={index} style={{
                                                    background: 'white',
                                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                                                    borderRadius: '10px',
                                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                                }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ fontWeight: '500', color: '#212529' }}>
                                                            {quiz.title}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ color: '#6c757d' }}>
                                                            {quiz.description.substring(0, 50)}...
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{
                                                            padding: '6px 12px',
                                                            borderRadius: '50px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '500',
                                                            background: 'rgba(142, 68, 173, 0.1)',
                                                            color: '#8e44ad'
                                                        }}>
                                                            {quiz.total_marks} Points
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                                        <div style={{
                                                            fontWeight: '600',
                                                            fontSize: '1.1rem',
                                                            color: '#495057'
                                                        }}>
                                                            {quiz.total_questions}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <div className="d-flex gap-2">
                                                            <Link
                                                                to={`/add-quiz-question/${quiz.id}`}
                                                                className="btn btn-sm"
                                                                style={{
                                                                    background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '50px',
                                                                    padding: '0.4rem 0.8rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-plus-circle me-1"></i>
                                                                Questions
                                                            </Link>
                                                            <Link
                                                                to={`/assign-quiz/${quiz.id}`}
                                                                className="btn btn-sm"
                                                                style={{
                                                                    background: 'linear-gradient(45deg, #20c997, #0ca678)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '50px',
                                                                    padding: '0.4rem 0.8rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-link me-1"></i>
                                                                Assign
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeleteQuiz(quiz.id)}
                                                                className="btn btn-sm"
                                                                style={{
                                                                    background: 'linear-gradient(45deg, #dc3545, #bd2130)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '50px',
                                                                    padding: '0.4rem 0.8rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-trash me-1"></i>
                                                                Delete
                                                            </button>
                                                        </div>
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
                                        borderRadius: '50%',
                                        background: 'rgba(142, 68, 173, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 20px'
                                    }}>
                                        <i className="bi bi-question-diamond" style={{
                                            fontSize: '2rem',
                                            color: '#8e44ad'
                                        }}></i>
                                    </div>
                                    <h4 style={{ color: '#495057', fontWeight: '600' }}>No Quizzes Yet</h4>
                                    <p className="text-muted mb-4">You haven't created any quizzes yet. Get started by creating your first quiz.</p>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="btn"
                                        style={{
                                            background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '0.6rem 1.5rem',
                                            fontWeight: '500',
                                            boxShadow: '0 4px 10px rgba(142, 68, 173, 0.2)'
                                        }}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Create Your First Quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Quiz Modal */}
            {showModal && (
                <div className="modal-backdrop" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1050
                }}>
                    <div className="modal-content" style={{
                        background: 'white',
                        borderRadius: '20px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                        padding: '0',
                        position: 'relative'
                    }}>
                        <div className="modal-header" style={{
                            background: 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)',
                            borderRadius: '20px 20px 0 0',
                            padding: '20px 25px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.05)'
                            }}></div>

                            <div className="d-flex justify-content-between w-100 align-items-center" style={{ position: 'relative', zIndex: 1 }}>
                                <div className="d-flex align-items-center">
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(45deg, #5b2c6f, #8e44ad)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '15px',
                                        boxShadow: '0 5px 15px rgba(142, 68, 173, 0.3)'
                                    }}>
                                        <i className="bi bi-plus-circle" style={{ color: 'white', fontSize: '1.2rem' }}></i>
                                    </div>
                                    <div>
                                        <h5 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                            Create New Quiz
                                        </h5>
                                    </div>
                                </div>

                                <button
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowModal(false)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                                >
                                    <i className="bi bi-x-lg" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </button>
                            </div>
                        </div>

                        <div className="modal-body p-4">
                            <form onSubmit={handleCreateQuiz}>
                                <div className="mb-3">
                                    <label htmlFor="quizTitle" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-chat-square-text me-2" style={{ color: '#8e44ad' }}></i>
                                        Quiz Title
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="quizTitle"
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                        placeholder="Enter quiz title"
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: 'none'
                                        }}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="quizDescription" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-file-text me-2" style={{ color: '#8e44ad' }}></i>
                                        Description
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="quizDescription"
                                        value={quizDescription}
                                        onChange={(e) => setQuizDescription(e.target.value)}
                                        rows="3"
                                        placeholder="Enter quiz description"
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: 'none'
                                        }}
                                        required
                                    ></textarea>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="totalMarks" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-award me-2" style={{ color: '#8e44ad' }}></i>
                                        Total Marks
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="totalMarks"
                                        value={totalMarks}
                                        onChange={(e) => setTotalMarks(e.target.value)}
                                        placeholder="Enter total marks"
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: 'none'
                                        }}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="d-flex justify-content-end mt-4 gap-3">
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{
                                            background: '#f8f9fa',
                                            color: '#6c757d',
                                            borderRadius: '50px',
                                            padding: '0.6rem 1.5rem',
                                            fontWeight: '500',
                                            border: 'none'
                                        }}
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn"
                                        style={{
                                            background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '0.6rem 1.5rem',
                                            fontWeight: '500',
                                            boxShadow: '0 4px 10px rgba(142, 68, 173, 0.2)'
                                        }}
                                    >
                                        <i className="bi bi-check2-circle me-2"></i>
                                        Create Quiz
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeacherQuizzes;