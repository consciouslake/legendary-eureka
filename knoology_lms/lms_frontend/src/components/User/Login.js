import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loginStatus, setLoginStatus] = useState({
        status: '',
        message: ''
    });
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        document.title = "Student Login | Knoology LMS";
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        
        // Clear any error messages when user starts typing
        if (loginStatus.status === 'error') {
            setLoginStatus({ status: '', message: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Clear any previous status first, then set loading state
        setLoginStatus({ status: 'loading', message: 'Logging in...' });
        
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/student/login/', formData);
            if (response.data.status === 'success') {
                setLoginStatus({
                    status: 'success',
                    message: 'Login successful! Redirecting...'
                });
                // Store student data in localStorage
                localStorage.setItem('studentInfo', JSON.stringify({
                    studentId: response.data.student_id,
                    username: response.data.username,
                    fullname: response.data.fullname,
                    email: response.data.email
                }));
                // Dispatch event to notify Header component
                window.dispatchEvent(new Event('studentLoginChange'));
                
                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    navigate('/user-dashboard');
                }, 1000);
            }
        } catch (error) {
            // Clear loading state first
            setTimeout(() => {
                // Check for verification required response
                if (error.response?.status === 403 && error.response.data.verification_required) {
                    setLoginStatus({
                        status: 'error',
                        message: (
                            <div>
                                {error.response.data.message || 'Account is not verified.'}
                                <div className="mt-2">
                                    <Link to={`/verify-student/${error.response.data.student_id}`} className="btn btn-sm" style={{
                                        background: 'linear-gradient(45deg, #FF8008, #FFC837)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '0.5rem 1rem',
                                        fontWeight: '500',
                                        boxShadow: '0 4px 15px rgba(255, 128, 8, 0.2)'
                                    }}>
                                        Verify Account
                                    </Link>
                                </div>
                            </div>
                        )
                    });
                } else {
                    setLoginStatus({
                        status: 'error',
                        message: error.response?.data?.message || 'Invalid username or password'
                    });
                }
            }, 300); // Small delay to ensure smooth transition between states
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card border-0" style={{ 
                        borderRadius: '20px',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden'
                    }}>
                        {/* Header with gradient background */}
                        <div style={{
                            background: 'linear-gradient(135deg, #FF8008 0%, #FFC837 100%)',
                            padding: '40px 30px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative elements */}
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                zIndex: '0'
                            }}></div>
                            <div style={{
                                position: 'absolute',
                                bottom: '-10px',
                                left: '10%',
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                zIndex: '0'
                            }}></div>
                            
                            <div className="text-center position-relative" style={{ zIndex: '1' }}>
                                <div className="d-inline-flex align-items-center justify-content-center mb-4" style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '20px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                }}>
                                    <i className="bi bi-mortarboard" style={{ fontSize: '2.5rem', color: 'white' }}></i>
                                </div>
                                <h2 style={{ color: 'white', fontWeight: '600', marginBottom: '10px' }}>Student Login</h2>
                                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>Access your learning dashboard</p>
                            </div>
                        </div>
                        
                        <div className="card-body p-4 p-lg-5">
                            {loginStatus.message && loginStatus.status !== '' && (
                                <div className="alert mb-4" style={{
                                    background: loginStatus.status === 'success' ? 'rgba(25, 135, 84, 0.1)' : 
                                              loginStatus.status === 'loading' ? 'rgba(13, 110, 253, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                                    color: loginStatus.status === 'success' ? '#198754' : 
                                          loginStatus.status === 'loading' ? '#0d6efd' : '#dc3545',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px',
                                    transition: 'all 0.3s ease-in-out'
                                }} role="alert">
                                    <div className="d-flex">
                                        <div style={{ marginRight: '15px' }}>
                                            {loginStatus.status === 'loading' ? (
                                                <div className="spinner-border spinner-border-sm" style={{ fontSize: '1.5rem', color: '#0d6efd' }} role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            ) : (
                                                <i className={`bi ${loginStatus.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} 
                                                   style={{ fontSize: '1.5rem' }}></i>
                                            )}
                                        </div>
                                        <div>
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>
                                                {loginStatus.status === 'success' ? 'Success!' : 
                                                 loginStatus.status === 'loading' ? 'Please Wait' : 'Login Error'}
                                            </h6>
                                            <div>{loginStatus.message}</div>
                                        </div>
                                    </div>
                            </div>
                        )}
                            
                        <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="username" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-person me-2" style={{ color: '#FF8008' }}></i>
                                        Username
                                    </label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: 'none'
                                        }}
                                    required 
                                />
                            </div>
                                
                            <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label htmlFor="password" className="form-label mb-0" style={{ fontWeight: '500', color: '#495057' }}>
                                            <i className="bi bi-key me-2" style={{ color: '#FF8008' }}></i>
                                            Password
                                        </label>
                                        <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: '#FF8008', textDecoration: 'none' }}>
                                            Forgot Password?
                                        </Link>
                                    </div>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: 'none'
                                        }}
                                    required 
                                />
                                </div>
                                
                                <div className="mb-4 form-check">
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <label className="form-check-label" htmlFor="rememberMe" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                                        Remember Me
                                    </label>
                            </div>
                                
                            <button 
                                type="submit" 
                                    className="btn w-100 mb-4"
                                disabled={loginStatus.status === 'loading'}
                                    style={{
                                        background: 'linear-gradient(45deg, #FF8008, #FFC837)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '0.75rem',
                                        fontWeight: '500',
                                        boxShadow: '0 4px 15px rgba(255, 128, 8, 0.2)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {loginStatus.status === 'loading' ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Logging in...
                                        </span>
                                    ) : 'Login'}
                            </button>
                                
                                <div className="text-center">
                                    <p className="mb-0" style={{ color: '#6c757d' }}>
                                        Don't have an account? {' '}
                                        <Link to="/user-register" style={{ color: '#FF8008', fontWeight: '500', textDecoration: 'none' }}>
                                            Register Now
                                        </Link>
                                    </p>
                                </div>
                                
                                <div className="mt-4 pt-3 border-top text-center">
                                    <Link to="/" style={{ color: '#6c757d', fontSize: '0.9rem', textDecoration: 'none' }}>
                                        <i className="bi bi-house-door me-1"></i> Back to Home
                                    </Link>
                                    <span className="mx-2 text-muted">|</span>
                                    <Link to="/teacher-login" style={{ color: '#6c757d', fontSize: '0.9rem', textDecoration: 'none' }}>
                                        <i className="bi bi-person-workspace me-1"></i> Teacher Login
                                    </Link>
                                </div>
                        </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;