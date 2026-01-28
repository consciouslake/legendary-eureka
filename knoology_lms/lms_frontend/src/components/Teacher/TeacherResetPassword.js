import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function TeacherResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [passwordData, setPasswordData] = useState({
        new_password: '',
        confirm_password: ''
    });
    const [status, setStatus] = useState({
        type: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
        setStatus({type: '', message: ''});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Form validation
        if (!passwordData.new_password) {
            setStatus({type: 'error', message: 'New password is required'});
            return;
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
            setStatus({type: 'error', message: 'New passwords do not match'});
            return;
        }
        if (passwordData.new_password.length < 6) {
            setStatus({type: 'error', message: 'New password must be at least 6 characters long'});
            return;
        }

        setLoading(true);
        setStatus({type: '', message: ''});

        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/teacher/reset-password/${token}/`, {
                new_password: passwordData.new_password
            });

            if (response.data.status === 'success') {
                setStatus({
                    type: 'success',
                    message: 'Password has been reset successfully!'
                });
                
                // Redirect to login after success
                setTimeout(() => {
                    navigate('/teacher-login');
                }, 3000);
            }
        } catch (error) {
            console.error('Error:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Invalid or expired token. Please request a new password reset link.'
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
                                    <i className="bi bi-unlock" style={{ fontSize: '2.5rem', color: 'white' }}></i>
                                </div>
                                <h2 style={{ color: 'white', fontWeight: '600', marginBottom: '10px' }}>Reset Password</h2>
                                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>Create a new secure password</p>
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
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>{status.type === 'success' ? 'Success!' : 'Error'}</h6>
                                            <p className="mb-0">{status.message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="new_password" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-shield-lock me-2" style={{ color: '#6a11cb' }}></i>
                                        New Password
                                    </label>
                                    <div className="input-group">
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            id="new_password"
                                            name="new_password"
                                            value={passwordData.new_password}
                                            onChange={handleChange}
                                            required 
                                            minLength="6"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 'none'
                                            }}
                                        />
                                    </div>
                                    <small className="form-text" style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                                        Password must be at least 6 characters long
                                    </small>
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="confirm_password" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-shield-check me-2" style={{ color: '#6a11cb' }}></i>
                                        Confirm Password
                                    </label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        id="confirm_password"
                                        name="confirm_password"
                                        value={passwordData.confirm_password}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: 'none'
                                        }}
                                    />
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="btn w-100 mb-4"
                                    disabled={loading}
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
                                >
                                    {loading ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Resetting...
                                        </span>
                                    ) : 'Reset Password'}
                                </button>
                                
                                <div className="mt-4 pt-3 border-top text-center">
                                    <Link to="/teacher-login" style={{ color: '#6c757d', fontSize: '0.9rem', textDecoration: 'none' }}>
                                        <i className="bi bi-arrow-left me-1"></i> Back to Login
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

export default TeacherResetPassword;