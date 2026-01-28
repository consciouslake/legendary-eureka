import React, { useState, useEffect } from 'react';
import TeacherSidebar from './TeacherSidebar';
import axios from 'axios';

const baseUrl = 'http://127.0.0.1:8000/api';

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
            <p className="mt-3 text-muted">Loading profile information...</p>
        </div>
    );
};

function TeacherProfileSetting() {
    const [teacherData, setTeacherData] = useState({
        full_name: '',
        email: '',
        profile_img: '',
        password: '',
        qualification: '',
        mobile_number: '',  // Changed from mobile_no to mobile_number
        skills: '',
        status: '', // To handle success/error messages
        loading: true
    });

    // Correctly retrieve teacherId from localStorage
    let teacherId = null;
    const storedTeacherData = localStorage.getItem('teacherData');
    if (storedTeacherData) {
        try {
            const parsedData = JSON.parse(storedTeacherData);
            teacherId = parsedData.teacherId; // Access the teacherId property
        } catch (e) {
            console.error("Error parsing teacher data from localStorage:", e);
            // Handle error, maybe redirect to login or show an error message
        }
    }

    // Fetch current teacher data
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Teacher Profile Settings | Knoology LMS";

        if (teacherId) {
            axios.get(`${baseUrl}/teacher/${teacherId}/`)
                .then((res) => {
                    setTeacherData({
                        full_name: res.data.full_name || '', // Ensure string
                        email: res.data.email || '',       // Ensure string
                        profile_img: res.data.profile_img, // Keep original image URL for display
                        prev_img: res.data.profile_img, // Store previous image URL
                        qualification: res.data.qualification || '', // Ensure string
                        mobile_number: res.data.mobile_number || '',  // Changed from mobile_no to mobile_number
                        skills: res.data.skills || '',             // Ensure string
                        password: '', // Don't fetch password
                        status: '',
                        loading: false
                    });
                })
                .catch((error) => {
                    console.error("Error fetching teacher data:", error);
                    setTeacherData(prevState => ({ ...prevState, status: 'error', loading: false }));
                });
        } else {
            console.log('No teacherId found in localStorage or failed to parse.'); // Updated log
            setTeacherData(prevState => ({ ...prevState, loading: false }));
            // Optionally redirect to login or show an error message
        }
    }, [teacherId]); // Dependency array remains the same

    // Handle input change
    const handleChange = (event) => {
        setTeacherData({
            ...teacherData,
            [event.target.name]: event.target.value
        });
    };

    // Handle file change
    const handleFileChange = (event) => {
        if (event.target.files[0]) {
            const file = event.target.files[0];
            setTeacherData({
                ...teacherData,
                [event.target.name]: file,
                temp_preview: URL.createObjectURL(file)
            });
        }
    };

    // Handle image deletion
    const handleDeleteImage = async () => {
        try {
            const response = await axios.patch(`${baseUrl}/teacher/${teacherId}/`, {
                remove_profile_img: true
            });
            if (response.status === 200) {
                setTeacherData(prevState => ({
                    ...prevState,
                    status: 'success',
                    prev_img: null,
                    temp_preview: null,
                    profile_img: null
                }));
            }
        } catch (error) {
            console.error('Error deleting profile image:', error);
            setTeacherData(prevState => ({ ...prevState, status: 'error' }));
        }
    };

    // Submit form
    const submitForm = (event) => {
        event.preventDefault();

        const teacherFormData = new FormData();
        teacherFormData.append("full_name", teacherData.full_name);
        teacherFormData.append("email", teacherData.email);
        // Only append profile_img if a new file was selected
        if (teacherData.profile_img instanceof File) {
            teacherFormData.append('profile_img', teacherData.profile_img, teacherData.profile_img.name);
        }
        if (teacherData.password) { // Only send password if user entered a new one
            teacherFormData.append("password", teacherData.password);
        }
        teacherFormData.append("qualification", teacherData.qualification);
        teacherFormData.append("mobile_number", teacherData.mobile_number);  // Changed from mobile_no to mobile_number
        teacherFormData.append("skills", teacherData.skills);

        // Ensure teacherId is available for the PUT request as well
        if (!teacherId) {
            console.error("Cannot update profile without teacherId");
            setTeacherData(prevState => ({ ...prevState, status: 'error' }));
            return; // Prevent submission if ID is missing
        }

        axios.put(`${baseUrl}/teacher/${teacherId}/`, teacherFormData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then((response) => {
                if (response.status === 200) {
                    // Update profile_img state only if a new image was uploaded and successfully saved
                    if (teacherData.profile_img instanceof File) {
                        setTeacherData(prevState => ({ ...prevState, prev_img: response.data.profile_img, password: '', status: 'success' }));
                    } else {
                        setTeacherData(prevState => ({ ...prevState, password: '', status: 'success' }));
                    }
                    // Scroll to top to show success message
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    setTeacherData(prevState => ({ ...prevState, status: 'error' }));
                }
            })
            .catch((error) => {
                console.error("Error updating teacher data:", error);
                setTeacherData(prevState => ({ ...prevState, status: 'error' }));
            });
    };

    if (teacherData.loading) {
        return (
            <div className='container-fluid pb-4 px-4' style={{ paddingTop: '120px' }}>
                <div className='row g-4'>
                    <div className='col-md-3'>
                        <TeacherSidebar />
                    </div>
                    <div className='col-md-9'>
                        <Loader size="medium" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='container-fluid pb-4 px-4' style={{ paddingTop: '120px' }}>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <TeacherSidebar />
                </div>
                <div className='col-md-9'>
                    {/* Page Header */}
                    <div className="page-header" style={{
                        background: 'linear-gradient(135deg, #2AF598 0%, #08AEEA 100%)',
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
                                    background: 'linear-gradient(45deg, #08AEEA, #2AF598)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(8, 174, 234, 0.3)'
                                }}>
                                    <i className="bi bi-person-gear" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Profile Settings
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Manage your instructor information
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Picture Section (if available) */}
                    {(teacherData.prev_img || teacherData.temp_preview) && (
                        <div className="mb-4 p-0" style={{
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                            overflow: 'hidden'
                        }}>
                            <div className="p-3" style={{
                                background: 'linear-gradient(135deg, rgba(42, 245, 152, 0.05), rgba(8, 174, 234, 0.05))',
                                borderBottom: '1px solid #f0f0f0'
                            }}>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    <i className="bi bi-person-badge me-2"></i>
                                    {teacherData.temp_preview ? 'Profile Photo Preview' : 'Current Profile Photo'}
                                </h5>
                            </div>

                            <div className="d-flex align-items-center p-4">
                                <div className="me-4 position-relative">
                                    <img
                                        src={teacherData.temp_preview || teacherData.prev_img}
                                        alt="Profile"
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '4px solid white',
                                            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
                                        }}
                                    />

                                    {teacherData.temp_preview && (
                                        <div className="position-absolute" style={{
                                            top: '-10px',
                                            right: '-10px',
                                            background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                            color: 'white',
                                            width: '25px',
                                            height: '25px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 3px 10px rgba(8, 174, 234, 0.3)',
                                            fontSize: '0.8rem'
                                        }}>
                                            <i className="bi bi-check"></i>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h5 style={{ fontWeight: '600', color: '#002254', marginBottom: '10px' }}>
                                        {teacherData.temp_preview ? 'New Photo Selected' : 'Your Profile Photo'}
                                    </h5>
                                    <p className="text-muted mb-3">
                                        {teacherData.temp_preview
                                            ? 'This is how your new profile photo will look. Save changes to apply.'
                                            : 'A professional profile photo helps students recognize their instructor.'}
                                    </p>
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={handleDeleteImage}
                                        style={{
                                            background: 'linear-gradient(45deg, #FF416C, #FF4B2B)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '0.5rem 1.5rem',
                                            fontWeight: '500',
                                            boxShadow: '0 5px 15px rgba(255, 65, 108, 0.2)'
                                        }}
                                    >
                                        <i className="bi bi-trash me-2"></i>
                                        Remove Picture
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
                                    background: 'linear-gradient(135deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-pencil-square" style={{
                                        color: '#08AEEA',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Edit Your Profile
                                </h5>
                            </div>
                        </div>

                        <div className="section-body p-4">
                            {teacherData.status === 'success' && (
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
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Profile Updated Successfully!</h6>
                                            <p className="mb-0">Your profile information has been successfully updated.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {teacherData.status === 'error' && (
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
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Update Failed</h6>
                                            <p className="mb-0">Something went wrong. Please try again later.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submitForm}>
                                <div className="form-section mb-4" style={{ background: 'rgba(42, 245, 152, 0.03)', padding: '20px', borderRadius: '15px' }}>
                                    <h6 className="mb-3" style={{ color: '#002254', fontWeight: '600' }}>Basic Information</h6>

                                    <div className="mb-3">
                                        <label htmlFor="full_name" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Full Name</label>
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
                                                boxShadow: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={teacherData.email}
                                            onChange={handleChange}
                                            readOnly
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 'none',
                                                background: '#f8f9fa'
                                            }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-section mb-4" style={{ background: 'rgba(8, 174, 234, 0.03)', padding: '20px', borderRadius: '15px' }}>
                                    <h6 className="mb-3" style={{ color: '#002254', fontWeight: '600' }}>Security</h6>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={teacherData.password}
                                            onChange={handleChange}
                                            placeholder="Enter new password (leave empty to keep current)"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 'none'
                                            }}
                                        />
                                        <div className="form-text text-muted">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Leave blank to keep your current password
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section mb-4" style={{ background: 'rgba(42, 245, 152, 0.03)', padding: '20px', borderRadius: '15px' }}>
                                    <h6 className="mb-3" style={{ color: '#002254', fontWeight: '600' }}>Professional Details</h6>

                                    <div className="mb-3">
                                        <label htmlFor="qualification" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Qualification</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="qualification"
                                            name="qualification"
                                            value={teacherData.qualification}
                                            onChange={handleChange}
                                            placeholder="e.g. BSc in Computer Science, MBA"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 'none'
                                            }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="mobile_number" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Mobile Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="mobile_number"
                                            name="mobile_number"
                                            value={teacherData.mobile_number}
                                            onChange={handleChange}
                                            placeholder="e.g. 123-456-7890"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 'none'
                                            }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="skills" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Skills & Expertise</label>
                                        <textarea
                                            className="form-control"
                                            id="skills"
                                            name="skills"
                                            value={teacherData.skills}
                                            onChange={handleChange}
                                            placeholder="e.g. Python, Machine Learning, Web Development"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 'none',
                                                minHeight: '100px'
                                            }}
                                        ></textarea>
                                        <div className="form-text text-muted">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Separate skills with commas
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section mb-4" style={{ background: 'rgba(8, 174, 234, 0.03)', padding: '20px', borderRadius: '15px' }}>
                                    <h6 className="mb-3" style={{ color: '#002254', fontWeight: '600' }}>Profile Picture</h6>

                                    <div className="mb-3">
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="me-3">
                                                <div style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    borderRadius: '10px',
                                                    background: 'linear-gradient(135deg, rgba(8, 174, 234, 0.1), rgba(42, 245, 152, 0.1))',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <i className="bi bi-camera" style={{ color: '#08AEEA', fontSize: '1.2rem' }}></i>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="profile_img" className="form-label mb-1" style={{ fontWeight: '500', color: '#002254' }}>
                                                    Upload New Profile Photo
                                                </label>
                                                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                                                    Choose a professional photo to represent yourself to students
                                                </p>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="profile_img"
                                            name="profile_img"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 'none'
                                            }}
                                        />
                                        <div className="form-text text-muted">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Upload a square image (1:1 ratio) for best results. Max size 2MB.
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between mt-4">
                                    <button type="button" className="btn" onClick={() => window.history.back()}
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
                                        Back
                                    </button>

                                    <button type="submit" className="btn"
                                        style={{
                                            background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '0.75rem 2rem',
                                            fontWeight: '500',
                                            boxShadow: '0 5px 15px rgba(8, 174, 234, 0.2)'
                                        }}
                                    >
                                        <i className="bi bi-check-circle me-2"></i>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherProfileSetting;