import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TeacherLogout() {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Remove teacher data from localStorage
        localStorage.removeItem('teacherLoginStatus');
        localStorage.removeItem('teacherData');
        
        // Dispatch custom event to notify Header component
        window.dispatchEvent(new Event('teacherLoginChange'));
        
        // Redirect to login page
        navigate('/teacher-login');
    }, [navigate]);

    return null;  // This component doesn't render anything
}

export default TeacherLogout;

