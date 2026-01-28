import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import axios from 'axios';
import Swal from 'sweetalert2';

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
            <p className="mt-3 text-muted">Loading students data...</p>
        </div>
    );
};

function UserList() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [teacherId, setTeacherId] = useState(null);

    useEffect(() => {
        document.title = "My Students | Knoology LMS";
        // Check if teacher is logged in
        const teacherData = localStorage.getItem('teacherData');
        if (!teacherData) {
            navigate('/teacher-login');
            return;
        }

        const fetchStudents = async () => {
            try {
                const parsedData = JSON.parse(teacherData);
                setTeacherId(parsedData.teacherId);
                // Modified to include teacherId in the request
                const response = await axios.get(`${BASE_API_URL}/teacher-enrolled-students/${parsedData.teacherId}/`);
                if (response.data.status === 'success') {
                    setStudents(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
                setError('Failed to load students. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [navigate]);

    // Function to open SweetAlert2 dialog for messaging
    const openChatDialog = (student) => {
        Swal.fire({
            title: `Message ${student.fullname}`,
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
                sendMessage(student.id, result.value);
            }
        });
    };

    // Function to open dialog for messaging all students
    const openMessageAllDialog = () => {
        if (students.length === 0) {
            Swal.fire({
                title: 'No Students',
                text: 'There are no enrolled students to message.',
                icon: 'info'
            });
            return;
        }

        Swal.fire({
            title: `Message All Students (${students.length})`,
            html:
                '<div class="form-group mb-3">' +
                '<label for="message-text" class="form-label">Type your message to send to all students:</label>' +
                '<textarea id="message-text" class="form-control" rows="4" placeholder="Enter your message here..."></textarea>' +
                '</div>',
            showCancelButton: true,
            confirmButtonText: 'Send to All',
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
                sendMessageToAllStudents(result.value);
            }
        });
    };

    // Function to send message to a student
    const sendMessage = async (studentId, message) => {
        try {
            const messageData = {
                teacher_id: teacherId,
                student_id: studentId,
                message: message,
                message_from: 'teacher'
            };

            const response = await axios.post(`${BASE_API_URL}/send-message/`, messageData);

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

    // Function to send message to all students
    const sendMessageToAllStudents = async (message) => {
        if (!teacherId || students.length === 0) {
            Swal.fire({
                title: 'Error!',
                text: 'No students to message or teacher ID not found.',
                icon: 'error'
            });
            return;
        }

        // Show progress dialog
        let timerInterval;
        Swal.fire({
            title: 'Sending Messages',
            html: `Sending messages to <b>0</b>/${students.length} students...`,
            timer: 2000000,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                const timer = Swal.getPopup().querySelector('b');
                timerInterval = setInterval(() => { }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        });

        // Send message to each student one by one
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < students.length; i++) {
            try {
                const student = students[i];
                const messageData = {
                    teacher_id: teacherId,
                    student_id: student.id,
                    message: message,
                    message_from: 'teacher'
                };

                const response = await axios.post(`${BASE_API_URL}/send-message/`, messageData);

                if (response.data.status === 'success') {
                    successCount++;
                } else {
                    failCount++;
                }

                // Update progress in the dialog
                Swal.getPopup().querySelector('b').textContent = successCount;

            } catch (error) {
                console.error(`Error sending message to student ${students[i].id}:`, error);
                failCount++;
            }
        }

        // Close the progress dialog
        Swal.close();

        // Show final results
        Swal.fire({
            title: 'Broadcast Complete',
            html: `
                <div class="text-center">
                    <p><b>${successCount}</b> messages sent successfully</p>
                    ${failCount > 0 ? `<p><b>${failCount}</b> messages failed to send</p>` : ''}
                </div>
            `,
            icon: successCount > 0 ? 'success' : 'error',
            confirmButtonText: 'OK'
        });
    };

    // Function to navigate to chat with specific student
    const goToChat = (studentId) => {
        // Store the selected student ID to use in the chat panel
        localStorage.setItem('selectedStudentId', studentId);
        navigate('/teacher-chat');
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
                        background: 'linear-gradient(135deg, #28a745 0%, #198754 100%)',
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
                                    background: 'linear-gradient(45deg, #198754, #28a745)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(40, 167, 69, 0.3)'
                                }}>
                                    <i className="bi bi-people-fill" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        My Students
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Manage your students and communications
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
                                    background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(25, 135, 84, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-people" style={{
                                        color: '#28a745',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Student List ({students.length})
                                </h5>
                            </div>
                            <button
                                className="btn"
                                onClick={openMessageAllDialog}
                                disabled={students.length === 0}
                                style={{
                                    background: students.length === 0 ? '#f8f9fa' : 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                    color: students.length === 0 ? '#6c757d' : 'white',
                                    fontWeight: '500',
                                    borderRadius: '50px',
                                    padding: '0.6rem 1.5rem',
                                    border: 'none',
                                    boxShadow: students.length === 0 ? 'none' : '0 5px 15px rgba(8, 174, 234, 0.2)'
                                }}
                            >
                                <i className="bi bi-envelope me-2"></i>
                                Message All Students
                            </button>
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
                            ) : students.length === 0 ? (
                                <div className="empty-state p-5 text-center">
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1), rgba(25, 135, 84, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <i className="bi bi-people" style={{
                                            color: '#28a745',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Students Yet</h5>
                                    <p className="text-muted mb-4">No students are currently enrolled in your courses.</p>
                                </div>
                            ) : (
                                <div className="table-responsive p-4">
                                    <table className="table table-hover" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(40, 167, 69, 0.03)' }}>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>ID</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Name</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Username</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Email</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Enrolled Courses</th>
                                                <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map(student => (
                                                <tr key={student.id} style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '10px' }}>
                                                    <td style={{ padding: '15px', fontWeight: '500', color: '#002254' }}>{student.id}</td>
                                                    <td style={{ padding: '15px', fontWeight: '500', color: '#002254' }}>{student.fullname}</td>
                                                    <td style={{ padding: '15px' }}>{student.username}</td>
                                                    <td style={{ padding: '15px' }}>{student.email}</td>
                                                    <td style={{ padding: '15px' }}>
                                                        <div className="d-flex flex-wrap gap-1">
                                                            {student.courses.map(course => (
                                                                <span key={course.id} className="badge" style={{
                                                                    background: 'rgba(26, 86, 201, 0.1)',
                                                                    color: '#1a56c9',
                                                                    fontWeight: '500',
                                                                    padding: '5px 10px',
                                                                    borderRadius: '30px',
                                                                    marginBottom: '5px'
                                                                }}>
                                                                    {course.title}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px' }}>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => navigate(`/check-assignments/${student.id}`)}
                                                                style={{
                                                                    background: 'rgba(26, 86, 201, 0.1)',
                                                                    color: '#1a56c9',
                                                                    border: 'none',
                                                                    borderRadius: '50px',
                                                                    padding: '0.3rem 0.8rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-file-earmark-check me-1"></i>
                                                                Assignments
                                                            </button>
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => navigate(`/add-assignment/${student.id}`)}
                                                                style={{
                                                                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '50px',
                                                                    padding: '0.3rem 0.8rem',
                                                                    fontWeight: '500',
                                                                    boxShadow: '0 2px 5px rgba(8, 174, 234, 0.2)'
                                                                }}
                                                            >
                                                                <i className="bi bi-plus-circle me-1"></i>
                                                                Add Assignment
                                                            </button>
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => navigate(`/quiz-attempt-detail/${student.id}`)}
                                                                style={{
                                                                    background: 'rgba(255, 193, 7, 0.1)',
                                                                    color: '#ffc107',
                                                                    border: 'none',
                                                                    borderRadius: '50px',
                                                                    padding: '0.3rem 0.8rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-journal-text me-1"></i>
                                                                Quiz Results
                                                            </button>
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => openChatDialog(student)}
                                                                style={{
                                                                    background: 'rgba(25, 135, 84, 0.1)',
                                                                    color: '#198754',
                                                                    border: 'none',
                                                                    borderRadius: '50px',
                                                                    padding: '0.3rem 0.8rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                <i className="bi bi-chat me-1"></i>
                                                                Quick Message
                                                            </button>
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => goToChat(student.id)}
                                                                style={{
                                                                    background: 'rgba(13, 110, 253, 0.1)',
                                                                    color: '#0d6efd',
                                                                    border: 'none',
                                                                    borderRadius: '50px',
                                                                    padding: '0.3rem 0.8rem',
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

export default UserList;