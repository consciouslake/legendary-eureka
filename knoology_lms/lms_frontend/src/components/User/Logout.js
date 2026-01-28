import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Remove student data from localStorage
        localStorage.removeItem('studentInfo');
        
        // Dispatch custom event to notify Header component
        window.dispatchEvent(new Event('studentLoginChange'));
        
        // Redirect to login page
        navigate('/user-login');
    }, [navigate]);

    return null;  // This component doesn't render anything
}

export default Logout;