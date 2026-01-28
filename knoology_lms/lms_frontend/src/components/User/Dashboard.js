import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

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
            <p className="mt-3 text-muted">Loading data...</p>
        </div>
    );
};

function Dashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState({
        totalEnrolledCourses: 0,
        recentCourses: [],
        favoriteCourses: [],
        pendingAssignments: [],
        completedAssignments: 0,
        averageGrade: 'N/A',
        profileData: null,
        notifications: [],
        availableQuizzes: [],
        availableQuizzes: [],
        studyMaterials: [], // Added study materials array
        quizData: [], // For quiz performance chart
        assignmentData: null // For assignment status chart
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Student Dashboard | Knoology LMS";
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) {
            navigate('/user-login');
            return;
        }

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const { studentId } = JSON.parse(studentInfo);

                // Fetch student profile data
                const profileResponse = await axios.get(`${BASE_API_URL}/student/${studentId}/`);

                // Fetch enrolled courses
                const enrolledCoursesResponse = await axios.get(`${BASE_API_URL}/enrolled-courses/${studentId}/`);

                // Fetch favorite courses
                const favoritesResponse = await axios.get(`${BASE_API_URL}/favorite-courses/${studentId}/`);

                // Fetch assignments
                const assignmentsResponse = await axios.get(`${BASE_API_URL}/student-assignments/${studentId}/`);

                // Fetch notifications
                const notificationsResponse = await axios.get(`${BASE_API_URL}/notifications/student/${studentId}/`);

                // Fetch available quizzes
                const availableQuizzesResponse = await axios.get(`${BASE_API_URL}/student-available-quizzes/${studentId}/`);

                // Fetch dashboard charts stats
                const statsResponse = await axios.get(`${BASE_API_URL}/student-dashboard-stats/${studentId}/`);

                if (enrolledCoursesResponse.data.status === 'success') {
                    const courses = enrolledCoursesResponse.data.data;
                    const favorites = favoritesResponse.data.data || [];
                    const assignments = assignmentsResponse.data.assignments || [];
                    const notifications = notificationsResponse.data.data || [];
                    const availableQuizzes = availableQuizzesResponse.data.data || [];

                    // Fetch study materials for all enrolled courses
                    let allStudyMaterials = [];
                    for (const course of courses) {
                        try {
                            const materialsResponse = await axios.get(`${BASE_API_URL}/study-materials/${course.id}/`);
                            if (materialsResponse.data && materialsResponse.data.length > 0) {
                                // Add course info to each material
                                const materialsWithCourseInfo = materialsResponse.data.map(material => ({
                                    ...material,
                                    course_title: course.title
                                }));
                                allStudyMaterials = [...allStudyMaterials, ...materialsWithCourseInfo];
                            }
                        } catch (error) {
                            console.error(`Error fetching study materials for course ${course.id}:`, error);
                        }
                    }

                    // Sort study materials by creation date (newest first)
                    allStudyMaterials.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                    // Calculate statistics
                    const completedAssignments = assignments.filter(a => a.submission_date).length;
                    const gradedAssignments = assignments.filter(a => a.grade);
                    const averageGrade = gradedAssignments.length > 0
                        ? calculateAverageGrade(gradedAssignments)
                        : 'N/A';

                    setDashboardData({
                        totalEnrolledCourses: courses.length,
                        recentCourses: courses.slice(0, 3),
                        favoriteCourses: favorites.slice(0, 3),
                        pendingAssignments: assignments.filter(a => !a.submission_date).slice(0, 5),
                        completedAssignments,
                        averageGrade,
                        profileData: profileResponse.data.data,
                        notifications: notifications.filter(n => n.notification_type === 'quiz_assigned' && !n.is_read).slice(0, 5),
                        availableQuizzes: availableQuizzes.filter(q => !q.already_attempted).slice(0, 5),
                        studyMaterials: allStudyMaterials.slice(0, 5), // Display only the 5 most recent materials
                        quizData: statsResponse.data.status === 'success' ? statsResponse.data.quiz_data : [],
                        assignmentData: statsResponse.data.status === 'success' ? statsResponse.data.assignment_data : null
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const calculateAverageGrade = (assignments) => {
        const gradePoints = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
        const total = assignments.reduce((sum, assignment) => sum + (gradePoints[assignment.grade] || 0), 0);
        const average = total / assignments.length;
        if (average >= 3.5) return 'A';
        if (average >= 2.5) return 'B';
        if (average >= 1.5) return 'C';
        if (average >= 0.5) return 'D';
        return 'F';
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await axios.post(`${BASE_API_URL}/mark-notification-read/${notificationId}/`);
            setDashboardData(prev => ({
                ...prev,
                notifications: prev.notifications.filter(n => n.id !== notificationId)
            }));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // Get current date in nice format
    const getCurrentDate = () => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    return (
        <div className='container-fluid px-4' style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <Sidebar />
                </div>

                <div className='col-md-9'>
                    {/* Welcome Section */}
                    <div className="welcome-section shadow-sm mb-4 animate-fade-in" style={{
                        background: 'var(--hero-bg)',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '25px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative elements */}
                        <div style={{
                            position: 'absolute',
                            top: '-30px',
                            right: '-30px',
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                            zIndex: '0'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-20px',
                            left: '20%',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                            zIndex: '0'
                        }}></div>

                        <div className="position-relative" style={{ zIndex: '1' }}>
                            <div className="d-md-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    {!loading && dashboardData.profileData?.profile_img_url && (
                                        <div className="me-3">
                                            <img
                                                src={dashboardData.profileData.profile_img_url || '/user-default.png'}
                                                alt="Profile"
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '3px solid white',
                                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/60?text=Student';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <h3 style={{ color: 'white', fontWeight: '600' }}>
                                            {getGreeting()}, {dashboardData.profileData?.fullname?.split(' ')[0] || 'Student'}!
                                        </h3>
                                        <p className="mb-md-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{getCurrentDate()}</p>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-3 mt-md-0">
                                    <Link to="/my-courses" className="btn" style={{
                                        background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                        color: 'white',
                                        fontWeight: '500',
                                        borderRadius: '50px',
                                        padding: '0.6rem 1.2rem',
                                        border: 'none',
                                        boxShadow: '0 4px 10px rgba(42, 245, 152, 0.2)'
                                    }}>
                                        <i className="bi bi-play-circle me-2"></i>
                                        Continue Learning
                                    </Link>
                                    <Link to="/profile-setting" className="btn btn-light" style={{
                                        fontWeight: '500',
                                        borderRadius: '50px',
                                        padding: '0.6rem 1.2rem'
                                    }}>
                                        <i className="bi bi-person-gear me-2"></i>
                                        Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Notifications */}
                    {!loading && dashboardData.notifications.length > 0 && (
                        <div className="notification-section" style={{
                            background: 'rgba(8, 174, 234, 0.1)',
                            borderRadius: '20px',
                            padding: '20px',
                            marginBottom: '24px',
                            position: 'relative',
                            overflow: 'hidden',
                            borderLeft: '4px solid #08AEEA'
                        }}>
                            <div className="d-flex align-items-center mb-3">
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'rgba(8, 174, 234, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '12px'
                                }}>
                                    <i className="bi bi-bell" style={{ color: '#08AEEA', fontSize: '1.2rem' }}></i>
                                </div>
                                <h5 className="mb-0" style={{ color: '#002254', fontWeight: '600' }}>New Quiz Notifications</h5>
                            </div>

                            <div className="notifications-list">
                                {dashboardData.notifications.map((notification) => (
                                    <div key={notification.id} className="notification-item d-flex align-items-center justify-content-between p-3 mb-2" style={{
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        borderRadius: '10px'
                                    }}>
                                        <div>
                                            <h6 className="mb-1" style={{ fontWeight: '600', color: '#002254' }}>{notification.title}</h6>
                                            <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>{notification.message}</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm"
                                            onClick={() => markNotificationAsRead(notification.id)}
                                            style={{
                                                background: 'white',
                                                color: '#08AEEA',
                                                border: '1px solid #08AEEA',
                                                borderRadius: '50px',
                                                padding: '0.3rem 1rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <i className="bi bi-check2 me-1"></i>
                                            Mark as Read
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3">
                                <Link to="/student-available-quizzes" className="btn" style={{
                                    background: '#08AEEA',
                                    color: 'white',
                                    fontWeight: '500',
                                    borderRadius: '50px',
                                    padding: '0.6rem 1.5rem',
                                    border: 'none'
                                }}>
                                    <i className="bi bi-list-check me-2"></i>
                                    View All Quizzes
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-4">
                            <div className="stat-card" style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '25px',
                                height: '100%',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    width: '90px',
                                    height: '90px',
                                    borderRadius: '0 0 0 90px',
                                    background: 'linear-gradient(135deg, rgba(26, 86, 201, 0.1) 0%, rgba(26, 86, 201, 0.05) 100%)',
                                }}></div>

                                <div className="stat-icon" style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(45deg, #002254, #1a56c9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '20px',
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    boxShadow: '0 10px 20px rgba(26, 86, 201, 0.3)'
                                }}>
                                    <i className="bi bi-journal-bookmark"></i>
                                </div>

                                <div className="stat-info">
                                    <p className="text-muted mb-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Enrolled Courses</p>
                                    <h2 style={{ color: '#002254', fontWeight: '700', marginBottom: '15px' }}>
                                        {loading ? <div className="placeholder col-6"></div> : dashboardData.totalEnrolledCourses}
                                    </h2>
                                    <Link to="/my-courses" style={{
                                        color: '#1a56c9',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem'
                                    }}>
                                        View All Courses <i className="bi bi-arrow-right ms-1"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="stat-card" style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '25px',
                                height: '100%',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    width: '90px',
                                    height: '90px',
                                    borderRadius: '0 0 0 90px',
                                    background: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)',
                                }}></div>

                                <div className="stat-icon" style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(45deg, #198754, #28a745)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '20px',
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    boxShadow: '0 10px 20px rgba(40, 167, 69, 0.3)'
                                }}>
                                    <i className="bi bi-check2-all"></i>
                                </div>

                                <div className="stat-info">
                                    <p className="text-muted mb-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Completed Assignments</p>
                                    <h2 style={{ color: '#002254', fontWeight: '700', marginBottom: '5px' }}>
                                        {loading ? <div className="placeholder col-6"></div> : dashboardData.completedAssignments}
                                    </h2>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '10px'
                                    }}>
                                        <span style={{
                                            padding: '3px 10px',
                                            background: dashboardData.averageGrade === 'A' ? 'rgba(40, 167, 69, 0.1)' :
                                                dashboardData.averageGrade === 'B' ? 'rgba(40, 167, 69, 0.1)' :
                                                    dashboardData.averageGrade === 'C' ? 'rgba(255, 193, 7, 0.1)' :
                                                        dashboardData.averageGrade === 'D' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                                            color: dashboardData.averageGrade === 'A' ? '#28a745' :
                                                dashboardData.averageGrade === 'B' ? '#28a745' :
                                                    dashboardData.averageGrade === 'C' ? '#ffc107' :
                                                        dashboardData.averageGrade === 'D' ? '#ffc107' : '#dc3545',
                                            borderRadius: '30px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            Average Grade: {dashboardData.averageGrade}
                                        </span>
                                    </div>
                                    <Link to="/my-assignments" style={{
                                        color: '#198754',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem'
                                    }}>
                                        View Assignments <i className="bi bi-arrow-right ms-1"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="stat-card" style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '25px',
                                height: '100%',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    width: '90px',
                                    height: '90px',
                                    borderRadius: '0 0 0 90px',
                                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
                                }}></div>

                                <div className="stat-icon" style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(45deg, #ff9500, #ffc107)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '20px',
                                    color: 'white',
                                    fontSize: '1.5rem',
                                    boxShadow: '0 10px 20px rgba(255, 193, 7, 0.3)'
                                }}>
                                    <i className="bi bi-question-circle"></i>
                                </div>

                                <div className="stat-info">
                                    <p className="text-muted mb-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Available Quizzes</p>
                                    <h2 style={{ color: '#002254', fontWeight: '700', marginBottom: '15px' }}>
                                        {loading ? <div className="placeholder col-6"></div> : dashboardData.availableQuizzes.length}
                                    </h2>
                                    <Link to="/student-available-quizzes" style={{
                                        color: '#ffc107',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem'
                                    }}>
                                        Take Quizzes <i className="bi bi-arrow-right ms-1"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    {dashboardData.quizData.length > 0 && (
                        <div className="row g-4 mb-4">
                            <div className="col-md-8">
                                <div className="card-section" style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '25px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                    height: '100%'
                                }}>
                                    <h5 className="mb-4" style={{ fontWeight: '600', color: '#002254' }}>Quiz Performance</h5>
                                    <div style={{ height: '300px' }}>
                                        <Bar
                                            data={{
                                                labels: dashboardData.quizData.map(q => q.title),
                                                datasets: [{
                                                    label: 'Score',
                                                    data: dashboardData.quizData.map(q => q.score),
                                                    backgroundColor: 'rgba(42, 245, 152, 0.6)',
                                                    borderColor: 'rgba(42, 245, 152, 1)',
                                                    borderWidth: 1,
                                                    borderRadius: 5,
                                                }, {
                                                    label: 'Total Marks',
                                                    data: dashboardData.quizData.map(q => q.total),
                                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                                    borderColor: 'rgba(0, 0, 0, 0.1)',
                                                    borderWidth: 1,
                                                    borderRadius: 5,
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { position: 'top' },
                                                },
                                                scales: {
                                                    y: { beginAtZero: true }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card-section" style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '25px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                    height: '100%'
                                }}>
                                    <h5 className="mb-4" style={{ fontWeight: '600', color: '#002254' }}>Assignment Status</h5>
                                    {dashboardData.assignmentData && (
                                        <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                                            <Doughnut
                                                data={{
                                                    labels: ['Completed', 'Pending'],
                                                    datasets: [{
                                                        data: [
                                                            dashboardData.assignmentData.completed,
                                                            dashboardData.assignmentData.pending
                                                        ],
                                                        backgroundColor: [
                                                            'rgba(40, 167, 69, 0.6)',
                                                            'rgba(220, 53, 69, 0.6)'
                                                        ],
                                                        borderColor: [
                                                            'rgba(40, 167, 69, 1)',
                                                            'rgba(220, 53, 69, 1)'
                                                        ],
                                                        borderWidth: 1
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { position: 'bottom' }
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Study Materials Section */}
                    {!loading && dashboardData.studyMaterials.length > 0 && (
                        <div className="card-section mb-4" style={{
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
                                        background: 'linear-gradient(135deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '15px'
                                    }}>
                                        <i className="bi bi-file-earmark-pdf" style={{
                                            color: '#08AEEA',
                                            fontSize: '1.2rem'
                                        }}></i>
                                    </div>
                                    <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>Recent Study Materials</h5>
                                </div>
                                <Link to="/study-materials" className="btn btn-sm" style={{
                                    background: 'white',
                                    color: '#08AEEA',
                                    border: '1px solid #08AEEA',
                                    borderRadius: '50px',
                                    padding: '0.35rem 1rem',
                                    fontWeight: '500'
                                }}>
                                    View All
                                </Link>
                            </div>
                            <div className="section-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0" style={{
                                        fontSize: '0.95rem'
                                    }}>
                                        <thead style={{
                                            background: 'rgba(8, 174, 234, 0.03)'
                                        }}>
                                            <tr>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Title</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Course</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Description</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Upload Date</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.studyMaterials.map((material) => (
                                                <tr key={material.id}>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <div className="d-flex align-items-center">
                                                            <i className="bi bi-file-pdf me-2" style={{ color: '#dc3545' }}></i>
                                                            <span style={{ fontWeight: '500', color: '#002254' }}>{material.title}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        {material.course_title}
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        {material.description || '-'}
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        {new Date(material.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <a
                                                            href={material.file}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="btn btn-sm"
                                                            style={{
                                                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                                color: 'white',
                                                                fontWeight: '500',
                                                                borderRadius: '50px',
                                                                padding: '0.35rem 1rem',
                                                                border: 'none'
                                                            }}
                                                        >
                                                            <i className="bi bi-download me-2"></i>
                                                            Download
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Available Quizzes Section */}
                    {!loading && dashboardData.availableQuizzes.length > 0 && (
                        <div className="card-section mb-4" style={{
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
                                        background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 149, 0, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '15px'
                                    }}>
                                        <i className="bi bi-question-circle" style={{
                                            color: '#ffc107',
                                            fontSize: '1.2rem'
                                        }}></i>
                                    </div>
                                    <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>Available Quizzes</h5>
                                </div>
                                <Link to="/student-available-quizzes" className="btn btn-sm" style={{
                                    background: 'white',
                                    color: '#ffc107',
                                    border: '1px solid #ffc107',
                                    borderRadius: '50px',
                                    padding: '0.35rem 1rem',
                                    fontWeight: '500'
                                }}>
                                    View All
                                </Link>
                            </div>
                            <div className="section-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0" style={{
                                        fontSize: '0.95rem'
                                    }}>
                                        <thead style={{
                                            background: 'rgba(255, 193, 7, 0.03)'
                                        }}>
                                            <tr>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Course</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Quiz Title</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Questions</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.availableQuizzes.map((quiz) => (
                                                <tr key={quiz.id}>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>{quiz.course_title}</td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle', fontWeight: '500', color: '#002254' }}>
                                                        {quiz.quiz_title}
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <span className="badge" style={{
                                                            background: 'rgba(255, 193, 7, 0.1)',
                                                            color: '#ffc107',
                                                            fontWeight: '600',
                                                            padding: '5px 10px',
                                                            borderRadius: '30px'
                                                        }}>
                                                            {quiz.total_questions} Questions
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <Link
                                                            to={`/attempt-quiz/${quiz.quiz_id}/${JSON.parse(localStorage.getItem('studentInfo')).studentId}/${quiz.course_id}`}
                                                            className="btn btn-sm"
                                                            style={{
                                                                background: 'linear-gradient(45deg, #ff9500, #ffc107)',
                                                                color: 'white',
                                                                fontWeight: '500',
                                                                borderRadius: '50px',
                                                                padding: '0.35rem 1rem',
                                                                border: 'none'
                                                            }}>
                                                            <i className="bi bi-play-fill me-1"></i>
                                                            Start Quiz
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Assignments */}
                    <div className="card-section mb-4" style={{
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
                                    background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(253, 126, 20, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-file-earmark-text" style={{
                                        color: '#dc3545',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>Pending Assignments</h5>
                            </div>
                            <Link to="/my-assignments" className="btn btn-sm" style={{
                                background: 'white',
                                color: '#dc3545',
                                border: '1px solid #dc3545',
                                borderRadius: '50px',
                                padding: '0.35rem 1rem',
                                fontWeight: '500'
                            }}>
                                View All
                            </Link>
                        </div>
                        <div className="section-body">
                            {loading ? (
                                <div className="p-4 text-center">
                                    <Loader size="medium" />
                                </div>
                            ) : dashboardData.pendingAssignments.length === 0 ? (
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
                                        <i className="bi bi-check-circle" style={{
                                            color: '#28a745',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#28a745', fontWeight: '600', marginBottom: '10px' }}>All Caught Up!</h5>
                                    <p className="text-muted mb-0">No pending assignments. Great job! 🎉</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0" style={{
                                        fontSize: '0.95rem'
                                    }}>
                                        <thead style={{
                                            background: 'rgba(220, 53, 69, 0.03)'
                                        }}>
                                            <tr>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Title</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Course</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Due Date</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.pendingAssignments.map((assignment) => (
                                                <tr key={assignment.id}>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle', fontWeight: '500', color: '#002254' }}>
                                                        <i className="bi bi-file-text me-2"></i>
                                                        {assignment.title}
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>{assignment.course_title}</td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <span className="badge" style={{
                                                            background: 'rgba(220, 53, 69, 0.1)',
                                                            color: '#dc3545',
                                                            fontWeight: '600',
                                                            padding: '5px 10px',
                                                            borderRadius: '30px'
                                                        }}>
                                                            <i className="bi bi-calendar-event me-1"></i> {assignment.due_date_formatted}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <Link to="/my-assignments" className="btn btn-sm" style={{
                                                            background: 'linear-gradient(45deg, #fd7e14, #dc3545)',
                                                            color: 'white',
                                                            fontWeight: '500',
                                                            borderRadius: '50px',
                                                            padding: '0.35rem 1rem',
                                                            border: 'none'
                                                        }}>
                                                            <i className="bi bi-upload me-2"></i>
                                                            Submit Now
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent & Favorite Courses */}
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card-section" style={{
                                background: 'white',
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                overflow: 'hidden',
                                height: '100%'
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
                                            background: 'linear-gradient(135deg, rgba(26, 86, 201, 0.1), rgba(0, 34, 84, 0.1))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '15px'
                                        }}>
                                            <i className="bi bi-clock-history" style={{
                                                color: '#1a56c9',
                                                fontSize: '1.2rem'
                                            }}></i>
                                        </div>
                                        <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>Recent Courses</h5>
                                    </div>
                                    <Link to="/my-courses" className="btn btn-sm" style={{
                                        background: 'white',
                                        color: '#1a56c9',
                                        border: '1px solid #1a56c9',
                                        borderRadius: '50px',
                                        padding: '0.35rem 1rem',
                                        fontWeight: '500'
                                    }}>
                                        View All
                                    </Link>
                                </div>
                                <div className="section-body p-0" style={{ height: 'calc(100% - 80px)' }}>
                                    {loading ? (
                                        <div className="p-4 text-center">
                                            <Loader size="small" />
                                        </div>
                                    ) : dashboardData.recentCourses.length === 0 ? (
                                        <div className="empty-state p-4 text-center">
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                margin: '0 auto',
                                                borderRadius: '50%',
                                                background: 'rgba(26, 86, 201, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '15px'
                                            }}>
                                                <i className="bi bi-journal-bookmark" style={{
                                                    color: '#1a56c9',
                                                    fontSize: '1.5rem'
                                                }}></i>
                                            </div>
                                            <p className="text-muted mb-3">You haven't enrolled in any courses yet.</p>
                                            <Link to="/all-courses" className="btn btn-sm" style={{
                                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                color: 'white',
                                                fontWeight: '500',
                                                borderRadius: '50px',
                                                padding: '0.5rem 1.2rem',
                                                border: 'none'
                                            }}>
                                                <i className="bi bi-search me-2"></i>
                                                Browse Courses
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="course-list">
                                            {dashboardData.recentCourses.map((course) => (
                                                <Link
                                                    key={course.id}
                                                    to={`/detail/${course.id}`}
                                                    className="course-item"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '15px 25px',
                                                        borderBottom: '1px solid #f0f0f0',
                                                        transition: 'background 0.2s ease',
                                                        textDecoration: 'none',
                                                        color: 'inherit'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <div className="course-image" style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        marginRight: '15px',
                                                        flexShrink: 0
                                                    }}>
                                                        <img
                                                            src={course.featured_img || "/course1.png"}
                                                            alt={course.title}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/60?text=Course';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="course-details" style={{ flex: 1 }}>
                                                        <h6 style={{
                                                            fontWeight: '600',
                                                            color: '#002254',
                                                            marginBottom: '5px'
                                                        }}>{course.title}</h6>
                                                        <div className="d-flex justify-content-between">
                                                            <small className="text-muted">
                                                                By: {course.teacher?.full_name || "Instructor"}
                                                            </small>
                                                            {(course.average_rating && course.total_ratings > 0) ? (
                                                                <small style={{
                                                                    color: '#ffc107',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    <i className="bi bi-star-fill me-1"></i>
                                                                    {Number(course.average_rating).toFixed(1)}
                                                                </small>
                                                            ) : (
                                                                <small className="text-muted">No ratings</small>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <i className="bi bi-chevron-right ms-2" style={{ color: '#c0c0c0' }}></i>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="card-section" style={{
                                background: 'white',
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                overflow: 'hidden',
                                height: '100%'
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
                                            background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(215, 77, 127, 0.1))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '15px'
                                        }}>
                                            <i className="bi bi-heart" style={{
                                                color: '#dc3545',
                                                fontSize: '1.2rem'
                                            }}></i>
                                        </div>
                                        <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>Favorite Courses</h5>
                                    </div>
                                    <Link to="/favourite-courses" className="btn btn-sm" style={{
                                        background: 'white',
                                        color: '#dc3545',
                                        border: '1px solid #dc3545',
                                        borderRadius: '50px',
                                        padding: '0.35rem 1rem',
                                        fontWeight: '500'
                                    }}>
                                        View All
                                    </Link>
                                </div>
                                <div className="section-body p-0" style={{ height: 'calc(100% - 80px)' }}>
                                    {loading ? (
                                        <div className="p-4 text-center">
                                            <Loader size="small" />
                                        </div>
                                    ) : dashboardData.favoriteCourses.length === 0 ? (
                                        <div className="empty-state p-4 text-center">
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                margin: '0 auto',
                                                borderRadius: '50%',
                                                background: 'rgba(220, 53, 69, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '15px'
                                            }}>
                                                <i className="bi bi-heart" style={{
                                                    color: '#dc3545',
                                                    fontSize: '1.5rem'
                                                }}></i>
                                            </div>
                                            <p className="text-muted mb-3">No favorite courses yet.</p>
                                            <Link to="/all-courses" className="btn btn-sm" style={{
                                                background: 'linear-gradient(45deg, #fd7e14, #dc3545)',
                                                color: 'white',
                                                fontWeight: '500',
                                                borderRadius: '50px',
                                                padding: '0.5rem 1.2rem',
                                                border: 'none'
                                            }}>
                                                <i className="bi bi-search me-2"></i>
                                                Browse Courses
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="course-list">
                                            {dashboardData.favoriteCourses.map((course) => (
                                                <Link
                                                    key={course.id}
                                                    to={`/detail/${course.id}`}
                                                    className="course-item"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        padding: '15px 25px',
                                                        borderBottom: '1px solid #f0f0f0',
                                                        transition: 'background 0.2s ease',
                                                        textDecoration: 'none',
                                                        color: 'inherit'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <div className="course-image" style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        marginRight: '15px',
                                                        flexShrink: 0
                                                    }}>
                                                        <img
                                                            src={course.featured_img || "/course1.png"}
                                                            alt={course.title}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/60?text=Course';
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="course-details" style={{ flex: 1 }}>
                                                        <h6 style={{
                                                            fontWeight: '600',
                                                            color: '#002254',
                                                            marginBottom: '5px'
                                                        }}>{course.title}</h6>
                                                        <div className="d-flex justify-content-between">
                                                            <small className="text-muted">
                                                                By: {course.teacher?.full_name || "Instructor"}
                                                            </small>
                                                            {(course.average_rating && course.total_ratings > 0) ? (
                                                                <small style={{
                                                                    color: '#ffc107',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    <i className="bi bi-star-fill me-1"></i>
                                                                    {Number(course.average_rating).toFixed(1)}
                                                                </small>
                                                            ) : (
                                                                <small className="text-muted">No ratings</small>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <i className="bi bi-chevron-right ms-2" style={{ color: '#c0c0c0' }}></i>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;