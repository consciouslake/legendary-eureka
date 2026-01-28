import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import axios from 'axios';

const BASE_API_URL = 'http://127.0.0.1:8000/api';

// Reusable loader component
const Loader = ({ size = "medium" }) => {
    const dimensions = {
        small: { width: "30px", height: "30px" },
        medium: { width: "40px", height: "40px" },
        large: { width: "60px", height: "60px" }
    };

    return (
        <div className="text-center py-4">
            <div className="position-relative" style={{ ...dimensions[size], margin: "0 auto" }}>
                <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
                    <div className="spinner-border" style={{
                        color: '#FF4B2B',
                        ...dimensions[size]
                    }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
                <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center animate__animated animate__pulse animate__infinite">
                    <div style={{
                        width: dimensions[size].width,
                        height: dimensions[size].height,
                        borderRadius: "50%",
                        background: "linear-gradient(45deg, rgba(255, 65, 108, 0.3), rgba(255, 75, 43, 0.3))"
                    }}></div>
                </div>
            </div>
            <p className="mt-3 text-muted">Processing request...</p>
        </div>
    );
};

function TeacherChangePassword() {
    const navigate = useNavigate();
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        document.title = "Change Password | Knoology LMS";
        // Check if teacher is logged in
        const teacherData = localStorage.getItem('teacherData');
        if (!teacherData) {
            navigate('/teacher-login');
            return;
        }
    }, [navigate]);

    const handleChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
        // Clear messages when user types
        setErrorMsg('');
        setSuccessMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Form validation
        if (!passwordData.current_password) {
            setErrorMsg('Current password is required');
            return;
        }
        if (!passwordData.new_password) {
            setErrorMsg('New password is required');
            return;
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
            setErrorMsg('New passwords do not match');
            return;
        }
        if (passwordData.new_password.length < 6) {
            setErrorMsg('New password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            // Get teacher ID from localStorage
            const teacherData = JSON.parse(localStorage.getItem('teacherData'));
            const teacherId = teacherData?.teacherId;

            if (!teacherId) {
                setErrorMsg('Authentication error. Please login again.');
                navigate('/teacher-login');
                return;
            }

            // Send password change request
            const response = await axios.post(`${BASE_API_URL}/teacher-change-password/${teacherId}/`, {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });

            if (response.data.status === 'success') {
                setSuccessMsg(response.data.message || 'Password changed successfully!');
                // Clear form
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
                // Optional: Redirect after a delay
                setTimeout(() => {
                    navigate('/teacher-dashboard');
                }, 2000);
            } else {
                setErrorMsg(response.data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Password change error:', error);
            if (error.response?.data?.message) {
                setErrorMsg(error.response.data.message);
            } else if (error.response?.status === 401) {
                setErrorMsg('Current password is incorrect');
            } else {
                setErrorMsg('Failed to change password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container-fluid pb-4 px-4' style={{ paddingTop: '120px' }}>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <TeacherSidebar />
                </div>
                <div className='col-md-9'>
                    {/* Page Header */}
                    <div className="page-header" style={{
                        background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
                        borderRadius: '20px',
                        padding: '15px 25px',
                        marginBottom: '15px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative elements */}
                        <div style={{
                            position: 'absolute',
                            top: '-30px',
                            right: '-30px',
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            zIndex: '0'
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            bottom: '-20px',
                            left: '10%',
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            zIndex: '0'
                        }}></div>

                        <div className="position-relative" style={{ zIndex: '1' }}>
                            <div className="d-flex align-items-center">
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(45deg, #FF416C, #FF4B2B)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(255, 65, 108, 0.3)'
                                }}>
                                    <i className="bi bi-shield-lock" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Change Password
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Update your account password
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="card-section" style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        marginBottom: '15px'
                    }}>
                        <div className="section-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 25px',
                            borderBottom: '1px solid #f0f0f0',
                            background: 'linear-gradient(135deg, rgba(255, 65, 108, 0.05), rgba(255, 75, 43, 0.05))'
                        }}>
                            <div className="d-flex align-items-center">
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, rgba(255, 65, 108, 0.1), rgba(255, 75, 43, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-key" style={{
                                        color: '#FF416C',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Password Security
                                </h5>
                            </div>
                        </div>

                        <div className="section-body p-4">
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
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Error</h6>
                                            <p className="mb-0">{errorMsg}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <Loader size="medium" />
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        {/* Password Components on Left */}
                                        <div className="col-md-7">
                                            <div className="mb-3">
                                                <label htmlFor="current_password" className="form-label" style={{ fontWeight: '500', color: '#506690', fontSize: '0.9rem' }}>Current Password</label>
                                                <div className="input-group">
                                                    <span className="input-group-text" style={{
                                                        background: 'linear-gradient(135deg, rgba(255, 65, 108, 0.1), rgba(255, 75, 43, 0.1))',
                                                        border: 'none',
                                                        borderRadius: '10px 0 0 10px',
                                                        padding: '0.5rem 0.75rem'
                                                    }}>
                                                        <i className="bi bi-unlock" style={{ color: '#FF416C' }}></i>
                                                    </span>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="current_password"
                                                        name="current_password"
                                                        value={passwordData.current_password}
                                                        onChange={handleChange}
                                                        style={{
                                                            padding: '0.5rem 0.75rem',
                                                            borderRadius: '0 10px 10px 0',
                                                            border: '1px solid #e2e8f0',
                                                            borderLeft: 'none',
                                                            boxShadow: 'none',
                                                            fontSize: '0.9rem'
                                                        }}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="new_password" className="form-label" style={{ fontWeight: '500', color: '#506690', fontSize: '0.9rem' }}>New Password</label>
                                                <div className="input-group">
                                                    <span className="input-group-text" style={{
                                                        background: 'linear-gradient(135deg, rgba(255, 65, 108, 0.1), rgba(255, 75, 43, 0.1))',
                                                        border: 'none',
                                                        borderRadius: '10px 0 0 10px',
                                                        padding: '0.5rem 0.75rem'
                                                    }}>
                                                        <i className="bi bi-lock" style={{ color: '#FF416C' }}></i>
                                                    </span>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="new_password"
                                                        name="new_password"
                                                        value={passwordData.new_password}
                                                        onChange={handleChange}
                                                        style={{
                                                            padding: '0.5rem 0.75rem',
                                                            borderRadius: '0 10px 10px 0',
                                                            border: '1px solid #e2e8f0',
                                                            borderLeft: 'none',
                                                            boxShadow: 'none',
                                                            fontSize: '0.9rem'
                                                        }}
                                                        required
                                                        minLength="6"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="confirm_password" className="form-label" style={{ fontWeight: '500', color: '#506690', fontSize: '0.9rem' }}>Confirm New Password</label>
                                                <div className="input-group">
                                                    <span className="input-group-text" style={{
                                                        background: 'linear-gradient(135deg, rgba(255, 65, 108, 0.1), rgba(255, 75, 43, 0.1))',
                                                        border: 'none',
                                                        borderRadius: '10px 0 0 10px',
                                                        padding: '0.5rem 0.75rem'
                                                    }}>
                                                        <i className="bi bi-check-lg" style={{ color: '#FF416C' }}></i>
                                                    </span>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="confirm_password"
                                                        name="confirm_password"
                                                        value={passwordData.confirm_password}
                                                        onChange={handleChange}
                                                        style={{
                                                            padding: '0.5rem 0.75rem',
                                                            borderRadius: '0 10px 10px 0',
                                                            border: '1px solid #e2e8f0',
                                                            borderLeft: 'none',
                                                            boxShadow: 'none',
                                                            fontSize: '0.9rem'
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                {passwordData.new_password && passwordData.confirm_password &&
                                                    passwordData.new_password !== passwordData.confirm_password && (
                                                        <div className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>
                                                            <i className="bi bi-exclamation-triangle me-1"></i>
                                                            Passwords don't match
                                                        </div>
                                                    )}
                                            </div>

                                            <div className="d-flex justify-content-between mt-4">
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    onClick={() => navigate('/teacher-dashboard')}
                                                    style={{
                                                        background: '#f8f9fa',
                                                        color: '#506690',
                                                        border: 'none',
                                                        borderRadius: '50px',
                                                        padding: '0.5rem 1rem',
                                                        fontWeight: '500',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    <i className="bi bi-arrow-left me-2"></i>
                                                    Back
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="btn"
                                                    style={{
                                                        background: 'linear-gradient(45deg, #FF416C, #FF4B2B)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50px',
                                                        padding: '0.5rem 1.5rem',
                                                        fontWeight: '500',
                                                        boxShadow: '0 5px 15px rgba(255, 65, 108, 0.2)',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    Update Password
                                                </button>
                                            </div>
                                        </div>

                                        {/* Requirements on Right */}
                                        <div className="col-md-5">
                                            <div className="form-section h-100" style={{
                                                background: 'rgba(255, 65, 108, 0.03)',
                                                padding: '1.5rem',
                                                borderRadius: '15px'
                                            }}>
                                                <h6 className="mb-3" style={{ color: '#002254', fontWeight: '600', fontSize: '0.95rem' }}>
                                                    <i className="bi bi-shield-lock-fill me-2" style={{ color: '#FF416C' }}></i>
                                                    Requirements:
                                                </h6>
                                                <ul className="mb-0 text-muted ps-3" style={{ fontSize: '0.85rem' }}>
                                                    <li className="mb-2">At least 6 characters long</li>
                                                    <li className="mb-2">Include a mix of letters, numbers, and special characters</li>
                                                    <li className="mb-2">Don't reuse previous passwords</li>
                                                    <li>Avoid easily guessable information</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherChangePassword;