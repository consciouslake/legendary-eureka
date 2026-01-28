import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
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
            const response = await axios.post(`http://127.0.0.1:8000/api/student/reset-password/${token}/`, {
                new_password: passwordData.new_password
            });

            if (response.data.status === 'success') {
                setStatus({
                    type: 'success',
                    message: 'Password has been reset successfully!'
                });
                
                // Redirect to login after success
                setTimeout(() => {
                    navigate('/user-login');
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
        <div className="container mt-4">
            <div className="row">
                <div className="col-6 offset-3">
                    <div className="card">
                        <h5 className="card-header">Reset Password - Student</h5>
                        <div className="card-body">
                            {status.message && (
                                <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                    {status.message}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="new_password" className="form-label">New Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        id="new_password"
                                        name="new_password"
                                        value={passwordData.new_password}
                                        onChange={handleChange}
                                        required 
                                        minLength="6"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        id="confirm_password"
                                        name="confirm_password"
                                        value={passwordData.confirm_password}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                                <div className="mt-3">
                                    <Link to="/user-login">Back to Login</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;