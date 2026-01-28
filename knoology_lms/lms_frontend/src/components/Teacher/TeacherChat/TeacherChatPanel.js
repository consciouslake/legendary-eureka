import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TeacherSidebar from '../TeacherSidebar';
import Swal from 'sweetalert2';
import { apiUrl } from '../../../config';
import axios from 'axios';

// Reusable loader component
const Loader = ({ size = "medium", color = "#8e44ad" }) => {
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
                        color: color,
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
            <p className="mt-3 text-muted">Loading chat data...</p>
        </div>
    );
};

const TeacherChatPanel = () => {
    const navigate = useNavigate();
    const teacherId = localStorage.getItem('teacherId') || (localStorage.getItem('teacherData') ? JSON.parse(localStorage.getItem('teacherData')).teacherId : null);
    const [chatUsers, setChatUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);

    // Check if a specific student ID was passed from another page
    const selectedStudentId = localStorage.getItem('selectedStudentId');

    // Fetch chat users (students) on component mount
    useEffect(() => {
        document.title = "Teacher Chat | Knoology LMS";
        if (teacherId) {
            fetchChatUsers();
        }
    }, [teacherId]);

    // Handle direct navigation to a specific student chat
    useEffect(() => {
        if (selectedStudentId && chatUsers.length > 0) {
            // Find the student in the chat users list
            const student = chatUsers.find(user => user.id === parseInt(selectedStudentId));
            if (student) {
                fetchMessages(student.id);
            }
            // Clear the stored ID after using it
            localStorage.removeItem('selectedStudentId');
        }
    }, [chatUsers, selectedStudentId]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Fetch students who have chatted with this teacher
    const fetchChatUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/chat-users/teacher/${teacherId}/`);
            if (response.data.status === 'success') {
                setChatUsers(response.data.data);

                // If we have a selected student ID but no chat history yet,
                // we may need to fetch student details separately
                if (selectedStudentId && response.data.data.length === 0) {
                    fetchStudentDetails(selectedStudentId);
                }
            } else {
                console.error('Failed to fetch chat users');
            }
        } catch (error) {
            console.error('Error fetching chat users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch details for a specific student when there's no chat history
    const fetchStudentDetails = async (studentId) => {
        try {
            const response = await axios.get(`${apiUrl}/student/${studentId}/`);
            if (response.data.status === 'success') {
                const studentData = response.data.data;
                fetchMessages(studentId);
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
        }
    };

    // Fetch messages for selected student
    const fetchMessages = async (studentId) => {
        setLoadingMessages(true);
        try {
            const response = await axios.get(`${apiUrl}/chat-messages/teacher/${teacherId}/${studentId}/`);
            if (response.data.status === 'success') {
                setMessages(response.data.data.messages);
                const student = response.data.data.other_user;
                setSelectedStudent(student);
            } else {
                console.error('Failed to fetch messages');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    // Send a new message
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedStudent) return;

        try {
            const messageData = {
                teacher_id: teacherId,
                student_id: selectedStudent.id,
                message: newMessage,
                message_from: 'teacher'
            };

            const response = await axios.post(`${apiUrl}/send-message/`, messageData);

            if (response.data.status === 'success') {
                // Add new message to the conversation
                setMessages([...messages, response.data.data]);
                setNewMessage(''); // Clear the input

                // Update chat users list to reflect the latest message
                fetchChatUsers();
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to send message',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Swal.fire({
                title: 'Error',
                text: 'An error occurred while sending your message',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };

    // Delete conversation with a student
    const deleteConversation = async () => {
        if (!selectedStudent) return;

        Swal.fire({
            title: 'Delete Conversation',
            text: `Are you sure you want to delete all messages with ${selectedStudent.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`${apiUrl}/delete-conversation/${teacherId}/${selectedStudent.id}/`);

                    if (response.data.status === 'success') {
                        // Clear messages
                        setMessages([]);

                        // Update chat users list
                        fetchChatUsers();

                        // Reset selected student
                        setSelectedStudent(null);

                        Swal.fire({
                            title: 'Success',
                            text: 'Conversation deleted successfully',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                    } else {
                        Swal.fire({
                            title: 'Error',
                            text: 'Failed to delete conversation',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                } catch (error) {
                    console.error('Error deleting conversation:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'An error occurred while deleting the conversation',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            }
        });
    };

    // Start a new conversation with a student
    const startNewConversation = () => {
        Swal.fire({
            title: 'Start New Conversation',
            html:
                '<div class="form-group mb-3">' +
                '<label for="student-select">Select Student</label>' +
                '<select id="student-select" class="form-control">' +
                '<option value="">Select a student</option>' +
                '</select>' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="message-text">Message</label>' +
                '<textarea id="message-text" class="form-control" placeholder="Type your message..."></textarea>' +
                '</div>',
            showCancelButton: true,
            confirmButtonText: 'Send',
            confirmButtonColor: '#8e44ad',
            cancelButtonText: 'Cancel',
            didOpen: async () => {
                try {
                    // Fetch all enrolled students
                    const response = await axios.get(`${apiUrl}/teacher-enrolled-students/${teacherId}/`);

                    if (response.data.status === 'success') {
                        const students = response.data.data;
                        const select = Swal.getPopup().querySelector('#student-select');

                        // Add students to dropdown
                        students.forEach(student => {
                            const option = document.createElement('option');
                            option.value = student.id;
                            option.textContent = student.fullname;
                            select.appendChild(option);
                        });
                    }
                } catch (error) {
                    console.error('Error fetching students:', error);
                }
            },
            preConfirm: () => {
                const studentId = Swal.getPopup().querySelector('#student-select').value;
                const message = Swal.getPopup().querySelector('#message-text').value;

                if (!studentId) {
                    Swal.showValidationMessage('Please select a student');
                    return false;
                }

                if (!message.trim()) {
                    Swal.showValidationMessage('Please enter a message');
                    return false;
                }

                return { studentId, message };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { studentId, message } = result.value;

                // Send the message
                axios.post(`${apiUrl}/send-message/`, {
                    teacher_id: teacherId,
                    student_id: studentId,
                    message: message,
                    message_from: 'teacher'
                })
                    .then(response => {
                        if (response.data.status === 'success') {
                            Swal.fire({
                                title: 'Message Sent',
                                text: 'Your message has been sent successfully',
                                icon: 'success',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#8e44ad'
                            });

                            // Refresh the chat users list and fetch messages for this student
                            fetchChatUsers();
                            fetchMessages(studentId);
                        }
                    })
                    .catch(error => {
                        console.error('Error sending message:', error);
                        Swal.fire({
                            title: 'Error',
                            text: 'Failed to send message',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    });
            }
        });
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    // Function to go back to dashboard
    const goToDashboard = () => {
        navigate('/teacher-dashboard');
    };

    return (
        <div className="container-fluid pb-4 px-4" style={{ paddingTop: '100px' }}>
            <div className="row g-4">
                <div className="col-md-3">
                    <TeacherSidebar />
                </div>
                <div className="col-md-9">
                    <div className="chat-container" style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        height: 'calc(100vh - 150px)'
                    }}>
                        {/* Chat Header */}
                        <div className="chat-header" style={{
                            background: 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)',
                            padding: '15px 25px',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div className="d-flex align-items-center">
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-chat-dots" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600' }}>Teacher Chat</h5>
                            </div>

                            <div>
                                <button
                                    onClick={startNewConversation}
                                    className="btn btn-sm me-2"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '0.5rem 1rem',
                                        backdropFilter: 'blur(5px)',
                                        fontWeight: '500'
                                    }}
                                >
                                    <i className="bi bi-plus me-1"></i> New Message
                                </button>
                                <button
                                    onClick={goToDashboard}
                                    className="btn btn-sm me-2"
                                    title="Go to Dashboard"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '0.5rem 1rem',
                                        backdropFilter: 'blur(5px)',
                                        fontWeight: '500'
                                    }}
                                >
                                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="btn btn-sm"
                                    title="Close Chat"
                                    style={{
                                        background: 'rgba(220, 53, 69, 0.8)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '0.5rem 1rem',
                                        fontWeight: '500'
                                    }}
                                >
                                    <i className="bi bi-x me-1"></i> Close
                                </button>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div className="chat-body" style={{
                            height: 'calc(100% - 70px)',
                            display: 'flex'
                        }}>
                            {/* Left sidebar - Chat Users */}
                            <div className="chat-sidebar" style={{
                                width: '320px',
                                borderRight: '1px solid #f0f0f0',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div className="sidebar-header p-3 border-bottom">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search conversations..."
                                            style={{
                                                border: '1px solid #e9ecef',
                                                borderRadius: '50px',
                                                padding: '0.5rem 1rem'
                                            }}
                                        />
                                        <button
                                            className="btn"
                                            style={{
                                                background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                marginLeft: '10px'
                                            }}
                                        >
                                            <i className="bi bi-search"></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="sidebar-body" style={{
                                    flex: '1',
                                    overflowY: 'auto',
                                    padding: '10px'
                                }}>
                                    {loading ? (
                                        <Loader size="small" />
                                    ) : chatUsers.length === 0 ? (
                                        <div className="text-center py-4">
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                margin: '0 auto',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.1), rgba(91, 44, 111, 0.1))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '15px'
                                            }}>
                                                <i className="bi bi-chat" style={{
                                                    color: '#8e44ad',
                                                    fontSize: '1.5rem'
                                                }}></i>
                                            </div>
                                            <h6 style={{ fontWeight: '600', color: '#495057' }}>No Messages</h6>
                                            <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                                                Start a new conversation with your students
                                            </p>
                                            <button
                                                onClick={startNewConversation}
                                                className="btn btn-sm"
                                                style={{
                                                    background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50px',
                                                    padding: '0.5rem 1.5rem',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                <i className="bi bi-plus me-2"></i>
                                                Start Conversation
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            {chatUsers.map((user, index) => (
                                                <div
                                                    key={index}
                                                    className={`chat-user ${selectedStudent && selectedStudent.id === user.id ? 'selected' : ''}`}
                                                    style={{
                                                        padding: '12px 15px',
                                                        borderRadius: '12px',
                                                        marginBottom: '8px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        background: selectedStudent && selectedStudent.id === user.id
                                                            ? 'linear-gradient(135deg, rgba(142, 68, 173, 0.1), rgba(91, 44, 111, 0.1))'
                                                            : 'transparent',
                                                        borderLeft: selectedStudent && selectedStudent.id === user.id
                                                            ? '4px solid #8e44ad'
                                                            : '4px solid transparent'
                                                    }}
                                                    onClick={() => fetchMessages(user.id)}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <div style={{
                                                            width: '45px',
                                                            height: '45px',
                                                            borderRadius: '12px',
                                                            background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                                            color: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1.2rem',
                                                            marginRight: '15px',
                                                            fontWeight: '500'
                                                        }}>
                                                            {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                                                        </div>
                                                        <div>
                                                            <h6 style={{
                                                                marginBottom: '5px',
                                                                fontWeight: '600',
                                                                color: '#495057'
                                                            }}>
                                                                {user.name || `Student ${user.id}`}
                                                            </h6>
                                                            <div style={{
                                                                fontSize: '0.8rem',
                                                                color: '#6c757d',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}>
                                                                <span
                                                                    className="text-truncate d-inline-block"
                                                                    style={{ maxWidth: '180px' }}
                                                                >
                                                                    {user.last_message || 'Start a conversation'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {user.unread_count > 0 && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '15px',
                                                            right: '15px',
                                                            background: '#8e44ad',
                                                            color: 'white',
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            {user.unread_count}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main chat area */}
                            <div className="chat-main" style={{
                                flex: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }}>
                                {selectedStudent ? (
                                    <>
                                        {/* Selected student info */}
                                        <div className="selected-user-header" style={{
                                            padding: '15px 20px',
                                            borderBottom: '1px solid #f0f0f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div className="d-flex align-items-center">
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '12px',
                                                    background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.1rem',
                                                    marginRight: '15px',
                                                    fontWeight: '500'
                                                }}>
                                                    {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : 'S'}
                                                </div>
                                                <div>
                                                    <h6 style={{
                                                        marginBottom: '3px',
                                                        fontWeight: '600',
                                                        color: '#495057'
                                                    }}>
                                                        {selectedStudent.name || `Student ${selectedStudent.id}`}
                                                    </h6>
                                                    <div style={{
                                                        fontSize: '0.8rem',
                                                        color: '#6c757d'
                                                    }}>
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2">
                                                                <i className="bi bi-envelope"></i>
                                                            </span>
                                                            {selectedStudent.email || 'No email available'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <button
                                                    onClick={deleteConversation}
                                                    className="btn btn-sm"
                                                    title="Delete Conversation"
                                                    style={{
                                                        background: 'rgba(220, 53, 69, 0.1)',
                                                        color: '#dc3545',
                                                        border: 'none',
                                                        borderRadius: '50px',
                                                        padding: '0.5rem 1rem',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    <i className="bi bi-trash me-1"></i>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Messages container */}
                                        <div className="messages-container" style={{
                                            flex: '1',
                                            overflowY: 'auto',
                                            padding: '20px',
                                            background: '#f8f9fa'
                                        }}>
                                            {loadingMessages ? (
                                                <Loader />
                                            ) : messages.length === 0 ? (
                                                <div className="text-center py-5">
                                                    <div style={{
                                                        width: '70px',
                                                        height: '70px',
                                                        margin: '0 auto',
                                                        borderRadius: '50%',
                                                        background: 'rgba(142, 68, 173, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginBottom: '15px'
                                                    }}>
                                                        <i className="bi bi-chat-text" style={{
                                                            color: '#8e44ad',
                                                            fontSize: '2rem'
                                                        }}></i>
                                                    </div>
                                                    <h5 style={{ fontWeight: '600', color: '#495057' }}>No Messages Yet</h5>
                                                    <p className="text-muted">Start the conversation by sending a message</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    {messages.map((msg, index) => (
                                                        <div
                                                            key={index}
                                                            className={`message ${msg.message_from === 'teacher' ? 'sent' : 'received'}`}
                                                            style={{
                                                                marginBottom: '15px',
                                                                display: 'flex',
                                                                flexDirection: msg.message_from === 'teacher' ? 'row-reverse' : 'row'
                                                            }}
                                                        >
                                                            <div style={{
                                                                maxWidth: '70%',
                                                                padding: '12px 16px',
                                                                borderRadius: msg.message_from === 'teacher'
                                                                    ? '15px 15px 0 15px'
                                                                    : '15px 15px 15px 0',
                                                                background: msg.message_from === 'teacher'
                                                                    ? 'linear-gradient(135deg, #8e44ad, #5b2c6f)'
                                                                    : 'white',
                                                                color: msg.message_from === 'teacher' ? 'white' : '#212529',
                                                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                                                            }}>
                                                                <div style={{
                                                                    marginBottom: '5px',
                                                                    wordBreak: 'break-word'
                                                                }}>
                                                                    {msg.message}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '0.7rem',
                                                                    textAlign: 'right',
                                                                    color: msg.message_from === 'teacher' ? 'rgba(255, 255, 255, 0.7)' : '#6c757d'
                                                                }}>
                                                                    {formatTimestamp(msg.created_at)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div ref={messagesEndRef} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Message input */}
                                        <form
                                            onSubmit={sendMessage}
                                            className="message-input"
                                            style={{
                                                padding: '15px 20px',
                                                borderTop: '1px solid #f0f0f0',
                                                background: 'white'
                                            }}
                                        >
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Type your message here..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    style={{
                                                        borderRadius: '50px',
                                                        padding: '0.75rem 1.25rem',
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: 'none'
                                                    }}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newMessage.trim()}
                                                    className="btn"
                                                    style={{
                                                        background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50px',
                                                        padding: '0.5rem 1.5rem',
                                                        marginLeft: '10px',
                                                        fontWeight: '500',
                                                        opacity: !newMessage.trim() ? '0.6' : '1'
                                                    }}
                                                >
                                                    <i className="bi bi-send me-1"></i>
                                                    Send
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    <div className="no-chat-selected" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        background: '#f8f9fa'
                                    }}>
                                        <div style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            background: 'rgba(142, 68, 173, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '20px'
                                        }}>
                                            <i className="bi bi-chat-square-text" style={{
                                                color: '#8e44ad',
                                                fontSize: '3rem'
                                            }}></i>
                                        </div>
                                        <h3 style={{ fontWeight: '600', color: '#495057', marginBottom: '10px' }}>
                                            Welcome to Teacher Chat
                                        </h3>
                                        <p className="text-muted text-center" style={{ maxWidth: '500px', marginBottom: '25px' }}>
                                            Select a conversation from the sidebar or start a new conversation with your students
                                        </p>
                                        <button
                                            onClick={startNewConversation}
                                            className="btn"
                                            style={{
                                                background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.75rem 1.5rem',
                                                fontWeight: '500',
                                                boxShadow: '0 5px 15px rgba(142, 68, 173, 0.2)'
                                            }}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Start New Conversation
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherChatPanel;