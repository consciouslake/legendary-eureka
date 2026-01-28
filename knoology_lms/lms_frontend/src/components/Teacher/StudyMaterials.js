// filepath: c:\knoology_lms\knoology_lms\lms_frontend\src\components\Teacher\StudyMaterials.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import axios from 'axios';
import Swal from 'sweetalert2';

const BASE_API_URL = 'http://127.0.0.1:8000/api';

// Reusable loader component
const Loader = ({ size = "medium", color = "#8e44ad" }) => {
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
                        color: color,
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
                        background: "linear-gradient(45deg, rgba(142, 68, 173, 0.3), rgba(91, 44, 111, 0.3))"
                    }}></div>
                </div>
            </div>
            <p className="mt-3 text-muted">Loading materials...</p>
        </div>
    );
};

function StudyMaterials() {
    const { course_id } = useParams();
    const navigate = useNavigate();
    const [studyMaterials, setStudyMaterials] = useState([]);
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [materialData, setMaterialData] = useState({
        title: '',
        description: '',
        file: null,
        remarks: ''
    });

    useEffect(() => {
        document.title = "Study Materials | Knoology LMS";

        // Check if teacher is logged in
        const teacherData = localStorage.getItem('teacherData');
        if (!teacherData) {
            navigate('/teacher-login');
            return;
        }

        fetchStudyMaterials();
        fetchCourseData();
    }, [course_id, navigate]);

    const fetchStudyMaterials = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_API_URL}/study-materials/${course_id}/`);
            setStudyMaterials(response.data);
        } catch (error) {
            console.error('Error fetching study materials:', error);
            setErrorMsg('Failed to load study materials. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseData = async () => {
        try {
            const response = await axios.get(`${BASE_API_URL}/course/${course_id}/`);
            setCourseData(response.data);
        } catch (error) {
            console.error('Error fetching course data:', error);
        }
    };

    const handleChange = (e) => {
        if (e.target.name === 'file') {
            setMaterialData({
                ...materialData,
                file: e.target.files[0]
            });
        } else {
            setMaterialData({
                ...materialData,
                [e.target.name]: e.target.value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        // Basic validation
        if (!materialData.title || materialData.title.length < 3) {
            setErrorMsg("Title must be at least 3 characters long.");
            return;
        }

        if (!materialData.file) {
            setErrorMsg("Please select a file to upload.");
            return;
        }

        // Check file size (max 10MB)
        if (materialData.file.size > 10 * 1024 * 1024) {
            setErrorMsg("File size should not exceed 10MB.");
            return;
        }

        try {
            // Create form data for file upload
            const formData = new FormData();
            formData.append('title', materialData.title);
            formData.append('description', materialData.description);
            formData.append('file', materialData.file);
            formData.append('remarks', materialData.remarks);
            formData.append('course', course_id);

            // Get teacher ID from localStorage
            const { teacherId } = JSON.parse(localStorage.getItem('teacherData'));
            formData.append('teacher', teacherId);

            const response = await axios.post(`${BASE_API_URL}/study-materials/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Study material uploaded successfully!',
                    icon: 'success',
                    confirmButtonColor: '#8e44ad'
                });

                setMaterialData({
                    title: '',
                    description: '',
                    file: null,
                    remarks: ''
                });

                // Reset file input
                document.getElementById('file-upload').value = '';

                // Refresh the study materials list
                fetchStudyMaterials();

                // Hide the form after successful upload
                setShowAddForm(false);
            }
        } catch (error) {
            console.error('Error uploading study material:', error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || "Failed to upload study material. Please try again.",
                icon: 'error',
                confirmButtonColor: '#8e44ad'
            });
        }
    };

    const handleDelete = async (materialId) => {
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#8e44ad',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${BASE_API_URL}/study-material-detail/${materialId}/`);

                // Update the local state
                setStudyMaterials(studyMaterials.filter(material => material.id !== materialId));

                Swal.fire({
                    title: 'Deleted!',
                    text: 'Study material has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#8e44ad'
                });
            } catch (error) {
                console.error('Error deleting study material:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete study material.',
                    icon: 'error',
                    confirmButtonColor: '#8e44ad'
                });
            }
        }
    };

    // Function to determine file icon based on file type
    const getFileIcon = (fileUrl) => {
        if (!fileUrl) return "bi-file-earmark";

        const extension = fileUrl.split('.').pop().toLowerCase();

        if (['pdf'].includes(extension)) return "bi-file-earmark-pdf";
        if (['doc', 'docx'].includes(extension)) return "bi-file-earmark-word";
        if (['xls', 'xlsx'].includes(extension)) return "bi-file-earmark-excel";
        if (['ppt', 'pptx'].includes(extension)) return "bi-file-earmark-ppt";
        if (['zip', 'rar', '7z'].includes(extension)) return "bi-file-earmark-zip";
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) return "bi-file-earmark-image";
        if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) return "bi-file-earmark-play";
        if (['mp3', 'wav', 'ogg'].includes(extension)) return "bi-file-earmark-music";

        return "bi-file-earmark";
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
                        background: 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)',
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
                                    background: 'linear-gradient(45deg, #5b2c6f, #8e44ad)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(142, 68, 173, 0.3)'
                                }}>
                                    <i className="bi bi-book" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Study Materials
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        {courseData ? courseData.title : "Loading course..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Material Button */}
                    <div className="mb-4 d-flex justify-content-end">
                        <button
                            className="btn"
                            onClick={() => setShowAddForm(!showAddForm)}
                            style={{
                                background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.6rem 1.5rem',
                                fontWeight: '500',
                                boxShadow: '0 4px 15px rgba(142, 68, 173, 0.2)'
                            }}
                        >
                            <i className={`bi ${showAddForm ? 'bi-x-circle' : 'bi-plus-circle'} me-2`}></i>
                            {showAddForm ? 'Cancel' : 'Add New Material'}
                        </button>
                    </div>

                    {/* Error and Success Messages */}
                    {errorMsg && (
                        <div style={{
                            background: 'rgba(220, 53, 69, 0.1)',
                            color: '#dc3545',
                            padding: '15px 20px',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            border: 'none'
                        }}>
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
                        <div style={{
                            background: 'rgba(25, 135, 84, 0.1)',
                            color: '#198754',
                            padding: '15px 20px',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            border: 'none'
                        }}>
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

                    {/* Add Material Form */}
                    {showAddForm && (
                        <div className="mb-4" style={{
                            background: 'white',
                            borderRadius: '20px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.1), rgba(91, 44, 111, 0.1))',
                                padding: '20px 25px',
                                borderBottom: '1px solid rgba(142, 68, 173, 0.1)'
                            }}>
                                <div className="d-flex align-items-center">
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '15px'
                                    }}>
                                        <i className="bi bi-cloud-upload" style={{
                                            color: 'white',
                                            fontSize: '1.2rem'
                                        }}></i>
                                    </div>
                                    <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                        Upload New Study Material
                                    </h5>
                                </div>
                            </div>
                            <div className="p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="title" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                            <i className="bi bi-type me-2" style={{ color: '#8e44ad' }}></i>
                                            Title <span style={{ color: '#dc3545' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="title"
                                            name="title"
                                            value={materialData.title}
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
                                    <div className="mb-3">
                                        <label htmlFor="description" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                            <i className="bi bi-file-text me-2" style={{ color: '#8e44ad' }}></i>
                                            Description
                                        </label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            value={materialData.description}
                                            onChange={handleChange}
                                            rows="2"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 'none',
                                                resize: 'vertical'
                                            }}
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="file-upload" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                            <i className="bi bi-paperclip me-2" style={{ color: '#8e44ad' }}></i>
                                            File <span style={{ color: '#dc3545' }}>*</span>
                                        </label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="file-upload"
                                            name="file"
                                            onChange={handleChange}
                                            required
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 'none'
                                            }}
                                        />
                                        <div className="form-text" style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                            <i className="bi bi-info-circle me-1"></i>
                                            Maximum file size: 10MB. Supported formats: PDF, DOCX, PPT, XLSX, ZIP, etc.
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="remarks" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                                            <i className="bi bi-chat-left-text me-2" style={{ color: '#8e44ad' }}></i>
                                            Remarks
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="remarks"
                                            name="remarks"
                                            value={materialData.remarks}
                                            onChange={handleChange}
                                            placeholder="Any additional notes for students"
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: 'none'
                                            }}
                                        />
                                    </div>
                                    <div className="d-flex justify-content-end">
                                        <button
                                            type="button"
                                            className="btn me-2"
                                            onClick={() => setShowAddForm(false)}
                                            style={{
                                                background: '#f8f9fa',
                                                color: '#6c757d',
                                                borderRadius: '50px',
                                                padding: '0.6rem 1.5rem',
                                                fontWeight: '500',
                                                border: 'none'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn"
                                            style={{
                                                background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.6rem 1.5rem',
                                                fontWeight: '500',
                                                boxShadow: '0 4px 10px rgba(142, 68, 173, 0.2)'
                                            }}
                                        >
                                            <i className="bi bi-cloud-upload me-2"></i>
                                            Upload Material
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Study Materials List */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '20px 25px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.1), rgba(91, 44, 111, 0.1))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '15px'
                            }}>
                                <i className="bi bi-files" style={{
                                    color: '#8e44ad',
                                    fontSize: '1.2rem'
                                }}></i>
                            </div>
                            <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                Materials List
                            </h5>
                        </div>

                        <div className="p-4">
                            {loading ? (
                                <Loader />
                            ) : studyMaterials.length === 0 ? (
                                <div className="text-center py-5">
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'rgba(142, 68, 173, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 20px'
                                    }}>
                                        <i className="bi bi-file-earmark-text" style={{ fontSize: '2rem', color: '#8e44ad' }}></i>
                                    </div>
                                    <h5 style={{ fontWeight: '600', color: '#495057', marginBottom: '10px' }}>No Study Materials Yet</h5>
                                    <p className="text-muted mb-4">Add your first study material to help your students learn better.</p>
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="btn"
                                        style={{
                                            background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50px',
                                            padding: '0.6rem 1.5rem',
                                            fontWeight: '500',
                                            boxShadow: '0 4px 15px rgba(142, 68, 173, 0.2)'
                                        }}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Add Your First Material
                                    </button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table" style={{
                                        borderCollapse: 'separate',
                                        borderSpacing: '0 12px'
                                    }}>
                                        <thead>
                                            <tr style={{
                                                background: 'rgba(142, 68, 173, 0.05)'
                                            }}>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                                                }}>File</th>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                                                }}>Details</th>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                                                }}>Uploaded On</th>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    borderBottom: '2px solid rgba(142, 68, 173, 0.1)',
                                                    textAlign: 'center'
                                                }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studyMaterials.map(material => (
                                                <tr key={material.id} style={{
                                                    background: 'white',
                                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                                                    borderRadius: '10px',
                                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                                                }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            <div style={{
                                                                width: '45px',
                                                                height: '45px',
                                                                borderRadius: '10px',
                                                                background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.1), rgba(91, 44, 111, 0.1))',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                marginRight: '15px'
                                                            }}>
                                                                <i className={`bi ${getFileIcon(material.file)}`} style={{
                                                                    fontSize: '1.5rem',
                                                                    color: '#8e44ad'
                                                                }}></i>
                                                            </div>
                                                            <div>
                                                                <h6 style={{ marginBottom: '5px', fontWeight: '500' }}>{material.title}</h6>
                                                                <a
                                                                    href={material.file}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    style={{
                                                                        color: '#8e44ad',
                                                                        textDecoration: 'none',
                                                                        fontSize: '0.85rem',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center'
                                                                    }}
                                                                >
                                                                    <i className="bi bi-download me-1"></i>
                                                                    Download File
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px', fontSize: '0.9rem' }}>
                                                        {material.description ? (
                                                            <div>
                                                                <p style={{ color: '#6c757d', marginBottom: '5px' }}>
                                                                    {material.description}
                                                                </p>
                                                                {material.remarks && (
                                                                    <div style={{
                                                                        fontSize: '0.85rem',
                                                                        color: '#6c757d',
                                                                        fontStyle: 'italic'
                                                                    }}>
                                                                        <i className="bi bi-info-circle me-1"></i>
                                                                        {material.remarks}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            material.remarks ? (
                                                                <div style={{
                                                                    fontSize: '0.85rem',
                                                                    color: '#6c757d',
                                                                    fontStyle: 'italic'
                                                                }}>
                                                                    <i className="bi bi-info-circle me-1"></i>
                                                                    {material.remarks}
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted">—</span>
                                                            )
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '16px', minWidth: '140px' }}>
                                                        <div style={{ fontSize: '0.9rem' }}>
                                                            {new Date(material.created_at).toLocaleDateString('en-US', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => handleDelete(material.id)}
                                                            className="btn btn-sm"
                                                            title="Delete Material"
                                                            style={{
                                                                background: 'rgba(220, 53, 69, 0.1)',
                                                                color: '#dc3545',
                                                                border: 'none',
                                                                borderRadius: '50px',
                                                                padding: '0.4rem 0.8rem',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <i className="bi bi-trash me-1"></i>
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudyMaterials;