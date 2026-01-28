import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import axios from 'axios';
import { apiUrl } from '../../config';
import Swal from 'sweetalert2';

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
            <p className="mt-3 text-muted">Loading teachers data...</p>
        </div>
    );
};

function MyTeachers() {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [studentId, setStudentId] = useState(null);

    useEffect(() => {
        document.title = "My Teachers | Knoology LMS";
        // Check if student is logged in
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) {
            navigate('/user-login');
            return;
        }

        const fetchTeachers = async () => {
            try {
                const { studentId } = JSON.parse(studentInfo);
                setStudentId(studentId);
                // Fetch teachers who teach courses the student is enrolled in
                const response = await axios.get(`${apiUrl}/student-enrolled-teachers/${studentId}/`);
                if (response.data.status === 'success') {
                    setTeachers(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching teachers:', error);
                setError('Failed to load teachers. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, [navigate]);

    // Function to open SweetAlert2 dialog for messaging
    const openChatDialog = (teacher) => {
        Swal.fire({
            title: `Message ${teacher.full_name}`,
            html:
                '<div class="form-group mb-3">' +
                '<label for="message-text" class="form-label">Type your message:</label>' +
                '<textarea id="message-text" class="form-control" placeholder="Enter your message here..."></textarea>' +
                '</div>',
            showCancelButton: true,
            confirmButtonText: 'Send Message',
            cancelButtonText: 'Cancel',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const messageText = document.getElementById('message-text').value.trim();
                if (!messageText) {
                    Swal.showValidationMessage('Please enter a message');
                    return false;
                }
                return messageText;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                sendMessage(teacher.id, result.value);
            }
        });
    };

    // Function to send message to a teacher
    const sendMessage = async (teacherId, message) => {
        try {
            const messageData = {
                student_id: studentId,
                teacher_id: teacherId,
                message: message,
                message_from: 'student'
            };

            const response = await axios.post(`${apiUrl}/send-message/`, messageData);

            if (response.data.status === 'success') {
                Swal.fire({
                    title: 'Success!',
                    text: 'Message sent successfully',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to send message. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    // Function to navigate to chat with specific teacher
    const goToChat = (teacherId) => {
        // Store the selected teacher ID to use in the chat panel
        localStorage.setItem('selectedTeacherId', teacherId);
        navigate('/student-chat');
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
                                    <i className="bi bi-person-video3" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        My Teachers
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        <span style={{ fontWeight: '600' }}>{teachers.length}</span> teachers
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
                                    background: 'linear-gradient(135deg, rgba(8, 174, 234, 0.1), rgba(42, 245, 152, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-mortarboard" style={{
                                        color: '#08AEEA',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Instructors
                                </h5>
                            </div>

                            <div>
                                <Link to="/student-chat" className="btn btn-sm" style={{
                                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    padding: '0.5rem 1.2rem',
                                    fontWeight: '500'
                                }}>
                                    <i className="bi bi-chat-dots me-2"></i>
                                    All Conversations
                                </Link>
                            </div>
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

                            {teachers.length === 0 ? (
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
                                        <i className="bi bi-mortarboard" style={{
                                            color: '#08AEEA',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Teachers Yet</h5>
                                    <p className="text-muted mb-4">Enroll in courses to connect with teachers.</p>
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
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Teacher</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Contact</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Courses</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teachers.map(teacher => (
                                                <tr key={teacher.id} style={{
                                                    borderBottom: '1px solid #f0f0f0',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <Link
                                                            to={`/teacher-detail/${teacher.id}`}
                                                            className="d-flex align-items-center"
                                                            style={{
                                                                color: '#002254',
                                                                fontWeight: '500',
                                                                textDecoration: 'none',
                                                                transition: 'color 0.2s'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.color = '#08AEEA'}
                                                            onMouseLeave={(e) => e.target.style.color = '#002254'}
                                                        >
                                                            <div style={{
                                                                width: '45px',
                                                                height: '45px',
                                                                borderRadius: '50%',
                                                                background: '#f0f0f0',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                marginRight: '10px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <img
                                                                    src={teacher.profile_img || '/teacher-default.png'}
                                                                    alt={teacher.full_name}
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover'
                                                                    }}
                                                                    onError={(e) => {
                                                                        // Prevent infinite loop by removing the error handler
                                                                        e.target.onError = null;

                                                                        // Use a data URI with fixed content instead of dynamic text to avoid encoding issues
                                                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='45' height='45' viewBox='0 0 45 45'%3E%3Crect width='45' height='45' fill='%2308AEEA'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='20' fill='white' text-anchor='middle' dominant-baseline='middle'%3ET%3C/text%3E%3C/svg%3E";

                                                                        // Add a nice background color and style
                                                                        e.target.style.backgroundColor = '#08AEEA';
                                                                        e.target.style.display = 'flex';
                                                                        e.target.style.alignItems = 'center';
                                                                        e.target.style.justifyContent = 'center';
                                                                    }}
                                                                />
                                                            </div>
                                                            <span>{teacher.full_name}</span>
                                                        </Link>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <div>
                                                            <a
                                                                href={`mailto:${teacher.email}`}
                                                                style={{
                                                                    color: '#506690',
                                                                    textDecoration: 'none',
                                                                    transition: 'color 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.color = '#08AEEA'}
                                                                onMouseLeave={(e) => e.target.style.color = '#506690'}
                                                            >
                                                                <i className="bi bi-envelope me-2"></i>{teacher.email}
                                                            </a>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <div>
                                                            {teacher.courses.map(course => (
                                                                <Link
                                                                    key={course.id}
                                                                    to={`/detail/${course.id}`}
                                                                    className="d-block mb-1"
                                                                    style={{
                                                                        color: '#506690',
                                                                        textDecoration: 'none',
                                                                        transition: 'color 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => e.target.style.color = '#08AEEA'}
                                                                    onMouseLeave={(e) => e.target.style.color = '#506690'}
                                                                >
                                                                    <i className="bi bi-journal-text me-2" style={{ color: '#08AEEA' }}></i>
                                                                    {course.title}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                onClick={() => openChatDialog(teacher)}
                                                                className="btn btn-sm"
                                                                title="Send a quick message to this teacher"
                                                                style={{
                                                                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '50px',
                                                                    padding: '0.35rem 1rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-chat-text me-1"></i>
                                                                Quick Message
                                                            </button>
                                                            <button
                                                                onClick={() => goToChat(teacher.id)}
                                                                className="btn btn-sm"
                                                                title="Open chat history with this teacher"
                                                                style={{
                                                                    background: 'white',
                                                                    color: '#08AEEA',
                                                                    border: '1px solid #08AEEA',
                                                                    borderRadius: '50px',
                                                                    padding: '0.35rem 1rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-chat-dots me-1"></i>
                                                                Open Chat
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

export default MyTeachers;