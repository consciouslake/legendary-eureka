import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { formatFileUrl } from '../../utils/fileUtils';

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
            <p className="mt-3 text-muted">Loading assignments...</p>
        </div>
    );
};

function StudentAssignments() {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState({});

    // Handle file selection
    const handleFileSelect = (assignmentId, e) => {
        if (e.target.files[0]) {
            setSelectedFiles({
                ...selectedFiles,
                [assignmentId]: e.target.files[0].name
            });

            // Update the button text to show filename
            const button = e.target.parentElement.querySelector('.file-name');
            if (button) {
                const fileName = e.target.files[0].name;
                // Truncate filename if too long
                button.textContent = fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName;
            }
        }
    };

    useEffect(() => {
        document.title = "My Assignments | Knoology LMS";
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) {
            navigate('/user-login');
            return;
        }

        const fetchAssignments = async () => {
            try {
                const { studentId } = JSON.parse(studentInfo);
                console.log("Fetching assignments for student ID:", studentId);
                const response = await axios.get(`${BASE_API_URL}/student-assignments/${studentId}/`);

                if (response.data.status === 'success') {
                    console.log("Assignments fetched:", response.data.assignments);
                    // Debug file URLs specifically
                    response.data.assignments.forEach(assignment => {
                        console.log(`Assignment ID ${assignment.id}:`);
                        console.log("- assignment_file:", assignment.assignment_file);
                        console.log("- submitted_file:", assignment.submitted_file);
                    });

                    setAssignments(response.data.assignments);
                }
            } catch (error) {
                console.error('Error fetching assignments:', error);
                setError('Failed to load assignments. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [navigate]);

    const handleSubmit = async (assignmentId) => {
        const fileInput = document.querySelector(`#file-${assignmentId}`);
        if (!fileInput || !fileInput.files[0]) {
            Swal.fire({
                title: 'Error!',
                text: 'Please select a file to submit',
                icon: 'error'
            });
            return;
        }

        // File size check (limiting to 10MB for example)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (fileInput.files[0].size > maxSize) {
            Swal.fire({
                title: 'File Too Large',
                text: 'Please select a file smaller than 10MB',
                icon: 'warning'
            });
            return;
        }

        // Show a loading message
        Swal.fire({
            title: 'Uploading...',
            html: '<div class="d-flex justify-content-center"><div class="spinner-border text-primary" role="status"></div></div><p class="mt-2">Please wait while your assignment is being uploaded.</p>',
            showConfirmButton: false,
            allowOutsideClick: false
        });

        setSubmitting(assignmentId);
        const formData = new FormData();
        formData.append('submitted_file', fileInput.files[0]);

        try {
            const response = await axios.post(
                `${BASE_API_URL}/submit-assignment/${assignmentId}/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.status === 'success') {
                setAssignments(prevAssignments =>
                    prevAssignments.map(assignment =>
                        assignment.id === assignmentId
                            ? { ...assignment, ...response.data.data }
                            : assignment
                    )
                );
                Swal.fire({
                    title: 'Assignment Submitted!',
                    html: '<div class="d-flex flex-column align-items-center">' +
                        '<div class="mb-3"><i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i></div>' +
                        '<p class="fw-bold">Your assignment has been submitted successfully!</p>' +
                        '<div class="text-start mt-2 mb-3 p-3" style="background-color: #f8f9fa; border-radius: 8px;">' +
                        '<p class="mb-1"><i class="bi bi-check-circle-fill text-success me-2"></i>File uploaded successfully</p>' +
                        '<p class="mb-1"><i class="bi bi-clock-history text-primary me-2"></i>Submitted on: ' + new Date().toLocaleString() + '</p>' +
                        '<p class="mb-0"><i className="bi bi-bell text-warning me-2"></i>You will be notified when graded</p>' +
                        '</div>' +
                        '</div>',
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                });
            }
        } catch (error) {
            console.error('Error submitting assignment:', error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to submit assignment',
                icon: 'error'
            });
        } finally {
            setSubmitting(null);
        }
    };

    if (loading) {
        return (
            <div className='container-fluid px-4' style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
                <div className='row g-4'>
                    <div className='col-md-3'>
                        <Sidebar />
                    </div>
                    <div className='col-md-9'>
                        <Loader size="medium" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='container-fluid px-4' style={{ paddingTop: '100px', paddingBottom: '3rem' }}>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <Sidebar />
                </div>
                <div className='col-md-9'>
                    {/* Page Header */}
                    <div className="page-header" style={{
                        background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
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
                                    background: 'linear-gradient(45deg, #fd7e14, #dc3545)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(220, 53, 69, 0.3)'
                                }}>
                                    <i className="bi bi-file-earmark-text" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        My Assignments
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        <span style={{ fontWeight: '600' }}>
                                            {assignments.filter(a => a.submission_date).length}
                                        </span> submitted,
                                        <span style={{ fontWeight: '600' }}>
                                            {assignments.filter(a => !a.submission_date).length}
                                        </span> pending
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
                        overflow: 'hidden'
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
                                    background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(253, 126, 20, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-list-task" style={{
                                        color: '#dc3545',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Assignment Tasks
                                </h5>
                            </div>

                            <div className="d-flex align-items-center">
                                {assignments.filter(a => a.assignment_file).length > 0 && (
                                    <div className="badge me-3" style={{
                                        background: 'rgba(13, 202, 240, 0.1)',
                                        color: '#0dcaf0',
                                        padding: '0.5rem 0.8rem',
                                        fontWeight: '600',
                                        borderRadius: '30px',
                                        fontSize: '0.85rem'
                                    }}>
                                        <i className="bi bi-file-earmark-arrow-down me-2"></i>
                                        {assignments.filter(a => a.assignment_file).length} With Materials
                                    </div>
                                )}

                                <div className="badge me-3" style={{
                                    background: 'rgba(40, 167, 69, 0.1)',
                                    color: '#28a745',
                                    padding: '0.5rem 0.8rem',
                                    fontWeight: '600',
                                    borderRadius: '30px',
                                    fontSize: '0.85rem'
                                }}>
                                    <i className="bi bi-check-circle me-2"></i>
                                    {assignments.filter(a => a.submission_date).length} Completed
                                </div>

                                <div className="badge" style={{
                                    background: 'rgba(255, 193, 7, 0.1)',
                                    color: '#ffc107',
                                    padding: '0.5rem 0.8rem',
                                    fontWeight: '600',
                                    borderRadius: '30px',
                                    fontSize: '0.85rem'
                                }}>
                                    <i className="bi bi-hourglass-split me-2"></i>
                                    {assignments.filter(a => !a.submission_date).length} Pending
                                </div>
                            </div>
                        </div>

                        <div className="section-body">
                            {error && (
                                <div className="alert m-4" style={{
                                    background: 'rgba(220, 53, 69, 0.1)',
                                    color: '#dc3545',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px'
                                }} role="alert">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    {error}
                                </div>
                            )}

                            {assignments.length === 0 ? (
                                <div className="empty-state p-5 text-center">
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <i className="bi bi-file-earmark-check" style={{
                                            color: '#08AEEA',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Assignments Yet</h5>
                                    <p className="text-muted mb-0">You don't have any assignments at the moment.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table mb-0" style={{
                                        fontSize: '0.95rem'
                                    }}>
                                        <thead style={{
                                            background: 'rgba(220, 53, 69, 0.03)'
                                        }}>
                                            <tr>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '25%' }}>Assignment</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '15%' }}>Course</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '12%' }}>Due Date</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '10%' }}>Status</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '8%' }}>Grade</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '15%' }}>Materials</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '15%' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignments.map(assignment => (
                                                <tr key={assignment.id} style={{
                                                    borderBottom: '1px solid #f0f0f0',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                        <div className="d-flex align-items-center">
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '10px',
                                                                background: 'rgba(220, 53, 69, 0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                marginRight: '10px',
                                                                flexShrink: 0
                                                            }}>
                                                                <i className="bi bi-file-text" style={{ color: '#dc3545', fontSize: '1.2rem' }}></i>
                                                            </div>
                                                            <div>
                                                                <div className="d-flex align-items-center">
                                                                    <p className="mb-0 me-2" style={{ fontWeight: '500', color: '#002254' }}>
                                                                        {assignment.title}
                                                                    </p>
                                                                    {assignment.assignment_file && (
                                                                        <div className="position-relative">
                                                                            <span className="badge bg-info text-white" style={{ fontSize: '0.65rem' }} title="Includes downloadable materials">
                                                                                <i className="bi bi-paperclip me-1"></i> Materials
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {assignment.description && (
                                                                    <p className="mb-0 mt-1" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                                                                        {assignment.description.length > 50
                                                                            ? `${assignment.description.substring(0, 50)}...`
                                                                            : assignment.description}
                                                                        <button
                                                                            className="btn btn-link p-0 ms-1"
                                                                            style={{ fontSize: '0.8rem', verticalAlign: 'baseline', textDecoration: 'none' }}
                                                                            onClick={() => {
                                                                                Swal.fire({
                                                                                    title: assignment.title,
                                                                                    html: `<div style="text-align: left;">${assignment.description}</div>`,
                                                                                    confirmButtonText: 'Close',
                                                                                    confirmButtonColor: '#dc3545',
                                                                                    showClass: {
                                                                                        popup: 'animate__animated animate__fadeIn animate__faster'
                                                                                    }
                                                                                })
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-info-circle"></i> Details
                                                                        </button>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                        <span>{assignment.course_title}</span>
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                        <span className="badge" style={{
                                                            background: 'rgba(220, 53, 69, 0.1)',
                                                            color: '#dc3545',
                                                            fontWeight: '500',
                                                            padding: '6px 12px',
                                                            borderRadius: '30px'
                                                        }}>
                                                            <i className="bi bi-calendar-event me-1"></i> {assignment.due_date_formatted}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                        {assignment.submission_date ? (
                                                            <span className="badge" style={{
                                                                background: 'rgba(40, 167, 69, 0.1)',
                                                                color: '#28a745',
                                                                fontWeight: '500',
                                                                padding: '6px 12px',
                                                                borderRadius: '30px'
                                                            }}>
                                                                <i className="bi bi-check-circle me-1"></i> Submitted
                                                            </span>
                                                        ) : (
                                                            <span className="badge" style={{
                                                                background: 'rgba(255, 193, 7, 0.1)',
                                                                color: '#ffc107',
                                                                fontWeight: '500',
                                                                padding: '6px 12px',
                                                                borderRadius: '30px'
                                                            }}>
                                                                <i className="bi bi-hourglass-split me-1"></i> Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                        {assignment.grade ? (
                                                            <span className="badge" style={{
                                                                background: assignment.grade === 'A' ? 'rgba(40, 167, 69, 0.1)' :
                                                                    assignment.grade === 'B' ? 'rgba(40, 167, 69, 0.1)' :
                                                                        assignment.grade === 'C' ? 'rgba(23, 162, 184, 0.1)' :
                                                                            assignment.grade === 'D' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                                                                color: assignment.grade === 'A' ? '#28a745' :
                                                                    assignment.grade === 'B' ? '#28a745' :
                                                                        assignment.grade === 'C' ? '#17a2b8' :
                                                                            assignment.grade === 'D' ? '#ffc107' : '#dc3545',
                                                                fontWeight: '600',
                                                                padding: '6px 12px',
                                                                borderRadius: '30px',
                                                                fontSize: '1rem'
                                                            }}>
                                                                {assignment.grade}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted" style={{ fontSize: '0.9rem' }}>Not graded</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                        {assignment.assignment_file ? (
                                                            <div className="materials-card" style={{
                                                                borderRadius: '8px',
                                                                padding: '8px 12px',
                                                                background: 'linear-gradient(145deg, rgba(13, 202, 240, 0.08), rgba(23, 162, 184, 0.08))',
                                                                border: '1px solid rgba(13, 202, 240, 0.2)',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '8px'
                                                            }}>
                                                                <div className="d-flex align-items-center">
                                                                    <div style={{
                                                                        width: '30px',
                                                                        height: '30px',
                                                                        borderRadius: '6px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        background: 'rgba(13, 202, 240, 0.15)',
                                                                        marginRight: '8px'
                                                                    }}>
                                                                        <i className="bi bi-file-earmark-text" style={{ color: '#17a2b8', fontSize: '1rem' }}></i>
                                                                    </div>
                                                                    <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#17a2b8' }}>
                                                                        Assignment File
                                                                    </div>
                                                                </div>
                                                                <a
                                                                    href={formatFileUrl(assignment.assignment_file)}
                                                                    className="btn btn-sm"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        background: 'rgba(13, 202, 240, 0.15)',
                                                                        color: '#17a2b8',
                                                                        border: 'none',
                                                                        borderRadius: '50px',
                                                                        padding: '0.25rem 0.8rem',
                                                                        fontWeight: '500',
                                                                        fontSize: '0.8rem',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        width: 'fit-content'
                                                                    }}
                                                                >
                                                                    <i className="bi bi-cloud-download me-1"></i>
                                                                    Download
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <div className="materials-unavailable d-flex align-items-center">
                                                                <div style={{
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    borderRadius: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    background: 'rgba(108, 117, 125, 0.1)',
                                                                    marginRight: '8px'
                                                                }}>
                                                                    <i className="bi bi-slash-circle" style={{ color: '#6c757d', fontSize: '0.9rem' }}></i>
                                                                </div>
                                                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                                    No materials
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px 20px', verticalAlign: 'middle' }}>
                                                        {!assignment.submission_date ? (
                                                            <div className="submission-actions d-flex flex-column gap-2">
                                                                <div className="file-input-wrapper" style={{
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    display: 'inline-block',
                                                                    width: '100%'
                                                                }}>
                                                                    <input
                                                                        type="file"
                                                                        id={`file-${assignment.id}`}
                                                                        disabled={submitting === assignment.id}
                                                                        onChange={(e) => handleFileSelect(assignment.id, e)}
                                                                        style={{
                                                                            position: 'absolute',
                                                                            left: '0',
                                                                            top: '0',
                                                                            opacity: '0',
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                    />
                                                                    <button
                                                                        className="btn btn-sm w-100"
                                                                        title="Select your completed assignment file to upload"
                                                                        style={{
                                                                            background: 'rgba(220, 53, 69, 0.05)',
                                                                            color: '#dc3545',
                                                                            border: '1px solid rgba(220, 53, 69, 0.3)',
                                                                            borderRadius: '50px',
                                                                            padding: '0.35rem 0.8rem',
                                                                            fontWeight: '500',
                                                                            fontSize: '0.85rem',
                                                                            textOverflow: 'ellipsis',
                                                                            overflow: 'hidden',
                                                                            whiteSpace: 'nowrap'
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-file-earmark-arrow-up me-1"></i>
                                                                        <span className="file-name">
                                                                            Choose File
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    className="btn btn-sm w-100"
                                                                    onClick={() => handleSubmit(assignment.id)}
                                                                    disabled={submitting === assignment.id}
                                                                    title="Submit your assignment file"
                                                                    style={{
                                                                        background: 'linear-gradient(45deg, #fd7e14, #dc3545)',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '50px',
                                                                        padding: '0.35rem 0.8rem',
                                                                        fontWeight: '500',
                                                                        fontSize: '0.85rem',
                                                                        boxShadow: '0 2px 5px rgba(220, 53, 69, 0.2)'
                                                                    }}
                                                                >
                                                                    {submitting === assignment.id ? (
                                                                        <>
                                                                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                            Submitting...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="bi bi-upload me-1"></i>
                                                                            Submit
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="submission-view">
                                                                {assignment.submitted_file && (
                                                                    <div className="submission-card" style={{
                                                                        borderRadius: '8px',
                                                                        padding: '8px 12px',
                                                                        background: 'linear-gradient(145deg, rgba(42, 245, 152, 0.08), rgba(8, 174, 234, 0.08))',
                                                                        border: '1px solid rgba(42, 245, 152, 0.2)',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: '8px'
                                                                    }}>
                                                                        <div className="d-flex align-items-center">
                                                                            <div style={{
                                                                                width: '30px',
                                                                                height: '30px',
                                                                                borderRadius: '6px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                background: 'rgba(40, 167, 69, 0.15)',
                                                                                marginRight: '8px'
                                                                            }}>
                                                                                <i className="bi bi-check-circle" style={{ color: '#28a745', fontSize: '1rem' }}></i>
                                                                            </div>
                                                                            <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#28a745' }}>
                                                                                Submitted
                                                                            </div>
                                                                        </div>
                                                                        <a
                                                                            href={formatFileUrl(assignment.submitted_file)}
                                                                            className="btn btn-sm"
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            style={{
                                                                                background: 'rgba(40, 167, 69, 0.15)',
                                                                                color: '#28a745',
                                                                                border: 'none',
                                                                                borderRadius: '50px',
                                                                                padding: '0.25rem 0.8rem',
                                                                                fontWeight: '500',
                                                                                fontSize: '0.8rem',
                                                                                display: 'inline-flex',
                                                                                alignItems: 'center',
                                                                                width: 'fit-content'
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-file-earmark-text me-1"></i>
                                                                            View
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
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

export default StudentAssignments;