import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { apiUrl } from '../../config';

function AttemptQuiz() {
    const { quiz_id, student_id, course_id } = useParams();
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attemptId, setAttemptId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);

    // Fetch quiz details and questions when component loads
    useEffect(() => {
        // Check if student is logged in
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
            fetchQuizDetails();
        } catch (error) {
            console.error('Error parsing student info:', error);
            navigate('/user-login');
        }
    }, []);

    // Timer effect - count down time remaining
    useEffect(() => {
        let timer;
        if (quizStarted && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            // Auto submit when time runs out
            handleSubmitQuiz();
        }
        return () => clearTimeout(timer);
    }, [timeLeft, quizStarted]);

    // Format time as minutes:seconds
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Fetch quiz details and questions
    const fetchQuizDetails = async () => {
        setLoading(true);
        try {
            console.log(`Fetching quiz details: quiz_id=${quiz_id}, student_id=${student_id}, course_id=${course_id}`);
            const response = await axios.get(
                `${apiUrl}/get-quiz-for-attempt/${quiz_id}/${student_id}/${course_id}/`
            );
            
            console.log('Quiz data received:', response.data);
            if (response.data.status === 'success') {
                setQuizData(response.data.quiz);
                setQuestions(response.data.questions);
                setAttemptId(response.data.attempt_id);
                // Set default time limit (2 minutes per question, minimum 10 minutes)
                const calculatedTime = Math.max(response.data.questions.length * 120, 600);
                setTimeLeft(calculatedTime);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load quiz. Please try again later.';
            Swal.fire({
                title: 'Error!',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK',
            }).then(() => {
                navigate('/student-available-quizzes');
            });
        }
    };

    // Handle answer selection
    const handleAnswerSelect = (questionId, answer) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [questionId]: answer
        });
    };

    // Navigate to next question
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    // Navigate to previous question
    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // Start the quiz
    const handleStartQuiz = () => {
        Swal.fire({
            title: 'Ready to Start?',
            text: `You'll have ${formatTime(timeLeft)} to complete this quiz. Once you start, the timer cannot be paused.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Start Quiz'
        }).then((result) => {
            if (result.isConfirmed) {
                setQuizStarted(true);
            }
        });
    };

    // Submit the quiz
    const handleSubmitQuiz = async () => {
        // Check if all questions have been answered
        const answeredCount = Object.keys(selectedAnswers).length;
        
        if (answeredCount < questions.length) {
            const result = await Swal.fire({
                title: 'Warning!',
                text: `You've only answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Submit Quiz',
                cancelButtonText: 'Continue Answering'
            });
            
            if (!result.isConfirmed) {
                return;
            }
        }
        
        // Format answers for submission
        const answers = Object.keys(selectedAnswers).map(questionId => ({
            question_id: questionId,
            selected_answer: selectedAnswers[questionId]
        }));
        
        try {
            const response = await axios.post(
                `${apiUrl}/submit-quiz-attempt/${attemptId}/`,
                { answers }
            );
            
            if (response.data.status === 'success') {
                Swal.fire({
                    title: 'Quiz Submitted!',
                    html: `
                        <h5>Quiz Results:</h5>
                        <p>Total Questions: ${response.data.result.total_questions}</p>
                        <p>Correct Answers: ${response.data.result.correct_answers}</p>
                        <p>Marks Obtained: ${response.data.result.obtained_marks} / ${response.data.result.total_marks}</p>
                    `,
                    icon: 'success',
                    confirmButtonText: 'View All Results'
                }).then(() => {
                    navigate('/student-quiz-results');
                });
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to submit quiz. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    // Show quiz introduction
    const renderQuizIntro = () => (
        <div className="text-center p-4">
            <h3>{quizData.title}</h3>
            <p className="mb-4">{quizData.description}</p>
            
            <div className="card mb-4">
                <div className="card-header">Quiz Information</div>
                <div className="card-body">
                    <p><strong>Total Questions:</strong> {quizData.total_questions}</p>
                    <p><strong>Total Marks:</strong> {quizData.total_marks}</p>
                    <p><strong>Time Limit:</strong> {formatTime(timeLeft)}</p>
                </div>
            </div>
            
            <div className="alert alert-info" role="alert">
                <h5>Instructions:</h5>
                <ul className="text-start">
                    <li>Once you start, the timer will begin counting down.</li>
                    <li>You can navigate between questions using the Next and Previous buttons.</li>
                    <li>Your answers are saved as you go.</li>
                    <li>Click "Submit Quiz" when you've finished answering all questions.</li>
                    <li>If the timer runs out, your quiz will be automatically submitted.</li>
                </ul>
            </div>
            
            <button 
                className="btn btn-primary btn-lg"
                onClick={handleStartQuiz}
            >
                Start Quiz
            </button>
        </div>
    );

    // Render current question
    const renderQuestion = () => {
        if (!questions.length) return null;
        
        const currentQuestion = questions[currentQuestionIndex];
        
        return (
            <div>
                <div className="d-flex justify-content-between mb-3">
                    <h5>Question {currentQuestionIndex + 1} of {questions.length}</h5>
                    <h5>Time Remaining: {formatTime(timeLeft)}</h5>
                </div>
                
                <div className="card mb-4">
                    <div className="card-header">
                        {currentQuestion.question_text}
                    </div>
                    <div className="card-body">
                        <div className="list-group">
                            {['ans1', 'ans2', 'ans3', 'ans4'].map((option, idx) => (
                                <label key={idx} className="list-group-item">
                                    <input 
                                        type="radio"
                                        name={`question_${currentQuestion.id}`}
                                        className="form-check-input me-2"
                                        checked={selectedAnswers[currentQuestion.id] === currentQuestion[option]}
                                        onChange={() => handleAnswerSelect(currentQuestion.id, currentQuestion[option])}
                                    />
                                    {currentQuestion[option]}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="d-flex justify-content-between">
                    <button 
                        className="btn btn-secondary"
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </button>
                    
                    {currentQuestionIndex < questions.length - 1 ? (
                        <button 
                            className="btn btn-primary"
                            onClick={handleNextQuestion}
                        >
                            Next
                        </button>
                    ) : (
                        <button 
                            className="btn btn-success"
                            onClick={handleSubmitQuiz}
                        >
                            Submit Quiz
                        </button>
                    )}
                </div>
                
                {/* Question navigation */}
                <div className="mt-4">
                    <h6>Question Navigator:</h6>
                    <div className="d-flex flex-wrap gap-2">
                        {questions.map((q, idx) => (
                            <button 
                                key={idx}
                                className={`btn btn-sm ${
                                    selectedAnswers[q.id] ? 'btn-success' : 
                                    idx === currentQuestionIndex ? 'btn-primary' : 'btn-outline-secondary'
                                }`}
                                onClick={() => setCurrentQuestionIndex(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
                
                {Object.keys(selectedAnswers).length === questions.length && (
                    <div className="mt-4 text-center">
                        <button 
                            className="btn btn-lg btn-success"
                            onClick={handleSubmitQuiz}
                        >
                            Submit Quiz
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container mt-4">
            <div className="row">
                <aside className="col-md-3">
                    <Sidebar />
                </aside>
                <section className="col-md-9">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5>Quiz</h5>
                            {quizStarted && (
                                <button 
                                    className="btn btn-danger"
                                    onClick={handleSubmitQuiz}
                                >
                                    End Quiz Early
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <p className="text-center">Loading quiz...</p>
                            ) : quizStarted ? (
                                renderQuestion()
                            ) : (
                                renderQuizIntro()
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AttemptQuiz;