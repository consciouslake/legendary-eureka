import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../../config';

function VerifyTeacherOtp() {
    const { teacher_id } = useParams();
    const navigate = useNavigate();
    const [otpData, setOtpData] = useState({
        otp_digit: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = 'Verify Teacher Account | Knoology LMS';
        
        // Redirect to login if already logged in
        const teacherLoginStatus = localStorage.getItem('teacherLoginStatus');
        if (teacherLoginStatus === 'true') {
            navigate('/teacher-dashboard');
        }
    }, [navigate]);

    // Handle input change
    const handleChange = (event) => {
        setOtpData({
            ...otpData,
            [event.target.name]: event.target.value
        });
        setErrorMsg('');
    };

    // Submit OTP verification
    const submitForm = async () => {
        if (!otpData.otp_digit) {
            setErrorMsg('Please enter the OTP code');
            return;
        }
        
        setLoading(true);

        try {
            const response = await axios.post(`${apiUrl}/verify-teacher-otp/${teacher_id}/`, otpData);
            
            if (response.data.status === 'success') {
                setSuccessMsg('Account verified successfully. Redirecting to login...');
                setTimeout(() => {
                    navigate('/teacher-login');
                }, 2000);
            } else {
                setErrorMsg(response.data.message || 'Verification failed');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMsg(error.response.data.message || 'Verification failed. Please try again.');
            } else {
                setErrorMsg('Network error. Please check your connection.');
            }
            console.error('Error verifying OTP:', error);
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const resendOtp = async () => {
        setIsResending(true);
        setErrorMsg('');
        setSuccessMsg('');
        
        try {
            const response = await axios.post(`${apiUrl}/resend-otp/`, {
                user_type: 'teacher',
                user_id: teacher_id
            });
            
            if (response.data.status === 'success') {
                setSuccessMsg('A new OTP has been sent to your email');
            } else {
                setErrorMsg(response.data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMsg(error.response.data.message || 'Failed to resend OTP. Please try again.');
            } else {
                setErrorMsg('Network error. Please check your connection.');
            }
            console.error('Error resending OTP:', error);
        } finally {
            setIsResending(false);
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
                            background: 'linear-gradient(135deg, #0072ff 0%, #00c6ff 100%)',
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
                                    <i className="bi bi-shield-check" style={{ fontSize: '2.5rem', color: 'white' }}></i>
                                </div>
                                <h2 style={{ color: 'white', fontWeight: '600', marginBottom: '10px' }}>Verify Account</h2>
                                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>Complete your registration by entering the OTP</p>
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
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Verification Error</h6>
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
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Success!</h6>
                                            <p className="mb-0">{successMsg}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="text-center mb-4" style={{
                                background: 'rgba(0, 114, 255, 0.05)',
                                padding: '20px',
                                borderRadius: '15px'
                            }}>
                                <i className="bi bi-envelope-check" style={{ fontSize: '2rem', color: '#0072ff', marginBottom: '15px' }}></i>
                                <p className="mb-0" style={{ color: '#495057' }}>
                                    A 6-digit OTP has been sent to your email.<br />
                                    Please enter it below to verify your account.
                                </p>
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="otp_digit" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                    <i className="bi bi-123 me-2" style={{ color: '#0072ff' }}></i>
                                    Enter 6-Digit OTP
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control form-control-lg text-center" 
                                    id="otp_digit" 
                                    name="otp_digit" 
                                    value={otpData.otp_digit} 
                                    onChange={handleChange} 
                                    maxLength="6" 
                                    placeholder="Enter your 6-digit OTP"
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: 'none',
                                        letterSpacing: '8px',
                                        fontSize: '1.5rem'
                                    }}
                                />
                            </div>
                            
                            <button 
                                type="button" 
                                onClick={submitForm} 
                                className="btn w-100 mb-3"
                                style={{
                                    background: 'linear-gradient(45deg, #0072ff, #00c6ff)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    padding: '0.75rem',
                                    fontWeight: '500',
                                    boxShadow: '0 4px 15px rgba(0, 114, 255, 0.2)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Verifying...
                                    </span>
                                ) : 'Verify Account'}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={resendOtp} 
                                className="btn w-100 mb-4"
                                style={{
                                    background: 'transparent',
                                    color: '#0072ff',
                                    border: '1px solid #0072ff',
                                    borderRadius: '50px',
                                    padding: '0.75rem',
                                    fontWeight: '500'
                                }}
                                disabled={isResending}
                            >
                                {isResending ? (
                                    <span>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Sending...
                                    </span>
                                ) : (
                                    <span>
                                        <i className="bi bi-arrow-clockwise me-2"></i>
                                        Resend OTP
                                    </span>
                                )}
                            </button>
                            
                            <div className="mt-4 pt-3 border-top text-center">
                                <Link to="/teacher-login" style={{ color: '#6c757d', fontSize: '0.9rem', textDecoration: 'none' }}>
                                    <i className="bi bi-arrow-left me-1"></i> Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyTeacherOtp;