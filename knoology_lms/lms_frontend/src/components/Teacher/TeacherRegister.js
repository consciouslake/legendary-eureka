import { Link, useNavigate } from "react-router-dom";
import React from 'react';
import { useEffect, useState } from 'react';
import axios from "axios";

const BASE_API_URL = 'http://127.0.0.1:8000/api/teacher/';

function TeacherRegister() {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        document.title = "Teacher Register | Knoology LMS";
    }, []);

    const [teacherData, setTeacherData] = useState({
        'full_name': '',
        'email': '',
        'mobile_number': '',
        'password': '',
        'qualification': '',
        'skills': '',
        'bio': '',
        'status': '',
    });

    // Change element value on change
    const handleChange = (event) => {
        setTeacherData({
            ...teacherData,
            [event.target.name]: event.target.value,
        });
        // Clear any error messages when user starts typing
        setErrorMsg("");
        setSuccessMsg("");
    }

    // Submit form data to API
    const submitForm = async (event) => {
        event.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setLoading(true);
        
        // Basic validation
        if (!teacherData.full_name || !teacherData.email || !teacherData.password) {
            setErrorMsg("Please fill in all required fields");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(BASE_API_URL, teacherData);
            if (response.data) {
                setSuccessMsg("Registration successful! Redirecting to verification page...");
                // Clear form
                setTeacherData({
                    'full_name': '',
                    'email': '',
                    'mobile_number': '',
                    'password': '',
                    'qualification': '',
                    'skills': '',
                    'bio': '',
                    'status': '',
                });
                // Redirect to OTP verification page after 2 seconds
                setTimeout(() => {
                    navigate(`/verify-teacher/${response.data.id || response.data.data?.id}`);
                }, 2000);
            }
        } catch (error) {
            if (error.response) {
                // Handle specific error responses
                if (error.response.status === 400) {
                    setErrorMsg("Invalid data. Please check your input.");
                    if (error.response.data) {
                        // Handle validation errors from backend
                        const errors = Object.entries(error.response.data)
                            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                            .join('\n');
                        setErrorMsg(errors);
                    }
                } else if (error.response.status === 409) {
                    setErrorMsg("Email or mobile number already exists");
                } else {
                    setErrorMsg("Registration failed. Please try again later.");
                }
            } else if (error.request) {
                setErrorMsg("Network error. Please check your connection.");
            } else {
                setErrorMsg("An unexpected error occurred. Please try again.");
            }
            console.error('Error registering teacher:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                    <div className="card border-0" style={{ 
                        borderRadius: '20px',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden'
                    }}>
                        {/* Header with gradient background */}
                        <div style={{
                            background: 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)',
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
                                <h2 style={{ color: 'white', fontWeight: '600', marginBottom: '10px' }}>Teacher Registration</h2>
                                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>Join our platform as an educator</p>
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
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Registration Error</h6>
                                            <div style={{ whiteSpace: 'pre-line' }}>{errorMsg}</div>
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
                                <div className="row">
                                    <div className="col-md-6 mb-4">
                                        <label htmlFor="full_name" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                            <i className="bi bi-person me-2" style={{ color: '#8e44ad' }}></i>
                                            Full Name
                                        </label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="full_name"
                                            name="full_name"
                                            value={teacherData.full_name}
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
                                    
                                    <div className="col-md-6 mb-4">
                                        <label htmlFor="email" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                            <i className="bi bi-envelope me-2" style={{ color: '#8e44ad' }}></i>
                                            Email Address
                                        </label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            id="email"
                                            name="email"
                                            value={teacherData.email}
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
                                </div>
                                
                                <div className="row">
                                    <div className="col-md-6 mb-4">
                                        <label htmlFor="mobile_number" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                            <i className="bi bi-phone me-2" style={{ color: '#8e44ad' }}></i>
                                            Mobile Number
                                        </label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="mobile_number"
                                            name="mobile_number"
                                            value={teacherData.mobile_number}
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
                                    
                                    <div className="col-md-6 mb-4">
                                        <label htmlFor="password" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                            <i className="bi bi-key me-2" style={{ color: '#8e44ad' }}></i>
                                            Password
                                        </label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            id="password"
                                            name="password"
                                            value={teacherData.password}
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
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="qualification" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-mortarboard me-2" style={{ color: '#8e44ad' }}></i>
                                        Qualification
                                    </label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        id="qualification"
                                        name="qualification"
                                        value={teacherData.qualification}
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
                                    <label htmlFor="skills" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-stars me-2" style={{ color: '#8e44ad' }}></i>
                                        Skills
                                    </label>
                                    <textarea 
                                        className="form-control" 
                                        id="skills"
                                        name="skills"
                                        value={teacherData.skills}
                                        onChange={handleChange}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: 'none'
                                        }}
                                        required
                                    ></textarea>
                                    <div className="form-text" style={{ color: '#6c757d', fontSize: '0.875rem' }}>
                                        Please enter your skills (e.g., Finance, Business)
                                </div>
                                </div>
                                
                                <div className="mb-4">
                                    <label htmlFor="bio" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                        <i className="bi bi-file-earmark-text me-2" style={{ color: '#8e44ad' }}></i>
                                        Bio
                                    </label>
                                    <textarea 
                                        className="form-control" 
                                        id="bio"
                                        name="bio"
                                        value={teacherData.bio}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Tell us about yourself..."
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: '10px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: 'none'
                                        }}
                                    ></textarea>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="btn w-100 mb-4"
                                    style={{
                                        background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        padding: '0.75rem',
                                        fontWeight: '500',
                                        boxShadow: '0 4px 15px rgba(142, 68, 173, 0.2)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        marginTop: '15px'
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Registering...
                                        </span>
                                    ) : 'Complete Registration'}
                                </button>
                                
                                <div className="text-center">
                                    <p className="mb-0" style={{ color: '#6c757d' }}>
                                        Already have an account? {' '}
                                        <Link to="/teacher-login" style={{ color: '#8e44ad', fontWeight: '500', textDecoration: 'none' }}>
                                            Login Now
                                        </Link>
                                    </p>
                                </div>
                                
                                <div className="mt-4 pt-3 border-top text-center">
                                    <Link to="/" style={{ color: '#6c757d', fontSize: '0.9rem', textDecoration: 'none' }}>
                                        <i className="bi bi-house-door me-1"></i> Back to Home
                                    </Link>
                                    <span className="mx-2 text-muted">|</span>
                                    <Link to="/user-register" style={{ color: '#6c757d', fontSize: '0.9rem', textDecoration: 'none' }}>
                                        <i className="bi bi-mortarboard me-1"></i> Register as Student
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

export default TeacherRegister;