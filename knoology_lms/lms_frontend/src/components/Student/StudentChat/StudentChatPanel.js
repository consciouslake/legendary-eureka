import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { apiUrl } from '../../../config';
import axios from 'axios';
import Sidebar from '../../User/Sidebar';

// Reusable loader component
const Loader = ({ size = "medium", color = "#08AEEA" }) => {
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
                        background: color === "#08AEEA"
                            ? "linear-gradient(45deg, rgba(42, 245, 152, 0.3), rgba(8, 174, 234, 0.3))"
                            : "linear-gradient(45deg, rgba(255, 193, 7, 0.3), rgba(255, 152, 0, 0.3))"
                    }}></div>
                </div>
            </div>
            <p className="mt-3 text-muted">Loading chat data...</p>
        </div>
    );
};

const StudentChatPanel = () => {
    const navigate = useNavigate();
    const studentId = localStorage.getItem('studentId') || (localStorage.getItem('studentInfo') ? JSON.parse(localStorage.getItem('studentInfo')).studentId : null);
    const [chatUsers, setChatUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);

    // Check if a specific teacher ID was passed from another page
    const selectedTeacherId = localStorage.getItem('selectedTeacherId');

    // Fetch chat users (teachers) on component mount
    useEffect(() => {
        if (studentId) {
            fetchChatUsers();
        }
    }, [studentId]);

    // Handle direct navigation to a specific teacher chat
    useEffect(() => {
        if (selectedTeacherId && chatUsers.length > 0) {
            // Find the teacher in the chat users list
            const teacher = chatUsers.find(user => user.id === parseInt(selectedTeacherId));
            if (teacher) {
                fetchMessages(teacher.id);
            }
            // Clear the stored ID after using it
            localStorage.removeItem('selectedTeacherId');
        }
    }, [chatUsers, selectedTeacherId]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Fetch teachers who have chatted with this student
    const fetchChatUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/chat-users/student/${studentId}/`);
            if (response.data.status === 'success') {
                setChatUsers(response.data.data);

                // If we have a selected teacher ID but no chat history yet,
                // we may need to fetch teacher details separately
                if (selectedTeacherId && response.data.data.length === 0) {
                    fetchTeacherDetails(selectedTeacherId);
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

    // Fetch details for a specific teacher when there's no chat history
    const fetchTeacherDetails = async (teacherId) => {
        try {
            const response = await axios.get(`${apiUrl}/teacher/${teacherId}/`);
            if (response.data.status === 'success') {
                const teacherData = response.data.data;
                fetchMessages(teacherId);
            }
        } catch (error) {
            console.error('Error fetching teacher details:', error);
        }
    };

    // Fetch messages for selected teacher
    const fetchMessages = async (teacherId) => {
        setLoadingMessages(true);
        try {
            const response = await axios.get(`${apiUrl}/chat-messages/student/${studentId}/${teacherId}/`);
            if (response.data.status === 'success') {
                setMessages(response.data.data.messages);
                const teacher = response.data.data.other_user;
                setSelectedTeacher(teacher);
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
        if (!newMessage.trim() || !selectedTeacher) return;

        try {
            const messageData = {
                teacher_id: selectedTeacher.id,
                student_id: studentId,
                message: newMessage,
                message_from: 'student'
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

    // Delete conversation with a teacher
    const deleteConversation = async () => {
        if (!selectedTeacher) return;

        Swal.fire({
            title: 'Delete Conversation',
            text: `Are you sure you want to delete all messages with ${selectedTeacher.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(`${apiUrl}/delete-conversation/${selectedTeacher.id}/${studentId}/`);

                    if (response.data.status === 'success') {
                        // Clear messages
                        setMessages([]);

                        // Update chat users list
                        fetchChatUsers();

                        // Reset selected teacher
                        setSelectedTeacher(null);

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

    // Start a new conversation with a teacher
    const startNewConversation = () => {
        Swal.fire({
            title: 'Start New Conversation',
            html:
                '<div class="form-group mb-3">' +
                '<label for="teacher-select">Select Teacher</label>' +
                '<select id="teacher-select" class="form-control">' +
                '<option value="">Select a teacher</option>' +
                '</select>' +
                '</div>' +
                '<div class="form-group">' +
                '<label for="message-text">Message</label>' +
                '<textarea id="message-text" class="form-control" placeholder="Type your message..."></textarea>' +
                '</div>',
            showCancelButton: true,
            confirmButtonText: 'Send',
            cancelButtonText: 'Cancel',
            didOpen: async () => {
                try {
                    // Fetch teachers of courses the student is enrolled in
                    const response = await axios.get(`${apiUrl}/enrolled-courses/${studentId}/`);

                    if (response.data.status === 'success') {
                        const courses = response.data.data;
                        const teachers = {};

                        // Collect unique teachers
                        courses.forEach(course => {
                            if (course.teacher && course.teacher.id) {
                                teachers[course.teacher.id] = {
                                    id: course.teacher.id,
                                    name: course.teacher.full_name,
                                    email: course.teacher.email
                                };
                            }
                        });

                        const select = Swal.getPopup().querySelector('#teacher-select');

                        // Add teachers to dropdown
                        Object.values(teachers).forEach(teacher => {
                            const option = document.createElement('option');
                            option.value = teacher.id;
                            option.textContent = teacher.name;
                            select.appendChild(option);
                        });
                    }
                } catch (error) {
                    console.error('Error fetching teachers:', error);
                }
            },
            preConfirm: () => {
                const teacherId = Swal.getPopup().querySelector('#teacher-select').value;
                const message = Swal.getPopup().querySelector('#message-text').value;

                if (!teacherId) {
                    Swal.showValidationMessage('Please select a teacher');
                    return false;
                }

                if (!message.trim()) {
                    Swal.showValidationMessage('Please enter a message');
                    return false;
                }

                return { teacherId, message };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { teacherId, message } = result.value;

                // Send the message
                axios.post(`${apiUrl}/send-message/`, {
                    teacher_id: teacherId,
                    student_id: studentId,
                    message: message,
                    message_from: 'student'
                })
                    .then(response => {
                        if (response.data.status === 'success') {
                            Swal.fire({
                                title: 'Message Sent',
                                text: 'Your message has been sent successfully',
                                icon: 'success',
                                confirmButtonText: 'OK'
                            });

                            // Refresh the chat users list and fetch messages for this teacher
                            fetchChatUsers();
                            fetchMessages(teacherId);
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
        navigate('/user-dashboard');
    };

    return (
        <div className='container-fluid px-4' style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <Sidebar />
                </div>
                <div className='col-md-9'>
                    <div className="chat-container" style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        height: 'calc(100vh - 120px)'
                    }}>
                        {/* Chat Header */}
                        <div className="chat-header" style={{
                            background: 'linear-gradient(135deg, #08AEEA 0%, #2AF598 100%)',
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
                                <h5 className="mb-0" style={{ fontWeight: '600' }}>Student Chat</h5>
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
                                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
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
                                                background: 'linear-gradient(135deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '15px'
                                            }}>
                                                <i className="bi bi-chat" style={{
                                                    color: '#08AEEA',
                                                    fontSize: '1.5rem'
                                                }}></i>
                                            </div>
                                            <p className="text-muted mb-3">No conversations found</p>
                                            <button
                                                onClick={startNewConversation}
                                                className="btn btn-sm"
                                                style={{
                                                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50px',
                                                    padding: '0.5rem 1rem',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                <i className="bi bi-plus me-1"></i> Start a conversation
                                            </button>
                                        </div>
                                    ) : (
                                        chatUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className={`chat-user-item mb-2 ${selectedTeacher && selectedTeacher.id === user.id ? 'active' : ''}`}
                                                onClick={() => fetchMessages(user.id)}
                                                style={{
                                                    background: selectedTeacher && selectedTeacher.id === user.id ? 'linear-gradient(135deg, rgba(8, 174, 234, 0.1), rgba(42, 245, 152, 0.1))' : 'white',
                                                    borderRadius: '15px',
                                                    padding: '15px',
                                                    cursor: 'pointer',
                                                    border: selectedTeacher && selectedTeacher.id === user.id ? '1px solid rgba(8, 174, 234, 0.3)' : '1px solid #f0f0f0',
                                                    boxShadow: selectedTeacher && selectedTeacher.id === user.id ? '0 5px 15px rgba(8, 174, 234, 0.1)' : 'none',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!(selectedTeacher && selectedTeacher.id === user.id)) {
                                                        e.currentTarget.style.background = '#f8f9fa';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!(selectedTeacher && selectedTeacher.id === user.id)) {
                                                        e.currentTarget.style.background = 'white';
                                                    }
                                                }}
                                            >
                                                <div className="d-flex">
                                                    <div style={{
                                                        width: '45px',
                                                        height: '45px',
                                                        borderRadius: '50%',
                                                        background: '#f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: '10px',
                                                        overflow: 'hidden',
                                                        position: 'relative'
                                                    }}>
                                                        <img
                                                            src={user.profile_img || '/teacher-default.png'}
                                                            alt={user.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/45?text=T';
                                                            }}
                                                        />
                                                        {user.unread_count > 0 && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '-5px',
                                                                right: '-5px',
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '50%',
                                                                background: '#dc3545',
                                                                color: 'white',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.7rem',
                                                                fontWeight: '600',
                                                                border: '2px solid white'
                                                            }}>
                                                                {user.unread_count}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <h6 style={{
                                                                margin: '0',
                                                                fontWeight: '600',
                                                                color: '#002254',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                maxWidth: '150px'
                                                            }}>
                                                                {user.name}
                                                            </h6>
                                                            <small style={{
                                                                color: '#6c757d',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                {new Date(user.last_message_time).toLocaleDateString()}
                                                            </small>
                                                        </div>

                                                        <p style={{
                                                            margin: '5px 0 0',
                                                            fontSize: '0.85rem',
                                                            color: '#506690',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {user.last_message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="sidebar-footer p-3 border-top" style={{
                                    background: 'rgba(248, 249, 250, 0.5)'
                                }}>
                                    <button
                                        onClick={startNewConversation}
                                        className="btn w-100"
                                        style={{
                                            background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '0.6rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i> New Conversation
                                    </button>
                                </div>
                            </div>

                            {/* Right side - Chat Messages */}
                            <div className="chat-content" style={{
                                flex: 1,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                background: '#f9f9f9'
                            }}>
                                {selectedTeacher ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="chat-content-header" style={{
                                            padding: '15px 25px',
                                            borderBottom: '1px solid #f0f0f0',
                                            background: 'white',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div className="d-flex align-items-center">
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '50%',
                                                    background: '#f0f0f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: '10px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <img
                                                        src={selectedTeacher.profile_img || '/teacher-default.png'}
                                                        alt={selectedTeacher.name}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/40?text=T';
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <h6 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                                        {selectedTeacher.name}
                                                    </h6>
                                                    <small className="text-muted">
                                                        {selectedTeacher.email}
                                                    </small>
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
                                                    <i className="bi bi-trash me-1"></i> Delete Conversation
                                                </button>
                                            </div>
                                        </div>

                                        {/* Messages area */}
                                        <div className="chat-messages" style={{
                                            flex: 1,
                                            overflowY: 'auto',
                                            padding: '20px',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            {loadingMessages ? (
                                                <div className="align-self-center my-auto">
                                                    <Loader size="medium" />
                                                </div>
                                            ) : messages.length === 0 ? (
                                                <div className="text-center my-auto">
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
                                                        <i className="bi bi-chat-text" style={{
                                                            color: '#08AEEA',
                                                            fontSize: '2rem'
                                                        }}></i>
                                                    </div>
                                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No messages yet</h5>
                                                    <p className="text-muted mb-0">Send a message to start the conversation.</p>
                                                </div>
                                            ) : (
                                                messages.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        className={`message mb-3 ${msg.message_from === 'student' ? 'sent' : 'received'}`}
                                                        style={{
                                                            alignSelf: msg.message_from === 'student' ? 'flex-end' : 'flex-start',
                                                            maxWidth: '75%'
                                                        }}
                                                    >
                                                        <div style={{
                                                            background: msg.message_from === 'student' ?
                                                                'linear-gradient(135deg, #08AEEA, #2AF598)' : 'white',
                                                            color: msg.message_from === 'student' ? 'white' : '#002254',
                                                            padding: '12px 18px',
                                                            borderRadius: msg.message_from === 'student' ?
                                                                '20px 20px 0 20px' : '20px 20px 20px 0',
                                                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                                                            position: 'relative'
                                                        }}>
                                                            <p className="mb-1" style={{
                                                                wordBreak: 'break-word',
                                                                whiteSpace: 'pre-wrap'
                                                            }}>
                                                                {msg.message}
                                                            </p>
                                                            <div style={{
                                                                fontSize: '0.75rem',
                                                                opacity: 0.8,
                                                                textAlign: 'right'
                                                            }}>
                                                                {formatTimestamp(msg.timestamp)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Message input */}
                                        <div className="chat-input p-3 border-top" style={{
                                            background: 'white'
                                        }}>
                                            <form onSubmit={sendMessage} className="d-flex">
                                                <input
                                                    type="text"
                                                    className="form-control me-2"
                                                    placeholder="Type a message..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    required
                                                    style={{
                                                        border: '1px solid #e9ecef',
                                                        borderRadius: '50px',
                                                        padding: '0.6rem 1.2rem'
                                                    }}
                                                />
                                                <button type="submit" className="btn" style={{
                                                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50px',
                                                    width: '50px',
                                                    height: '50px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '0'
                                                }}>
                                                    <i className="bi bi-send" style={{ fontSize: '1.2rem' }}></i>
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <div className="d-flex flex-column justify-content-center align-items-center h-100 p-4">
                                        <div style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '25px'
                                        }}>
                                            <i className="bi bi-chat-square-text" style={{
                                                color: '#08AEEA',
                                                fontSize: '3rem'
                                            }}></i>
                                        </div>
                                        <h4 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>
                                            Welcome to Student Chat
                                        </h4>
                                        <p className="text-muted text-center mb-4" style={{ maxWidth: '500px' }}>
                                            Select a conversation from the left panel or start a new conversation with your teachers.
                                        </p>
                                        <button
                                            onClick={startNewConversation}
                                            className="btn"
                                            style={{
                                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.8rem 2rem',
                                                fontWeight: '500',
                                                boxShadow: '0 5px 15px rgba(8, 174, 234, 0.2)'
                                            }}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i> Start a new conversation
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

export default StudentChatPanel;