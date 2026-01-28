import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        email: '',
        password: '',
        interested_categories: ''
    });
    const [registerStatus, setRegisterStatus] = useState({
        status: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Student Registration | Knoology LMS";
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRegisterStatus({ status: 'loading', message: 'Registering...' });
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/student/register/', formData);
            setRegisterStatus({
                status: 'success',
                message: 'Registration successful! Redirecting to verification page...'
            });
            // Clear form
            setFormData({
                fullname: '',
                username: '',
                email: '',
                password: '',
                interested_categories: ''
            });
            // Redirect to Login page after 2 seconds
            setTimeout(() => {
                navigate('/user-login');
            }, 2000);
        } catch (error) {
            setRegisterStatus({
                status: 'error',
                message: error.response?.data?.message || 'Registration failed. Please try again.'
            });
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
                            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
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
                                    <i className="bi bi-person-plus" style={{ fontSize: '2.5rem', color: 'white' }}></i>
                                </div>
                                <h2 style={{ color: 'white', fontWeight: '600', marginBottom: '10px' }}>Student Registration</h2>
                                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>Join our learning platform today</p>
                            </div>
                        </div>

                        <div className="card-body p-4 p-lg-5">
                            {registerStatus.message && (
                                <div className="alert mb-4" style={{
                                    background: registerStatus.status === 'success' ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                                    color: registerStatus.status === 'success' ? '#198754' : '#dc3545',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px'
                                }} role="alert">
                                    <div className="d-flex">
                                        <div style={{ marginRight: '15px' }}>
                                            <i className={`bi ${registerStatus.status === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>
                                                {registerStatus.status === 'success' ? 'Success!' : 'Registration Error'}
                                            </h6>
                                            <p className="mb-0">{registerStatus.message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="fullname" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-person me-2" style={{ color: '#4CAF50' }}></i>
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="fullname"
                                        name="fullname"
                                        value={formData.fullname}
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
                                <div className="mb-4">
                                    <label htmlFor="username" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-person-badge me-2" style={{ color: '#4CAF50' }}></i>
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
                                <div className="mb-4">
                                    <label htmlFor="email" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-envelope me-2" style={{ color: '#4CAF50' }}></i>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
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
                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-key me-2" style={{ color: '#4CAF50' }}></i>
                                        Password
                                    </label>
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
                                    <small className="form-text text-muted">Password should be at least 8 characters long</small>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="interested_categories" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-tag me-2" style={{ color: '#4CAF50' }}></i>
                                        Interested Categories
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="interested_categories"
                                        name="interested_categories"
                                        value={formData.interested_categories}
                                        onChange={handleChange}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: 'none',
                                            minHeight: '100px'
                                        }}
                                        required
                                    ></textarea>
                                    <small className="form-text text-muted">Enter categories separated by commas (e.g., Programming, Business, Design)</small>
                                </div>

                                <button
                                    type="submit"
                                    className="btn w-100 mb-4"
                                    style={{
                                        background: 'linear-gradient(45deg, #4CAF50, #2E7D32)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '0.75rem',
                                        fontWeight: '500',
                                        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.2)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    disabled={loading || registerStatus.status === 'loading'}
                                >
                                    {loading || registerStatus.status === 'loading' ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Registering...
                                        </span>
                                    ) : 'Create Account'}
                                </button>

                                <div className="text-center">
                                    <p className="mb-0" style={{ color: '#6c757d' }}>
                                        Already have an account? {' '}
                                        <Link to="/user-login" style={{ color: '#4CAF50', fontWeight: '500', textDecoration: 'none' }}>
                                            Login Now
                                        </Link>
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-top text-center">
                                    <Link to="/" style={{ color: '#6c757d', fontSize: '0.9rem', textDecoration: 'none' }}>
                                        <i className="bi bi-house-door me-1"></i> Back to Home
                                    </Link>
                                    <span className="mx-2 text-muted">|</span>
                                    <Link to="/teacher-register" style={{ color: '#6c757d', fontSize: '0.9rem', textDecoration: 'none' }}>
                                        <i className="bi bi-person-workspace me-1"></i> Register as Teacher
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

export default Register;