import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ChatNotification from '../common/ChatNotification';

function Sidebar() {
    const studentId = localStorage.getItem('studentId');
    const location = useLocation();

    // Check if a path is active
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Menu item component with consistent styling
    const MenuItem = ({ to, icon, children }) => {
        const active = isActive(to);
        return (
            <Link
                to={to}
                className={`sidebar-menu-item ${active ? 'active' : ''}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 20px',
                    color: active ? '#0EA5E9' : 'var(--text-secondary)', // Sky Blue for active
                    backgroundColor: active ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
                    borderLeft: active ? '4px solid #0EA5E9' : '4px solid transparent',
                    textDecoration: 'none',
                    fontWeight: active ? '600' : '500',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                    if (!active) {
                        e.currentTarget.style.backgroundColor = 'rgba(8, 174, 234, 0.02)';
                        e.currentTarget.style.color = '#08AEEA';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#506690';
                    }
                }}
            >
                <i className={`bi ${icon}`} style={{
                    fontSize: '1.1rem',
                    marginRight: '10px',
                    width: '24px',
                    textAlign: 'center'
                }}></i>
                <span style={{ flex: 1 }}>{children}</span>

                {to === '/student-chat' && (
                    <ChatNotification userType="student" userId={studentId} />
                )}
            </Link>
        );
    };

    return (
        <div className='sidebar-container' style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
        }}>
            <div className='sidebar-header' style={{
                background: 'var(--hero-bg)', // Use the vibrant hero gradient
                color: 'white',
                padding: '20px',
                position: 'relative'
            }}>
                <h5 style={{
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    letterSpacing: '0.5px'
                }}>
                    <i className="bi bi-grid-1x2 me-2"></i> Student Dashboard
                </h5>
            </div>
            <div className='sidebar-menu' style={{ marginTop: '5px' }}>
                <MenuItem to='/user-dashboard' icon='bi-house'>Dashboard</MenuItem>
                <MenuItem to='/my-courses' icon='bi-journal-bookmark'>My Courses</MenuItem>
                <MenuItem to='/my-teachers' icon='bi-person-video3'>My Teachers</MenuItem>
                <MenuItem to='/my-assignments' icon='bi-file-earmark-text'>My Assignments</MenuItem>
                <MenuItem to='/student-available-quizzes' icon='bi-question-circle'>Available Quizzes</MenuItem>
                <MenuItem to='/student-quiz-results' icon='bi-check2-circle'>Quiz Results</MenuItem>
                <MenuItem to='/student-chat' icon='bi-chat-dots'>Teacher Chat</MenuItem>
                <MenuItem to='/study-materials' icon='bi-file-earmark-pdf'>Study Materials</MenuItem>
                <MenuItem to='/favourite-courses' icon='bi-heart'>Favourite Courses</MenuItem>
                <MenuItem to='/recommended-courses' icon='bi-lightning'>Recommended Courses</MenuItem>

                <div style={{
                    margin: '10px 20px',
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: '10px'
                }}></div>

                <MenuItem to='/profile-setting' icon='bi-person-gear'>Profile Settings</MenuItem>
                <MenuItem to='/change-password' icon='bi-shield-lock'>Change Password</MenuItem>
                <MenuItem to='/user-logout' icon='bi-box-arrow-right'>Logout</MenuItem>
            </div>
        </div>
    );
}

export default Sidebar;
