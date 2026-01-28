import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
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

function TeacherDashboard() {
    const [dashboardData, setDashboardData] = useState({
        totalCourses: 0,
        totalStudents: 0,
        recentCourses: [], // Always initialize as empty array
        courseData: [], // For the chart
        profileData: null
    });
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        document.title = "Teacher Dashboard | Knoology LMS";
        const teacherData = localStorage.getItem('teacherData');
        if (teacherData) {
            const { teacherId } = JSON.parse(teacherData);

            // Fetch teacher dashboard stats
            const fetchDashboardData = async () => {
                setLoading(true);
                try {
                    // Fetch teacher profile data
                    const profileResponse = await axios.get(`${BASE_API_URL}/teacher/${teacherId}/`);

                    // Fetch stats (total courses, total students)
                    const statsResponse = await axios.get(`${BASE_API_URL}/teacher-dashboard-stats/${teacherId}/`);

                    // Fetch recent courses
                    const coursesResponse = await axios.get(`${BASE_API_URL}/teacher-courses/${teacherId}/`);

                    if (statsResponse.data.status === 'success') {
                        setDashboardData({
                            totalCourses: statsResponse.data.total_courses,
                            totalStudents: statsResponse.data.total_students,
                            courseData: statsResponse.data.course_data || [],
                            recentCourses: coursesResponse.data.slice(0, 5) || [], // Get top 5 courses
                            profileData: profileResponse.data
                        });
                    } else {
                        setDashboardData({
                            totalCourses: 0,
                            totalStudents: 0,
                            recentCourses: [],
                            courseData: [],
                            profileData: profileResponse.data
                        });
                    }

                } catch (error) {
                    console.error('Error fetching dashboard data:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchDashboardData();
        }
    }, []);

    return (
        <div className='container-fluid px-4' style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <TeacherSidebar />
                </div>
                <div className='col-md-9'>
                    {/* Welcome Section */}
                    <div className="welcome-section" style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
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
                                    {!loading && dashboardData.profileData?.profile_img && (
                                        <div className="me-3">
                                            <img
                                                src={dashboardData.profileData.profile_img || "https://via.placeholder.com/60?text=Teacher"}
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
                                                    e.target.src = 'https://via.placeholder.com/60?text=Teacher';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <h3 style={{ color: '#002254', fontWeight: '600' }}>
                                            {getGreeting()}, {dashboardData.profileData?.full_name || 'Teacher'}!
                                        </h3>
                                        <p className="text-muted mb-md-0">{getCurrentDate()}</p>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-3 mt-md-0">
                                    <Link to="/add-courses" className="btn" style={{
                                        background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                        color: 'white',
                                        fontWeight: '500',
                                        borderRadius: '50px',
                                        padding: '0.6rem 1.2rem',
                                        border: 'none',
                                        boxShadow: '0 4px 10px rgba(42, 245, 152, 0.2)'
                                    }}>
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Add New Course
                                    </Link>
                                    <Link to="/teacher-profile-setting" className="btn btn-light" style={{
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
                                    <p className="text-muted mb-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Total Courses</p>
                                    <h2 style={{ color: '#002254', fontWeight: '700', marginBottom: '15px' }}>
                                        {loading ? <div className="placeholder col-4"></div> : dashboardData.totalCourses}
                                    </h2>
                                    <Link to="/teacher-courses" style={{
                                        color: '#1a56c9',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem'
                                    }}>
                                        Manage Courses <i className="bi bi-arrow-right ms-1"></i>
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
                                    <i className="bi bi-people"></i>
                                </div>

                                <div className="stat-info">
                                    <p className="text-muted mb-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Total Students</p>
                                    <h2 style={{ color: '#002254', fontWeight: '700', marginBottom: '15px' }}>
                                        {loading ? <div className="placeholder col-4"></div> : dashboardData.totalStudents}
                                    </h2>
                                    <Link to="/teacher-user-list" style={{
                                        color: '#198754',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem'
                                    }}>
                                        View Students <i className="bi bi-arrow-right ms-1"></i>
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
                                    <p className="text-muted mb-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>Quizzes</p>
                                    <div style={{ marginBottom: '15px' }}>
                                        <Link to="/teacher-quizzes" className="btn btn-sm me-2" style={{
                                            background: 'rgba(255, 193, 7, 0.1)',
                                            color: '#ffc107',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '0.3rem 0.8rem',
                                            fontWeight: '500',
                                            fontSize: '0.85rem'
                                        }}>
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Create Quiz
                                        </Link>
                                    </div>
                                    <Link to="/view-student-quiz-results" style={{
                                        color: '#ffc107',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        fontSize: '0.95rem'
                                    }}>
                                        View Results <i className="bi bi-arrow-right ms-1"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    {dashboardData.courseData.length > 0 && (
                        <div className="card-section mb-4" style={{
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                            padding: '25px',
                            overflow: 'hidden'
                        }}>
                            <h5 className="mb-4" style={{ fontWeight: '600', color: '#002254' }}>Student Enrollment Overview</h5>
                            <div style={{ height: '300px' }}>
                                <Bar
                                    data={{
                                        labels: dashboardData.courseData.map(c => c.title),
                                        datasets: [
                                            {
                                                label: 'Students Enrolled',
                                                data: dashboardData.courseData.map(c => c.enrollments),
                                                backgroundColor: 'rgba(8, 174, 234, 0.6)',
                                                borderColor: 'rgba(8, 174, 234, 1)',
                                                borderWidth: 1,
                                                borderRadius: 5,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: false,
                                            },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.05)'
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    display: false
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Recent Courses */}
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
                                    background: 'linear-gradient(135deg, rgba(26, 86, 201, 0.1), rgba(0, 34, 84, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-journal-bookmark" style={{
                                        color: '#1a56c9',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>Recent Courses</h5>
                            </div>
                            <Link to="/add-courses" className="btn btn-sm" style={{
                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.5rem 1.2rem',
                                fontWeight: '500'
                            }}>
                                <i className="bi bi-plus-circle me-2"></i>
                                Add New Course
                            </Link>
                        </div>
                        <div className="section-body">
                            {loading ? (
                                <div className="p-4">
                                    <Loader size="medium" />
                                </div>
                            ) : dashboardData.recentCourses.length === 0 ? (
                                <div className="empty-state p-5 text-center">
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(26, 86, 201, 0.1), rgba(0, 34, 84, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <i className="bi bi-journal-plus" style={{
                                            color: '#1a56c9',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Courses Yet</h5>
                                    <p className="text-muted mb-4">You haven't created any courses yet. Start by adding your first course!</p>
                                    <Link to="/add-courses" className="btn" style={{
                                        background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                        color: 'white',
                                        fontWeight: '500',
                                        borderRadius: '50px',
                                        padding: '0.6rem 1.5rem',
                                        border: 'none',
                                        boxShadow: '0 5px 15px rgba(8, 174, 234, 0.2)'
                                    }}>
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Add Your First Course
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0" style={{ fontSize: '0.95rem' }}>
                                        <thead style={{ background: 'rgba(26, 86, 201, 0.03)' }}>
                                            <tr>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Course Title</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Category</th>
                                                <th style={{ padding: '15px 25px', fontWeight: '600', color: '#506690' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.recentCourses.map((course) => (
                                                <tr key={course.id}>
                                                    <td style={{ padding: '15px 25px', fontWeight: '500', color: '#002254', verticalAlign: 'middle' }}>
                                                        {course.title}
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <span className="badge" style={{
                                                            background: 'rgba(26, 86, 201, 0.1)',
                                                            color: '#1a56c9',
                                                            fontWeight: '600',
                                                            padding: '5px 10px',
                                                            borderRadius: '30px'
                                                        }}>
                                                            {course.category?.title || 'Uncategorized'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px 25px', verticalAlign: 'middle' }}>
                                                        <Link to={`/add-chapter/${course.id}`} className="btn btn-sm me-2" style={{
                                                            background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50px',
                                                            padding: '0.35rem 0.8rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            <i className="bi bi-plus-circle me-1"></i>
                                                            Add Chapter
                                                        </Link>
                                                        <Link to={`/teacher-course-chapters/${course.id}`} className="btn btn-sm" style={{
                                                            background: '#f8f9fa',
                                                            color: '#506690',
                                                            border: 'none',
                                                            borderRadius: '50px',
                                                            padding: '0.35rem 0.8rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            <i className="bi bi-list me-1"></i>
                                                            View Chapters
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
                </div>
            </div>
        </div>
    );
}

export default TeacherDashboard;