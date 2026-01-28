import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import axios from 'axios';
import { apiUrl } from '../../config';

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
                        color: '#08AEEA',
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
                        background: "linear-gradient(45deg, rgba(42, 245, 152, 0.3), rgba(8, 174, 234, 0.3))"
                    }}></div>
                </div>
            </div>
            <p className="mt-3 text-muted">Processing your request...</p>
        </div>
    );
};

function ChangePassword() {
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
        window.scrollTo(0, 0);
        document.title = "Change Password | Knoology LMS";
        // Check if student is logged in
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) {
            navigate('/user-login');
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
            // Get student ID from localStorage
            const studentData = JSON.parse(localStorage.getItem('studentInfo'));
            const studentId = studentData?.studentId;

            if (!studentId) {
                setErrorMsg('Authentication error. Please login again.');
                navigate('/user-login');
                return;
            }

            // Send password change request
            const response = await axios.post(`${apiUrl}/student-change-password/${studentId}/`, {
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
                // Redirect after a delay
                setTimeout(() => {
                    navigate('/user-dashboard');
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
        <div className='container-fluid px-4' style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <Sidebar />
                </div>
                <div className='col-md-9'>
                    {/* Page Header */}
                    <div className="page-header" style={{
                        background: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
                        borderRadius: '20px',
                        padding: '25px',
                        marginBottom: '24px',
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
                                    background: 'linear-gradient(45deg, #FF4B2B, #FF416C)',
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
                                        Update your account security
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
                        marginBottom: '30px'
                    }}>
                        <div className="section-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 25px',
                            borderBottom: '1px solid #f0f0f0'
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
                                    Update Your Password
                                </h5>
                            </div>
                        </div>

                        <div className="section-body p-4">
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
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Success</h6>
                                            <p className="mb-0">{successMsg}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Password security tips */}
                            <div className="tips-section mb-4" style={{
                                background: 'rgba(255, 65, 108, 0.05)',
                                borderRadius: '10px',
                                padding: '15px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-70px',
                                    right: '-70px',
                                    width: '140px',
                                    height: '140px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 75, 43, 0.05)',
                                    zIndex: '0'
                                }}></div>

                                <div className="position-relative" style={{ zIndex: '1' }}>
                                    <h6 style={{ color: '#002254', fontWeight: '600', marginBottom: '10px' }}>
                                        <i className="bi bi-info-circle me-2" style={{ color: '#FF416C' }}></i>
                                        Password Security Tips
                                    </h6>
                                    <ul className="mb-0" style={{ color: '#506690', paddingLeft: '25px' }}>
                                        <li>Use at least 6 characters</li>
                                        <li>Include a mix of letters, numbers, and symbols</li>
                                        <li>Avoid using easily guessable information</li>
                                        <li>Use a unique password not used elsewhere</li>
                                    </ul>
                                </div>
                            </div>

                            {loading ? (
                                <Loader size="medium" />
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="currentPassword" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>
                                            Current Password
                                        </label>
                                        <div className="position-relative">
                                            <span className="position-absolute" style={{
                                                left: '15px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#8A94A6',
                                                zIndex: '1'
                                            }}>
                                                <i className="bi bi-lock"></i>
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="currentPassword"
                                                name="current_password"
                                                value={passwordData.current_password}
                                                onChange={handleChange}
                                                style={{
                                                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="newPassword" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>
                                            New Password
                                        </label>
                                        <div className="position-relative">
                                            <span className="position-absolute" style={{
                                                left: '15px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#8A94A6',
                                                zIndex: '1'
                                            }}>
                                                <i className="bi bi-shield"></i>
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="newPassword"
                                                name="new_password"
                                                value={passwordData.new_password}
                                                onChange={handleChange}
                                                style={{
                                                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                                minLength="6"
                                            />
                                        </div>
                                        <div className="form-text text-muted mt-1">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Password must be at least 6 characters long
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="confirmPassword" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>
                                            Confirm New Password
                                        </label>
                                        <div className="position-relative">
                                            <span className="position-absolute" style={{
                                                left: '15px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#8A94A6',
                                                zIndex: '1'
                                            }}>
                                                <i className="bi bi-check2-circle"></i>
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="confirmPassword"
                                                name="confirm_password"
                                                value={passwordData.confirm_password}
                                                onChange={handleChange}
                                                style={{
                                                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between">
                                        <button type="button" className="btn" onClick={() => navigate('/user-dashboard')}
                                            style={{
                                                background: '#f8f9fa',
                                                color: '#506690',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.75rem 1.5rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <i className="bi bi-arrow-left me-2"></i>
                                            Back to Dashboard
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn"
                                            style={{
                                                background: 'linear-gradient(45deg, #FF416C, #FF4B2B)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.75rem 2rem',
                                                fontWeight: '500',
                                                boxShadow: '0 5px 15px rgba(255, 65, 108, 0.2)'
                                            }}
                                        >
                                            <i className="bi bi-shield-check me-2"></i>
                                            Update Password
                                        </button>
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

export default ChangePassword;