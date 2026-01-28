import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from "axios";

const BASE_API_URL = 'http://127.0.0.1:8000/api/teacher-login/';

function TeacherLogin() {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [teacherLoginData, setLoginData] = useState({
        'email': '',
        'password': '',
    });
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        document.title = "Teacher Login | Knoology LMS";
    }, []);

    const handleChange = (event) => {
        setLoginData({
            ...teacherLoginData,
            [event.target.name]: event.target.value,
        });
        setErrorMsg("");
        setSuccessMsg("");
    }

    const submitForm = async (event) => {
        event.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setLoading(true);

        try {
            const response = await axios.post(BASE_API_URL, {
                email: teacherLoginData.email,
                password: teacherLoginData.password
            });

            if (response.data.status === 'success') {
                // Set login status first
                localStorage.setItem('teacherLoginStatus', 'true');
                localStorage.setItem('teacherData', JSON.stringify({
                    teacherId: response.data.teacher_id,
                    fullName: response.data.full_name,
                    email: response.data.email
                }));

                // Dispatch event to notify Header component
                window.dispatchEvent(new Event('teacherLoginChange'));

                setSuccessMsg("Login successful! Redirecting to dashboard...");
                setTimeout(() => {
                    navigate('/teacher-dashboard');
                }, 2000);
            } else {
                setErrorMsg(response.data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                // Check if account is not verified
                if (error.response.status === 403 && error.response.data.verification_required) {
                    setErrorMsg(
                        <div>
                            {error.response.data.message || "Account not verified."}
                            <div className="mt-2">
                                <Link to={`/verify-teacher/${error.response.data.teacher_id}`} className="btn btn-sm btn-primary">
                                    Verify Account
                                </Link>
                            </div>
                        </div>
                    );
                } else {
                    setErrorMsg(error.response.data.message || "Login failed. Please try again.");
                }
            } else if (error.request) {
                setErrorMsg("Network error. Please check your connection.");
            } else {
                setErrorMsg("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
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
                            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
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
                                    <i className="bi bi-person-workspace" style={{ fontSize: '2.5rem', color: 'white' }}></i>
                                </div>
                                <h2 style={{ color: 'white', fontWeight: '600', marginBottom: '10px' }}>Teacher Login</h2>
                                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>Access your teaching dashboard</p>
                            </div>
                        </div>
                        
                        <div className="card-body p-4 p-lg-5">
                            {errorMsg && (
                                <div className="alert mb-4" style={{
                                    background: 'rgba(220, 53, 69, 0.1)',
                                    color: '#dc3545',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px'
                                }} role="alert">
                                    <div className="d-flex">
                                        <div style={{ marginRight: '15px' }}>
                                            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Login Error</h6>
                                            <div>{errorMsg}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {successMsg && (
                                <div className="alert mb-4" style={{
                                    background: 'rgba(25, 135, 84, 0.1)',
                                    color: '#198754',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px'
                                }} role="alert">
                                    <div className="d-flex">
                                        <div style={{ marginRight: '15px' }}>
                                            <i className="bi bi-check-circle-fill" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Success!</h6>
                                            <p className="mb-0">{successMsg}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <form onSubmit={submitForm}>
                                <div className="mb-4">
                                    <label htmlFor="email" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-envelope me-2" style={{ color: '#6a11cb' }}></i>
                                        Email Address
                                    </label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        id="email"
                                        name="email"
                                        value={teacherLoginData.email}
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
                                            <i className="bi bi-key me-2" style={{ color: '#6a11cb' }}></i>
                                            Password
                                        </label>
                                        <Link to="/teacher-forgot-password" style={{ fontSize: '0.875rem', color: '#6a11cb', textDecoration: 'none' }}>
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        id="password"
                                        name="password"
                                        value={teacherLoginData.password}
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
                                    style={{
                                        background: 'linear-gradient(45deg, #6a11cb, #2575fc)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '0.75rem',
                                        fontWeight: '500',
                                        boxShadow: '0 4px 15px rgba(106, 17, 203, 0.2)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Logging in...
                                        </span>
                                    ) : 'Login'}
                                </button>
                                
                                <div className="text-center">
                                    <p className="mb-0" style={{ color: '#6c757d' }}>
                                        Don't have an account? {' '}
                                        <Link to="/teacher-register" style={{ color: '#6a11cb', fontWeight: '500', textDecoration: 'none' }}>
                                            Register Now
                                        </Link>
                                    </p>
                                </div>
                                
                                <div className="mt-4 pt-3 border-top text-center">
                                    <Link to="/" style={{ color: '#6c757d', fontSize: '0.9rem', textDecoration: 'none' }}>
                                        <i className="bi bi-house-door me-1"></i> Back to Home
                                    </Link>
                                    <span className="mx-2 text-muted">|</span>
                                    <Link to="/user-login" style={{ color: '#6c757d', fontSize: '0.9rem', textDecoration: 'none' }}>
                                        <i className="bi bi-mortarboard me-1"></i> Student Login
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

export default TeacherLogin;