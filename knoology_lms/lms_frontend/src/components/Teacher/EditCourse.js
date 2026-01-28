import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import TeacherSidebar from './TeacherSidebar';

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
                        color: '#36b9cc',
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
                        background: "linear-gradient(45deg, rgba(54, 185, 204, 0.3), rgba(47, 206, 178, 0.3))"
                    }}></div>
                </div>
            </div>
            <p className="mt-3 text-muted">Loading...</p>
        </div>
    );
};

function EditCourse() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        featured_img: null,
        technologies: ''
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({
        type: '',
        message: ''
    });

    // Category Creation State
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCatData, setNewCatData] = useState({
        title: '',
        description: ''
    });
    const [catLoading, setCatLoading] = useState(false);

    useEffect(() => {
        document.title = "Edit Course | Knoology LMS";
        setLoading(true);

        // Fetch course data
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`${BASE_API_URL}/course/${courseId}`);
                setCourseData({
                    title: response.data.title,
                    description: response.data.description,
                    category: response.data.category,
                    price: response.data.price,
                    technologies: response.data.technologies || '',
                    featured_img: response.data.featured_img
                });
            } catch (error) {
                console.error('Error fetching course:', error);
                setStatus({
                    type: 'error',
                    message: 'Failed to load course data'
                });
            }
        };

        // Fetch categories
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${BASE_API_URL}/category/`);
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setStatus({
                    type: 'error',
                    message: 'Failed to load categories'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
        fetchCategories();
    }, [courseId]);

    const handleChange = (e) => {
        if (e.target.name === 'category' && e.target.value === 'new') {
            setShowCategoryModal(true);
            return;
        }

        setCourseData({
            ...courseData,
            [e.target.name]: e.target.value
        });
    };

    const handleNewCatChange = (e) => {
        setNewCatData({
            ...newCatData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateCategory = async () => {
        if (!newCatData.title || !newCatData.description) {
            setStatus({
                type: 'error',
                message: 'Please fill in all category fields'
            });
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
                setCategories(catsRes.data);

                // Select the new category
                setCourseData({
                    ...courseData,
                    category: response.data.id
                });

                // Close modal and reset
                setShowCategoryModal(false);
                setNewCatData({ title: '', description: '' });
                setStatus({
                    type: 'success',
                    message: 'Category created successfully!'
                });
            }
        } catch (error) {
            console.error('Error creating category:', error);
            setStatus({
                type: 'error',
                message: 'Failed to create category'
            });
        } finally {
            setCatLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setCourseData({
            ...courseData,
            featured_img: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        const formData = new FormData();
        formData.append('title', courseData.title);
        formData.append('description', courseData.description);
        formData.append('category', courseData.category);
        formData.append('price', courseData.price);
        formData.append('technologies', courseData.technologies);
        if (courseData.featured_img && courseData.featured_img instanceof File) {
            formData.append('featured_img', courseData.featured_img);
        }

        try {
            await axios.put(`${BASE_API_URL}/course/${courseId}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setStatus({
                type: 'success',
                message: 'Course updated successfully!'
            });
            setTimeout(() => {
                navigate('/teacher-courses');
            }, 1500);
        } catch (error) {
            console.error('Error updating course:', error);
            setStatus({
                type: 'error',
                message: 'Failed to update course. Please try again.'
            });
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
                        background: 'linear-gradient(135deg, #36b9cc 0%, #2fceb2 100%)',
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
                                    background: 'linear-gradient(45deg, #36b9cc, #2fceb2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(54, 185, 204, 0.3)'
                                }}>
                                    <i className="bi bi-pencil-square" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Edit Course
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        Update course details and content
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
                                    background: 'linear-gradient(135deg, rgba(54, 185, 204, 0.1), rgba(47, 206, 178, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-file-earmark-text" style={{
                                        color: '#36b9cc',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Course Information
                                </h5>
                            </div>
                        </div>

                        <div className="section-body p-4">
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
                                                {status.type === 'success' ? 'Success' : 'Error'}
                                            </h6>
                                            <p className="mb-0">{status.message}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <Loader />
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-section mb-4" style={{
                                        background: 'rgba(54, 185, 204, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <h6 className="mb-3" style={{ color: '#506690', fontWeight: '600' }}>Basic Information</h6>
                                        <div className="mb-3">
                                            <label htmlFor="title" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Course Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="title"
                                                name="title"
                                                value={courseData.title}
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
                                        <div className="mb-3">
                                            <label htmlFor="price" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Course Price (₹)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="price"
                                                name="price"
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
                                        <div className="mb-3">
                                            <label htmlFor="description" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Description</label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                name="description"
                                                value={courseData.description}
                                                onChange={handleChange}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                rows="5"
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="category" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Category</label>
                                            <select
                                                className="form-select"
                                                id="category"
                                                name="category"
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
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.title}
                                                    </option>
                                                ))}
                                                <option value="new" style={{ fontWeight: 'bold', color: '#08AEEA' }}>+ Create New Category</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-section mb-4" style={{
                                        background: 'rgba(47, 206, 178, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <h6 className="mb-3" style={{ color: '#506690', fontWeight: '600' }}>Additional Details</h6>
                                        <div className="mb-3">
                                            <label htmlFor="technologies" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Technologies</label>
                                            <textarea
                                                className="form-control"
                                                id="technologies"
                                                name="technologies"
                                                value={courseData.technologies}
                                                onChange={handleChange}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                rows="3"
                                                placeholder="Enter technologies separated by commas (e.g., Programming, Business, Design)"
                                            ></textarea>
                                            <div className="form-text">Separate technologies with commas (e.g., Python, JavaScript, React)</div>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="featured_img" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Featured Image</label>
                                            {courseData.featured_img && (
                                                <div className="mb-3">
                                                    <div style={{
                                                        maxWidth: '200px',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                                    }}>
                                                        <img
                                                            src={typeof courseData.featured_img === 'string' ? courseData.featured_img : URL.createObjectURL(courseData.featured_img)}
                                                            alt="Course thumbnail"
                                                            className="img-fluid"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                className="form-control"
                                                id="featured_img"
                                                name="featured_img"
                                                onChange={handleFileChange}
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                accept="image/*"
                                            />
                                            <div className="form-text">Recommended size: 1200x800 pixels. Max size: 2MB</div>
                                        </div>
                                    </div>

                                    <div className="d-flex mt-4 gap-3">
                                        <button
                                            type="submit"
                                            className="btn"
                                            style={{
                                                background: 'linear-gradient(45deg, #36b9cc, #2fceb2)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.75rem 2rem',
                                                fontWeight: '500',
                                                boxShadow: '0 5px 15px rgba(54, 185, 204, 0.2)'
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check2-circle me-2"></i>
                                                    Update Course
                                                </>
                                            )}
                                        </button>

                                        <Link
                                            to="/teacher-courses"
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
                                            Cancel
                                        </Link>
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
        </div>
    );
}

export default EditCourse;