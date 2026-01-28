import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
                        color: '#6a11cb',
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
                        background: "linear-gradient(45deg, rgba(106, 17, 203, 0.3), rgba(37, 117, 252, 0.3))"
                    }}></div>
                </div>
            </div>
            <p className="mt-3 text-muted">Loading...</p>
        </div>
    );
};

function AddQuizQuestion() {
    const { quiz_id } = useParams();
    const navigate = useNavigate();
    const [questionText, setQuestionText] = useState('');
    const [ans1, setAns1] = useState('');
    const [ans2, setAns2] = useState('');
    const [ans3, setAns3] = useState('');
    const [ans4, setAns4] = useState('');
    const [rightAns, setRightAns] = useState('');
    const [quizTitle, setQuizTitle] = useState('');
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [teacherId, setTeacherId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch quiz details and existing questions
    useEffect(() => {
        document.title = "Add Quiz Questions | Knoology LMS";
        // Check if teacher is logged in
        const teacherData = localStorage.getItem('teacherData');
        if (!teacherData) {
            navigate('/teacher-login');
            return;
        }

        const { teacherId } = JSON.parse(teacherData);
        setTeacherId(teacherId);
        fetchQuizDetails();
        fetchQuizQuestions();
    }, [navigate, quiz_id]);

    const fetchQuizDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiUrl}/quiz-detail/${quiz_id}/`);
            setQuizTitle(response.data.title);
        } catch (error) {
            console.error('Error fetching quiz details:', error);
            setError('Failed to load quiz details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizQuestions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiUrl}/quiz-questions/${quiz_id}/`);
            setQuizQuestions(response.data.questions);
        } catch (error) {
            console.error('Error fetching quiz questions:', error);
            setError('Failed to load quiz questions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission to add a new question
    const handleAddQuestion = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validation
        if (!questionText || !ans1 || !ans2 || !ans3 || !ans4 || !rightAns) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        // Validate that right answer is one of the options
        if (![ans1, ans2, ans3, ans4].includes(rightAns)) {
            setError('The right answer must match one of the options');
            setLoading(false);
            return;
        }

        // Create question data object
        const questionData = {
            question_text: questionText,
            ans1: ans1,
            ans2: ans2,
            ans3: ans3,
            ans4: ans4,
            right_ans: rightAns,
        };

        try {
            const response = await axios.post(
                `${apiUrl}/add-quiz-question/${quiz_id}/`,
                questionData
            );

            if (response.status === 201) {
                setSuccess('Question added successfully!');

                // Reset form
                resetForm();

                // Refresh questions list
                fetchQuizQuestions();
            }
        } catch (error) {
            console.error('Error adding question:', error);
            setError('Failed to add question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setQuestionText('');
        setAns1('');
        setAns2('');
        setAns3('');
        setAns4('');
        setRightAns('');
    };

    // Handle question deletion
    const handleDeleteQuestion = async (questionId) => {
        // Confirm deletion
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                const response = await axios.delete(`${apiUrl}/quiz-question-detail/${questionId}/`);

                if (response.status === 200) {
                    setSuccess('Question has been deleted successfully!');
                    // Refresh quiz questions
                    fetchQuizQuestions();
                }
            } catch (error) {
                console.error('Error deleting question:', error);
                setError('Failed to delete question. Please try again.');
            } finally {
                setLoading(false);
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
                                    boxShadow: '0 10px 20px rgba(106, 17, 203, 0.3)'
                                }}>
                                    <i className="bi bi-question-diamond" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Add Quiz Questions
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        {quizTitle ? `Quiz: ${quizTitle}` : 'Create questions for your quiz'}
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
                                    <i className="bi bi-plus-circle" style={{
                                        color: '#6a11cb',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Add New Question
                                </h5>
                            </div>
                        </div>

                        <div className="section-body p-4">
                            {error && (
                                <div className="alert mb-4" style={{
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
                            )}

                            {success && (
                                <div className="alert mb-4" style={{
                                    background: 'rgba(25, 135, 84, 0.1)',
                                    color: '#198754',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px'
                                }} role="alert">
                                    <div className="d-flex">
                                        <div style={{ marginRight: '15px' }}>
                                            <i className="bi bi-check-circle-fill" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Success</h6>
                                            <p className="mb-0">{success}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <Loader size="medium" />
                            ) : (
                                <form onSubmit={handleAddQuestion}>
                                    <div className="form-section mb-4" style={{
                                        background: 'rgba(106, 17, 203, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <div className="mb-3">
                                            <label htmlFor="questionText" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Question Text</label>
                                            <textarea
                                                className="form-control"
                                                id="questionText"
                                                value={questionText}
                                                onChange={(e) => setQuestionText(e.target.value)}
                                                rows="3"
                                                placeholder="Enter question text"
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="form-section mb-4" style={{
                                        background: 'rgba(37, 117, 252, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <h6 className="mb-3" style={{ color: '#506690', fontWeight: '600' }}>Answer Options</h6>
                                        <div className="row mb-3">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="ans1" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Option 1</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="ans1"
                                                    value={ans1}
                                                    onChange={(e) => setAns1(e.target.value)}
                                                    placeholder="Enter option 1"
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        borderRadius: '10px',
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: 'none'
                                                    }}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="ans2" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Option 2</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="ans2"
                                                    value={ans2}
                                                    onChange={(e) => setAns2(e.target.value)}
                                                    placeholder="Enter option 2"
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        borderRadius: '10px',
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: 'none'
                                                    }}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="ans3" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Option 3</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="ans3"
                                                    value={ans3}
                                                    onChange={(e) => setAns3(e.target.value)}
                                                    placeholder="Enter option 3"
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        borderRadius: '10px',
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: 'none'
                                                    }}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="ans4" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Option 4</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="ans4"
                                                    value={ans4}
                                                    onChange={(e) => setAns4(e.target.value)}
                                                    placeholder="Enter option 4"
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        borderRadius: '10px',
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: 'none'
                                                    }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="rightAns" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Correct Answer</label>
                                            <select
                                                className="form-select"
                                                id="rightAns"
                                                value={rightAns}
                                                onChange={(e) => setRightAns(e.target.value)}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                            >
                                                <option value="">Select the correct answer</option>
                                                {ans1 && <option value={ans1}>{ans1}</option>}
                                                {ans2 && <option value={ans2}>{ans2}</option>}
                                                {ans3 && <option value={ans3}>{ans3}</option>}
                                                {ans4 && <option value={ans4}>{ans4}</option>}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="text-center mt-4">
                                        <button
                                            type="submit"
                                            className="btn"
                                            style={{
                                                background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.75rem 2rem',
                                                fontWeight: '500',
                                                boxShadow: '0 5px 15px rgba(106, 17, 203, 0.2)'
                                            }}
                                            disabled={loading}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Add Question
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Questions List */}
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
                                        color: '#6a11cb',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Current Questions ({quizQuestions.length})
                                </h5>
                            </div>
                        </div>
                        <div className="section-body p-4">
                            {loading ? (
                                <Loader size="medium" />
                            ) : quizQuestions.length === 0 ? (
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
                                        <i className="bi bi-question-circle" style={{
                                            color: '#6a11cb',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Questions Yet</h5>
                                    <p className="text-muted mb-4">Add your first question using the form above.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(106, 17, 203, 0.03)' }}>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>#</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Question</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Options</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Right Answer</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quizQuestions.map((question, index) => (
                                                <tr key={index} style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '10px' }}>
                                                    <td style={{ padding: '15px', fontWeight: '500', color: '#002254' }}>{index + 1}</td>
                                                    <td style={{ padding: '15px' }}>{question.question_text.length > 50 ? `${question.question_text.substring(0, 50)}...` : question.question_text}</td>
                                                    <td style={{ padding: '15px' }}>
                                                        <ol className="ps-3 mb-0">
                                                            <li>{question.ans1}</li>
                                                            <li>{question.ans2}</li>
                                                            <li>{question.ans3}</li>
                                                            <li>{question.ans4}</li>
                                                        </ol>
                                                    </td>
                                                    <td style={{ padding: '15px', fontWeight: '500' }}>
                                                        <span className="badge" style={{
                                                            background: 'rgba(25, 135, 84, 0.1)',
                                                            color: '#198754',
                                                            fontWeight: '500',
                                                            padding: '5px 10px',
                                                            borderRadius: '30px'
                                                        }}>
                                                            {question.right_ans}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <button
                                                            onClick={() => handleDeleteQuestion(question.id)}
                                                            className="btn btn-sm"
                                                            style={{
                                                                background: 'rgba(220, 53, 69, 0.1)',
                                                                color: '#dc3545',
                                                                border: 'none',
                                                                borderRadius: '50px',
                                                                padding: '0.3rem 0.8rem',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            <i className="bi bi-trash me-1"></i> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className="d-flex justify-content-center mt-4">
                                <Link
                                    to="/teacher-quizzes"
                                    className="btn"
                                    style={{
                                        background: '#f8f9fa',
                                        color: '#506690',
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '0.75rem 1.5rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Back to Quizzes
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddQuizQuestion;