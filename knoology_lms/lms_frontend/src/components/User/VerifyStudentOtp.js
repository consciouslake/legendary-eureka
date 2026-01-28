import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../../config';

function VerifyStudentOtp() {
    const { student_id } = useParams();
    const navigate = useNavigate();
    const [otpData, setOtpData] = useState({
        otp_digit: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        document.title = 'Verify Student Account | Knoology LMS';
        
        // Redirect to dashboard if already logged in
        const studentLoginStatus = localStorage.getItem('studentLoginStatus');
        if (studentLoginStatus === 'true') {
            navigate('/user-dashboard');
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

        try {
            const response = await axios.post(`${apiUrl}/verify-student-otp/${student_id}/`, otpData);
            
            if (response.data.status === 'success') {
                setSuccessMsg('Account verified successfully. Redirecting to login...');
                setTimeout(() => {
                    navigate('/user-login');
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
        }
    };

    // Resend OTP
    const resendOtp = async () => {
        setIsResending(true);
        setErrorMsg('');
        setSuccessMsg('');
        
        try {
            const response = await axios.post(`${apiUrl}/resend-otp/`, {
                user_type: 'student',
                user_id: student_id
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
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <div className="card">
                        <h5 className="card-header">Verify Student Account</h5>
                        <div className="card-body">
                            {errorMsg && (
                                <div className="alert alert-danger" role="alert">
                                    {errorMsg}
                                </div>
                            )}
                            {successMsg && (
                                <div className="alert alert-success" role="alert">
                                    {successMsg}
                                </div>
                            )}
                            <p className="mb-4">
                                A 6-digit OTP has been sent to your email. Please enter it below to verify your account.
                            </p>
                            <div className="mb-3">
                                <label htmlFor="otp_digit" className="form-label">Enter 6-Digit OTP</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="otp_digit" 
                                    name="otp_digit" 
                                    value={otpData.otp_digit} 
                                    onChange={handleChange} 
                                    maxLength="6" 
                                    placeholder="Enter your 6-digit OTP"
                                />
                            </div>
                            <div className="d-grid gap-2">
                                <button 
                                    type="button" 
                                    onClick={submitForm} 
                                    className="btn btn-primary"
                                >
                                    Verify Account
                                </button>
                                <button 
                                    type="button" 
                                    onClick={resendOtp} 
                                    className="btn btn-outline-secondary" 
                                    disabled={isResending}
                                >
                                    {isResending ? 'Sending...' : 'Resend OTP'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyStudentOtp;