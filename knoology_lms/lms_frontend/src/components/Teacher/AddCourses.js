import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import TeacherSidebar from './TeacherSidebar';
import { useState, useEffect } from 'react';
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

function AddCourses() {
    const navigate = useNavigate();
    const [cats, setCats] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [courseData, setCourseData] = useState({
        category: '',
        title: '',
        description: '',
        price: '',
        featured_img: null,
        technologies: ''
    });

    // Category Creation State
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCatData, setNewCatData] = useState({
        title: '',
        description: ''
    });
    const [catLoading, setCatLoading] = useState(false);

    useEffect(() => {
        document.title = "Add Course | Knoology LMS";

        // Check if teacher is logged in
        const teacherData = localStorage.getItem('teacherData');
        if (!teacherData) {
            navigate('/teacher-login');
            return;
        }

        // Fetch categories
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get(BASE_API_URL + '/category/');
                if (response.data) {
                    setCats(response.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                setErrorMsg('Failed to load categories. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [navigate]);

    const handleChange = (e) => {
        if (e.target.name === 'category' && e.target.value === 'new') {
            setShowCategoryModal(true);
            return;
        }

        setCourseData({
            ...courseData,
            [e.target.name]: e.target.value
        });
        // Clear any error messages when user starts typing
        setErrorMsg("");
        setSuccessMsg("");
    };

    const handleNewCatChange = (e) => {
        setNewCatData({
            ...newCatData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateCategory = async () => {
        if (!newCatData.title || !newCatData.description) {
            setErrorMsg("Please fill in all category fields");
            return;
        }

        try {
            setCatLoading(true);
            const formData = new FormData();
            formData.append('title', newCatData.title);
            formData.append('description', newCatData.description);

            const response = await axios.post(`${BASE_API_URL}/category/`, formData);

            if (response.status === 201 || response.status === 200) {
                // Refresh categories
                const catsRes = await axios.get(`${BASE_API_URL}/category/`);
                setCats(catsRes.data);

                // Select the new category
                setCourseData({
                    ...courseData,
                    category: response.data.id
                });

                // Close modal and reset
                setShowCategoryModal(false);
                setNewCatData({ title: '', description: '' });
                setSuccessMsg("Category created successfully!");
            }
        } catch (error) {
            console.error('Error creating category:', error);
            setErrorMsg("Failed to create category");
        } finally {
            setCatLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                setErrorMsg("Image size should not exceed 2MB");
                e.target.value = '';
                return;
            }
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrorMsg("Please select an image file");
                e.target.value = '';
                return;
            }
            setCourseData({
                ...courseData,
                featured_img: file
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setLoading(true);

        // Get teacher data from localStorage
        const teacherData = JSON.parse(localStorage.getItem('teacherData'));
        if (!teacherData?.teacherId) {
            setErrorMsg('Teacher authentication required');
            navigate('/teacher-login');
            return;
        }

        const formData = new FormData();
        // Convert category to a number to ensure it's correctly processed by the API
        if (courseData.category) {
            formData.append('category', parseInt(courseData.category, 10));
        } else {
            setErrorMsg('Please select a category');
            setLoading(false);
            return;
        }

        formData.append('title', courseData.title);
        formData.append('description', courseData.description);
        formData.append('price', courseData.price);
        if (courseData.featured_img) {
            formData.append('featured_img', courseData.featured_img);
        }
        formData.append('technologies', courseData.technologies);
        formData.append('teacher', teacherData.teacherId);

        try {
            const response = await axios.post(BASE_API_URL + '/course/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccessMsg("Course added successfully!");
            // Reset form
            setCourseData({
                category: '',
                title: '',
                description: '',
                featured_img: null,
                technologies: ''
            });
            // Clear file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate('/teacher-courses');
            }, 2000);

        } catch (error) {
            console.error('Error adding course:', error);
            // Handle error
            if (error.response?.data?.message) {
                setErrorMsg(error.response.data.message);
            } else if (error.response?.data) {
                // Create a formatted error message from all fields
                const errorMessages = [];
                Object.entries(error.response.data).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        errorMessages.push(`${key}: ${value.join(', ')}`);
                    } else {
                        errorMessages.push(`${key}: ${value}`);
                    }
                });
                setErrorMsg(errorMessages.join('\n'));
            } else {
                setErrorMsg('Failed to add course. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container-fluid pb-4 px-4' style={{ paddingTop: '100px' }}>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <TeacherSidebar />
                </div>
                <div className='col-md-9'>
                    {/* Page Header */}
                    <div className="page-header" style={{
                        background: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
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
                                    background: 'linear-gradient(45deg, #fc4a1a, #f7b733)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(252, 74, 26, 0.3)'
                                }}>
                                    <i className="bi bi-journal-plus" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Add New Course
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Create and publish your educational content
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
                                    background: 'linear-gradient(135deg, rgba(252, 74, 26, 0.1), rgba(247, 183, 51, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-pencil-square" style={{
                                        color: '#fc4a1a',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Course Details
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
                                            <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{errorMsg}</p>
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

                            {loading && !successMsg ? (
                                <Loader size="medium" />
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-section mb-4" style={{
                                        background: 'rgba(252, 74, 26, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <div className="mb-3">
                                            <label htmlFor="category" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Course Category</label>
                                            <select
                                                name="category"
                                                className='form-select'
                                                id="category"
                                                value={courseData.category}
                                                onChange={handleChange}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                            >
                                                <option value="">Select a category</option>
                                                {cats.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.title}
                                                    </option>
                                                ))}
                                                <option value="new" style={{ fontWeight: 'bold', color: '#08AEEA' }}>+ Create New Category</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="title" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Course Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                id="title"
                                                value={courseData.title}
                                                onChange={handleChange}
                                                placeholder="Enter course title (min 3 characters)"
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                                minLength="3"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="price" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Course Price (₹)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="price"
                                                id="price"
                                                value={courseData.price}
                                                onChange={handleChange}
                                                placeholder="Enter course price (0 for free)"
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-section mb-4" style={{
                                        background: 'rgba(247, 183, 51, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <div className="mb-3">
                                            <label htmlFor="description" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Course Description</label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                id="description"
                                                value={courseData.description}
                                                onChange={handleChange}
                                                rows="5"
                                                placeholder="Enter course description (min 10 characters)"
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                                minLength="10"
                                            ></textarea>
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="featured_img" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Featured Image (Max 2MB)</label>
                                            <div className="input-group">
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    name="featured_img"
                                                    id="featured_img"
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    style={{
                                                        padding: '0.75rem 1rem',
                                                        borderRadius: '10px',
                                                        border: '1px solid #e2e8f0',
                                                        boxShadow: 'none'
                                                    }}
                                                    required
                                                />
                                            </div>
                                            <div className="form-text text-muted">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Choose an attractive image that represents your course content
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="technologies" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Technologies & Skills</label>
                                            <textarea
                                                className="form-control"
                                                name="technologies"
                                                id="technologies"
                                                value={courseData.technologies}
                                                onChange={handleChange}
                                                rows="2"
                                                placeholder="Enter technologies used (comma-separated)"
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                            ></textarea>
                                            <div className="form-text text-muted">
                                                <i className="bi bi-info-circle me-1"></i>
                                                List the technologies, tools, or skills students will learn (e.g., JavaScript, React, Data Analysis)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between mt-4">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/teacher-courses')}
                                            className="btn"
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
                                            Back to Courses
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn"
                                            disabled={loading}
                                            style={{
                                                background: 'linear-gradient(45deg, #fc4a1a, #f7b733)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.75rem 2rem',
                                                fontWeight: '500',
                                                boxShadow: '0 5px 15px rgba(252, 74, 26, 0.2)'
                                            }}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Create Course
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Category Creation Modal */}
            {showCategoryModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                            <div className="modal-header" style={{ borderBottom: '1px solid #f0f0f0', padding: '20px 25px' }}>
                                <h5 className="modal-title" style={{ fontWeight: '600', color: '#002254' }}>Create New Category</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
                            </div>
                            <div className="modal-body" style={{ padding: '25px' }}>
                                <div className="mb-3">
                                    <label className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Category Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="title"
                                        value={newCatData.title}
                                        onChange={handleNewCatChange}
                                        placeholder="e.g. Web Development"
                                        style={{ borderRadius: '10px', padding: '10px 15px' }}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={newCatData.description}
                                        onChange={handleNewCatChange}
                                        rows="3"
                                        placeholder="Short description of the category..."
                                        style={{ borderRadius: '10px', padding: '10px 15px' }}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: 'none', padding: '0 25px 25px' }}>
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => setShowCategoryModal(false)}
                                    style={{ borderRadius: '50px', padding: '8px 20px', fontWeight: '500' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleCreateCategory}
                                    disabled={catLoading}
                                    style={{
                                        borderRadius: '50px',
                                        padding: '8px 25px',
                                        fontWeight: '500',
                                        background: 'linear-gradient(45deg, #08AEEA, #2AF598)',
                                        border: 'none'
                                    }}
                                >
                                    {catLoading ? 'Creating...' : 'Create Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

export default AddCourses;