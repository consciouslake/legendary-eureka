import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import { apiUrl } from '../../config';

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

function CourseStudyMaterials() {
    const { course_id } = useParams();
    const navigate = useNavigate();
    const [studyMaterials, setStudyMaterials] = useState([]);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStudyMaterials = useCallback(async () => {
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) {
            navigate('/user-login');
            return;
        }

        try {
            // Fetch course details first
            const courseResponse = await axios.get(`${apiUrl}/course/${course_id}/`);
            setCourse(courseResponse.data);
            
            // Fetch study materials for this course
            const response = await axios.get(`${apiUrl}/study-materials/${course_id}/`);
            
            if (response.data) {
                setStudyMaterials(response.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching study materials:', error);
            setError('Failed to load study materials for this course. Please try again later.');
            setLoading(false);
        }
    }, [navigate, course_id]);

    useEffect(() => {
        fetchStudyMaterials();
    }, [fetchStudyMaterials]);

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
        <div className='container mt-4'>
            <div className='row'>
                <aside className='col-md-3'>
                    <Sidebar />
                </aside>
                <section className='col-md-9'>
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
                                        {course ? course.title : "Loading course..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Back Button */}
                    <div className="mb-4">
                        <Link 
                            to="/my-courses" 
                            className="btn" 
                            style={{
                                background: 'rgba(142, 68, 173, 0.1)',
                                color: '#8e44ad',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.6rem 1.2rem',
                                fontWeight: '500',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Back to My Courses
                        </Link>
                    </div>
                    
                    {/* Error Message */}
                    {error && (
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
                                    <p className="mb-0">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Study Materials Content */}
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
                                Available Materials
                                {!loading && <span className="ms-2 badge bg-secondary" style={{ 
                                    fontSize: '0.7rem',
                                    fontWeight: '500',
                                    background: 'rgba(142, 68, 173, 0.2) !important',
                                    color: '#8e44ad'
                                }}>
                                    {studyMaterials.length}
                                </span>}
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
                                    <h5 style={{ fontWeight: '600', color: '#495057', marginBottom: '10px' }}>No Study Materials Available</h5>
                                    <p className="text-muted mb-4">Your instructor hasn't uploaded any study materials for this course yet.</p>
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
                                                }}>Title</th>
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
                                                }}>Date Added</th>
                                                <th style={{ 
                                                    padding: '12px 16px',
                                                    fontWeight: '600',
                                                    color: '#495057',
                                                    borderBottom: '2px solid rgba(142, 68, 173, 0.1)',
                                                    textAlign: 'center'
                                                }}>Action</th>
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
                                                            <h6 style={{ marginBottom: '0', fontWeight: '500' }}>{material.title}</h6>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <div>
                                                            {material.description && (
                                                                <p className="mb-1" style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                                                                    {material.description}
                                                                </p>
                                                            )}
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
                                                            {!material.description && !material.remarks && (
                                                                <span className="text-muted">—</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <div style={{ fontSize: '0.9rem' }}>
                                                            {new Date(material.created_at).toLocaleDateString('en-US', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                                        <a 
                                                            href={material.file} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="btn"
                                                            style={{
                                                                background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '50px',
                                                                padding: '0.4rem 1rem',
                                                                fontWeight: '500',
                                                                boxShadow: '0 4px 10px rgba(142, 68, 173, 0.2)',
                                                                fontSize: '0.9rem'
                                                            }}
                                                        >
                                                            <i className="bi bi-download me-2"></i>
                                                            Download
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default CourseStudyMaterials;