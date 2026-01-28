import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ChatNotification from '../common/ChatNotification';

function TeacherSidebar() {  
    const teacherId = localStorage.getItem('teacherId');
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
                    color: active ? '#08AEEA' : '#506690',
                    backgroundColor: active ? 'rgba(8, 174, 234, 0.05)' : 'transparent',
                    borderLeft: active ? '4px solid #08AEEA' : '4px solid transparent',
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
                
                {to === '/teacher-chat' && (
                    <ChatNotification userType="teacher" userId={teacherId} />
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
                background: 'linear-gradient(135deg, #002254 0%, #1a56c9 100%)',
                color: 'white',
                padding: '20px',
                position: 'relative'
            }}>
                <h5 style={{ 
                    margin: '0',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <i className="bi bi-grid-1x2 me-2"></i> Teacher Dashboard
                </h5>
            </div>
            <div className='sidebar-menu' style={{ marginTop: '5px' }}>
                <MenuItem to='/teacher-dashboard' icon='bi-house'>Dashboard</MenuItem>
                <MenuItem to='/teacher-courses' icon='bi-journal-bookmark'>My Courses</MenuItem>
                <MenuItem to='/teacher-user-list' icon='bi-people'>My Students</MenuItem>
                <MenuItem to='/teacher-assignments' icon='bi-file-earmark-text'>Assignment Dashboard</MenuItem>
                <MenuItem to='/teacher-quizzes' icon='bi-question-circle'>Quiz Management</MenuItem>
                <MenuItem to='/view-student-quiz-results' icon='bi-check2-circle'>Student Quiz Results</MenuItem>
                <MenuItem to='/teacher-chat' icon='bi-chat-dots'>Student Chat</MenuItem>
                <MenuItem to='/add-courses' icon='bi-plus-circle'>Add Course</MenuItem>
                
                <div style={{ 
                    margin: '10px 20px',
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: '10px'
                }}></div>
                
                <MenuItem to='/teacher-profile-setting' icon='bi-person-gear'>Profile Settings</MenuItem>
                <MenuItem to='/teacher-change-password' icon='bi-shield-lock'>Change Password</MenuItem>
                <MenuItem to='/teacher-logout' icon='bi-box-arrow-right'>Logout</MenuItem>
            </div>
        </div>
    );
}

export default TeacherSidebar;
