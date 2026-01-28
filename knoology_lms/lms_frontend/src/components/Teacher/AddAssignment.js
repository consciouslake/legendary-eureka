import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
            <p className="mt-3 text-muted">Processing...</p>
        </div>
    );
};

function AddAssignment() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [studentName, setStudentName] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        course: '',
        assignment_file: null
    });

    useEffect(() => {
        document.title = "Add Assignment | Knoology LMS";

        const fetchStudentAndCourses = async () => {
            try {
                // Fetch student details
                const studentResponse = await axios.get(`${BASE_API_URL}/student/${studentId}/`);
                if (studentResponse.data.status === 'error') {
                    throw new Error(studentResponse.data.message || 'Failed to fetch student details');
                }
                setStudentName(studentResponse.data.fullname);
                console.log("Student details fetched successfully:", studentResponse.data);

                // Fetch enrolled courses
                console.log("Fetching student courses from:", `${BASE_API_URL}/student-courses/${studentId}/`);
                const coursesResponse = await axios.get(`${BASE_API_URL}/student-courses/${studentId}/`);
                console.log("Courses response:", coursesResponse.data);

                if (coursesResponse.data.status === 'success') {
                    setCourses(coursesResponse.data.courses);
                    console.log("Courses set successfully:", coursesResponse.data.courses);
                } else if (coursesResponse.data.status === 'error') {
                    throw new Error(coursesResponse.data.message || 'Failed to fetch student courses');
                }
            } catch (error) {
                console.error('Error fetching data:', error);

                // Handle specific error responses
                if (error.response) {
                    if (error.response.status === 404) {
                        // 404 - Not Found
                        const message = error.response.data.message || `Student with ID ${studentId} not found. Please check the student ID.`;
                        setError(message);
                    } else if (error.response.status === 400) {
                        // 400 - Bad Request 
                        const message = error.response.data.message || 'Invalid request when fetching student data.';
                        setError(message);
                    } else {
                        // Other HTTP errors
                        setError(`Server error: ${error.response.status}. Please try again later.`);
                    }
                } else if (error.message) {
                    // Custom error messages or network errors
                    setError(error.message);
                } else {
                    // Fallback error message
                    setError('Failed to load student data. Please try again later.');
                }
            }
        };

        fetchStudentAndCourses();
    }, [studentId]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            assignment_file: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('due_date', formData.due_date);
            submitData.append('course', formData.course);

            if (formData.assignment_file) {
                console.log("File being uploaded:", formData.assignment_file);
                submitData.append('assignment_file', formData.assignment_file);
            } else {
                console.log("No file selected for upload");
            }

            console.log("Sending assignment data to server...");
            const response = await axios.post(`${BASE_API_URL}/add-assignment/${studentId}/`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Server response:", response.data);

            if (response.data.status === 'success') {
                // Check if file was uploaded correctly
                if (response.data.data.assignment_file) {
                    console.log("File uploaded successfully:", response.data.data.assignment_file);
                    setSuccess(`Assignment added successfully with file: ${response.data.data.assignment_file.split('/').pop()}`);
                } else {
                    console.log("Assignment added but no file was uploaded or included in response");
                    setSuccess('Assignment added successfully!');
                }

                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    due_date: '',
                    course: '',
                    assignment_file: null
                });
                // Clear file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
                // Redirect after 2 seconds
                setTimeout(() => {
                    navigate(`/check-assignments/${studentId}`);
                }, 2000);
            }
        } catch (error) {
            console.error('Error adding assignment:', error);
            setError('Failed to add assignment. Please try again.');
        } finally {
            setLoading(false);
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
                        background: 'linear-gradient(135deg, #2AF598 0%, #08AEEA 100%)',
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
                                    background: 'linear-gradient(45deg, #08AEEA, #2AF598)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(8, 174, 234, 0.3)'
                                }}>
                                    <i className="bi bi-plus-square" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Add Assignment
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Create a new assignment for {studentName}
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
                                    background: 'linear-gradient(135deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-file-earmark-plus" style={{
                                        color: '#08AEEA',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Assignment Details
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
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Success!</h6>
                                            <p className="mb-0">{success}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <Loader size="medium" />
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-section mb-4" style={{
                                        background: 'rgba(42, 245, 152, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <div className="mb-3">
                                            <label htmlFor="course" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Course</label>
                                            <select
                                                className="form-select"
                                                id="course"
                                                name="course"
                                                value={formData.course}
                                                onChange={handleChange}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                            >
                                                <option value="">Select a course</option>
                                                {courses.map(course => (
                                                    <option key={course.id} value={course.id}>
                                                        {course.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="title" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Assignment Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
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

                                    <div className="form-section mb-4" style={{
                                        background: 'rgba(8, 174, 234, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <div className="mb-3">
                                            <label htmlFor="description" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Description</label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="4"
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
                                        background: 'rgba(42, 245, 152, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="due_date" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Due Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    id="due_date"
                                                    name="due_date"
                                                    value={formData.due_date}
                                                    onChange={handleChange}
                                                    min={new Date().toISOString().split('T')[0]}
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
                                                <label htmlFor="assignment_file" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Assignment File (Optional)</label>
                                                <div className="input-group">
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        id="assignment_file"
                                                        name="assignment_file"
                                                        onChange={handleFileChange}
                                                        style={{
                                                            padding: '0.75rem 1rem',
                                                            borderRadius: '10px',
                                                            border: '1px solid #e2e8f0',
                                                            boxShadow: 'none'
                                                        }}
                                                    />
                                                </div>
                                                <div className="d-flex align-items-center mt-2">
                                                    {formData.assignment_file ? (
                                                        <div className="badge bg-success me-2">
                                                            <i className="bi bi-check-circle-fill me-1"></i>
                                                            File selected: {formData.assignment_file.name}
                                                        </div>
                                                    ) : null}
                                                    <div className="form-text text-muted">
                                                        <i className="bi bi-info-circle me-1"></i>
                                                        Upload any additional resources or instructions for the assignment.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between mt-4">
                                        <button
                                            type="button"
                                            onClick={() => navigate(-1)}
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
                                            Back
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn"
                                            disabled={loading}
                                            style={{
                                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.75rem 2rem',
                                                fontWeight: '500',
                                                boxShadow: '0 5px 15px rgba(8, 174, 234, 0.2)'
                                            }}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Add Assignment
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddAssignment;