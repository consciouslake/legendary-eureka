import React from 'react';
import { Link } from 'react-router-dom';
import ChatNotification from '../common/ChatNotification';

function StudentSidebar() {  
    const studentId = localStorage.getItem('studentId');
    
    return (
        <div className='card'>
            <h5 className='card-header'>Student Dashboard</h5>
            <div className='list-group list-group-flush'>
                <Link to='/student-dashboard' className='list-group-item list-group-item-action'>Dashboard</Link>
                <Link to='/student-courses' className='list-group-item list-group-item-action'>My Courses</Link>
                <Link to='/student-assignments' className='list-group-item list-group-item-action'>My Assignments</Link>
                <Link to='/student-available-quizzes' className='list-group-item list-group-item-action'>Available Quizzes</Link>
                <Link to='/student-quiz-results' className='list-group-item list-group-item-action'>Quiz Results</Link>
                <Link to='/student-chat' className='list-group-item list-group-item-action d-flex justify-content-between align-items-center'>
                    <span>Teacher Chat</span>
                    <ChatNotification userType="student" userId={studentId} />
                </Link>
                <Link to='/favorite-courses' className='list-group-item list-group-item-action'>Favorite Courses</Link>
                <Link to='/recommended-courses' className='list-group-item list-group-item-action'>Recommended Courses</Link>
                <Link to='/student-profile' className='list-group-item list-group-item-action'>Profile Settings</Link>
                <Link to='/student-change-password' className='list-group-item list-group-item-action'>Change Password</Link>
                <Link to='/student-logout' className='list-group-item list-group-item-action text-danger'>Logout</Link>
            </div>
        </div>
    );
}

export default StudentSidebar;