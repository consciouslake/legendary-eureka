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
                        color: '#3498db',
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
                        background: "linear-gradient(45deg, rgba(52, 152, 219, 0.3), rgba(155, 89, 182, 0.3))"
                    }}></div>
                </div>
            </div>
            <p className="mt-3 text-muted">Loading...</p>
        </div>
    );
};

function AssignQuiz() {
    const { quiz_id } = useParams();
    const navigate = useNavigate();
    const [quizDetail, setQuizDetail] = useState(null);
    const [teacherCourses, setTeacherCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [teacherId, setTeacherId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        document.title = "Assign Quiz | Knoology LMS";
        // Check if teacher is logged in
        const teacherData = localStorage.getItem('teacherData');
        if (!teacherData) {
            navigate('/teacher-login');
            return;
        }

        const { teacherId } = JSON.parse(teacherData);
        setTeacherId(teacherId);
        fetchQuizDetail();
        fetchTeacherCourses(teacherId);
        fetchAssignedCourses();
    }, [navigate, quiz_id]);

    // Fetch quiz details
    const fetchQuizDetail = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiUrl}/quiz-detail/${quiz_id}/`);
            setQuizDetail(response.data);
        } catch (error) {
            console.error('Error fetching quiz details:', error);
            setError('Failed to load quiz details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch teacher's courses
    const fetchTeacherCourses = async (teacherId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiUrl}/teacher-courses/${teacherId}/`);
            setTeacherCourses(response.data);
        } catch (error) {
            console.error('Error fetching teacher courses:', error);
            setError('Failed to load courses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch courses where this quiz is already assigned
    const fetchAssignedCourses = async () => {
        try {
            setLoading(true);
            const courseResponse = await axios.get(`${apiUrl}/course-assigned-quizzes/${quiz_id}/`);
            // Filter to get only assignments for this quiz
            const assignments = courseResponse.data.data.filter(
                assignment => assignment.quiz === parseInt(quiz_id)
            );
            setAssignedCourses(assignments);
        } catch (error) {
            console.error('Error fetching assigned courses:', error);
            // Don't show error to user, just set empty array
            setAssignedCourses([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle assigning quiz to course
    const handleAssignQuiz = async (e) => {
        e.preventDefault();

        if (!selectedCourse) {
            setError('Please select a course');
            return;
        }

        // Check if quiz is already assigned to this course
        const isAlreadyAssigned = assignedCourses.some(
            assignment => assignment.course === parseInt(selectedCourse)
        );

        if (isAlreadyAssigned) {
            setError('This quiz is already assigned to the selected course');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const response = await axios.post(`${apiUrl}/assign-quiz-to-course/`, {
                quiz_id: quiz_id,
                course_id: selectedCourse,
            });

            if (response.status === 201) {
                setSuccess(response.data.message || 'Quiz assigned successfully!');

                // Reset form and refresh assignments
                setSelectedCourse('');
                fetchAssignedCourses();
            }
        } catch (error) {
            console.error('Error assigning quiz:', error);
            setError('Failed to assign quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle removing quiz from course
    const handleRemoveAssignment = async (assignmentId) => {
        // Confirm removal
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will remove the quiz from the course and students will no longer have access to it.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!'
        });

        if (result.isConfirmed) {
            try {
                setLoading(true);
                setError('');
                setSuccess('');

                const response = await axios.delete(`${apiUrl}/remove-quiz-from-course/${assignmentId}/`);

                if (response.status === 200) {
                    setSuccess('Quiz has been removed from the course successfully.');
                    // Refresh assignments
                    fetchAssignedCourses();
                }
            } catch (error) {
                console.error('Error removing quiz assignment:', error);
                setError('Failed to remove quiz from course.');
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
                        background: 'linear-gradient(135deg, #3498db 0%, #9b59b6 100%)',
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
                                    background: 'linear-gradient(45deg, #3498db, #9b59b6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(52, 152, 219, 0.3)'
                                }}>
                                    <i className="bi bi-link-45deg" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Assign Quiz
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Link quizzes to your courses
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

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

                    {/* Quiz Details Card */}
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
                                    background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-info-circle" style={{
                                        color: '#3498db',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Quiz Details
                                </h5>
                            </div>
                        </div>
                        <div className="section-body p-4">
                            {loading && !quizDetail ? (
                                <Loader size="medium" />
                            ) : quizDetail ? (
                                <div className="row">
                                    <div className="col-md-6">
                                        <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                            <tbody>
                                                <tr style={{ background: 'rgba(52, 152, 219, 0.03)' }}>
                                                    <th style={{ padding: '15px', fontWeight: '600', color: '#506690', width: '40%' }}>Title</th>
                                                    <td style={{ padding: '15px', color: '#002254' }}>{quizDetail.title}</td>
                                                </tr>
                                                <tr style={{ background: 'rgba(52, 152, 219, 0.03)' }}>
                                                    <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Description</th>
                                                    <td style={{ padding: '15px', color: '#002254' }}>{quizDetail.description}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-md-6">
                                        <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                            <tbody>
                                                <tr style={{ background: 'rgba(155, 89, 182, 0.03)' }}>
                                                    <th style={{ padding: '15px', fontWeight: '600', color: '#506690', width: '40%' }}>Total Marks</th>
                                                    <td style={{ padding: '15px', color: '#002254' }}>
                                                        <span className="badge" style={{
                                                            background: 'rgba(52, 152, 219, 0.1)',
                                                            color: '#3498db',
                                                            fontWeight: '600',
                                                            padding: '5px 12px',
                                                            borderRadius: '30px'
                                                        }}>
                                                            {quizDetail.total_marks}
                                                        </span>
                                                    </td>
                                                </tr>
                                                <tr style={{ background: 'rgba(155, 89, 182, 0.03)' }}>
                                                    <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Questions</th>
                                                    <td style={{ padding: '15px', color: '#002254' }}>
                                                        <span className="badge" style={{
                                                            background: 'rgba(155, 89, 182, 0.1)',
                                                            color: '#9b59b6',
                                                            fontWeight: '600',
                                                            padding: '5px 12px',
                                                            borderRadius: '30px'
                                                        }}>
                                                            {quizDetail.total_questions}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="alert" style={{
                                    background: 'rgba(255, 193, 7, 0.1)',
                                    color: '#ffc107',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px'
                                }} role="alert">
                                    No quiz details available.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assign to Course Form */}
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
                                    background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-plus-circle" style={{
                                        color: '#3498db',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Assign to Course
                                </h5>
                            </div>
                        </div>
                        <div className="section-body p-4">
                            {loading && teacherCourses.length === 0 ? (
                                <Loader size="medium" />
                            ) : (
                                <form onSubmit={handleAssignQuiz}>
                                    <div className="form-section" style={{
                                        background: 'rgba(52, 152, 219, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <div className="mb-3">
                                            <label htmlFor="courseSelect" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Select Course</label>
                                            <select
                                                className="form-select"
                                                id="courseSelect"
                                                value={selectedCourse}
                                                onChange={(e) => setSelectedCourse(e.target.value)}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                            >
                                                <option value="">Choose a course</option>
                                                {teacherCourses.map((course, index) => (
                                                    <option key={index} value={course.id}>
                                                        {course.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="text-center mt-4">
                                            <button
                                                type="submit"
                                                className="btn"
                                                disabled={loading}
                                                style={{
                                                    background: 'linear-gradient(45deg, #3498db, #9b59b6)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50px',
                                                    padding: '0.75rem 2rem',
                                                    fontWeight: '500',
                                                    boxShadow: '0 5px 15px rgba(52, 152, 219, 0.2)'
                                                }}
                                            >
                                                <i className="bi bi-link me-2"></i>
                                                Assign Quiz
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Assigned Courses List */}
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
                                    background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-list-check" style={{
                                        color: '#9b59b6',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Assigned Courses
                                </h5>
                            </div>
                        </div>
                        <div className="section-body p-4">
                            {loading ? (
                                <Loader size="medium" />
                            ) : assignedCourses.length === 0 ? (
                                <div className="empty-state p-5 text-center">
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <i className="bi bi-journals" style={{
                                            color: '#3498db',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Courses Assigned</h5>
                                    <p className="text-muted mb-4">This quiz is not assigned to any courses yet.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(52, 152, 219, 0.03)' }}>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>#</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Course</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Assigned On</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignedCourses.map((assignment, index) => (
                                                <tr key={index} style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '10px' }}>
                                                    <td style={{ padding: '15px', fontWeight: '500', color: '#002254' }}>{index + 1}</td>
                                                    <td style={{ padding: '15px' }}>{assignment.course_title}</td>
                                                    <td style={{ padding: '15px' }}>{new Date(assignment.assigned_at).toLocaleDateString()}</td>
                                                    <td style={{ padding: '15px' }}>
                                                        <button
                                                            onClick={() => handleRemoveAssignment(assignment.id)}
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
                                                            <i className="bi bi-trash me-1"></i> Remove
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

export default AssignQuiz;