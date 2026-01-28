import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({
        type: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Forgot Password | Knoology LMS";
    }, []);

    const handleChange = (e) => {
        setEmail(e.target.value);
        setStatus({type: '', message: ''});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({type: '', message: ''});

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/student/forgot-password/', { email });
            
            if (response.data.status === 'success') {
                setStatus({
                    type: 'success',
                    message: 'Password reset link has been sent to your email.'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Email not found or an error occurred.'
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
                                    <i className="bi bi-key-fill" style={{ fontSize: '2.5rem', color: 'white' }}></i>
                                </div>
                                <h2 style={{ color: 'white', fontWeight: '600', marginBottom: '10px' }}>Forgot Password</h2>
                                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>We'll send you a reset link</p>
                            </div>
                        </div>
                        
                        <div className="card-body p-4 p-lg-5">
                            {status.message && (
                                <div className="alert mb-4" style={{
                                    background: status.type === 'success' ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                                    color: status.type === 'success' ? '#198754' : '#dc3545',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px'
                                }} role="alert">
                                    <div className="d-flex">
                                        <div style={{ marginRight: '15px' }}>
                                            <i className={`bi ${status.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>
                                                {status.type === 'success' ? 'Success!' : 'Error'}
                                            </h6>
                                            <p className="mb-0">{status.message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="email" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-envelope me-2" style={{ color: '#4CAF50' }}></i>
                                        Email Address
                                    </label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        id="email"
                                        value={email}
                                        onChange={handleChange}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: 'none'
                                        }}
                                        required 
                                        placeholder="Enter your registered email"
                                    />
                                    <small className="form-text text-muted mt-2" style={{ display: 'block' }}>
                                        <i className="bi bi-info-circle me-1"></i> Enter your registered email address to receive a password reset link.
                                    </small>
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
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Sending...
                                        </span>
                                    ) : (
                                        <span>
                                            <i className="bi bi-envelope-fill me-2"></i>
                                            Send Reset Link
                                        </span>
                                    )}
                                </button>
                                
                                <div className="text-center">
                                    <Link to="/user-login" style={{ 
                                        color: '#4CAF50', 
                                        fontWeight: '500', 
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center'
                                    }}>
                                        <i className="bi bi-arrow-left me-2"></i>
                                        Back to Login
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

export default ForgotPassword;