import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
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
                        color: '#ff6b6b',
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
                        background: "linear-gradient(45deg, rgba(255, 107, 107, 0.3), rgba(254, 201, 107, 0.3))"
                    }}></div>
                </div>
            </div>
            <p className="mt-3 text-muted">Loading assignments...</p>
        </div>
    );
};

function CheckAssignments() {
    const { studentId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [studentName, setStudentName] = useState('');
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        due_date: ''
    });

    useEffect(() => {
        document.title = "Check Assignments | Knoology LMS";
        fetchAssignments();
    }, [studentId]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_API_URL}/student-assignments/${studentId}/`);
            if (response.data.status === 'success') {
                setAssignments(response.data.assignments);
                setStudentName(response.data.student_name);
            } else {
                setError('Failed to load assignments. Please try again later.');
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setError('Failed to load assignments. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (assignmentId) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "This action cannot be undone!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const response = await axios.delete(`${BASE_API_URL}/delete-assignment/${assignmentId}/`);

                if (response.data.status === 'success') {
                    setAssignments(prevAssignments =>
                        prevAssignments.filter(assignment => assignment.id !== assignmentId)
                    );
                    setSuccess('Assignment deleted successfully!');

                    // Clear success message after 3 seconds
                    setTimeout(() => setSuccess(''), 3000);
                } else {
                    setError('Failed to delete assignment. Please try again later.');
                }
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            setError('Failed to delete assignment. Please try again later.');
        }
    };

    const handleGrade = async (assignmentId, grade) => {
        try {
            setLoading(true);
            const assignment = assignments.find(a => a.id === assignmentId);

            if (!assignment.submission_date) {
                setError('Cannot grade an assignment that has not been submitted yet.');
                setLoading(false);
                return;
            }

            const response = await axios.post(
                `${BASE_API_URL}/grade-assignment/${assignmentId}/`,
                { grade },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status === 'success') {
                setAssignments(prevAssignments =>
                    prevAssignments.map(assignment =>
                        assignment.id === assignmentId
                            ? { ...assignment, grade }
                            : assignment
                    )
                );
                setSuccess('Assignment graded successfully!');

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to grade assignment. Please try again.');
            }
        } catch (error) {
            console.error('Error grading assignment:', error);
            setError(error.response?.data?.message || 'Failed to grade assignment');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (assignment) => {
        const formattedDate = assignment.due_date.split('T')[0];
        setEditingAssignment(assignment.id);
        setEditForm({
            title: assignment.title,
            description: assignment.description || '',
            due_date: formattedDate
        });
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            if (!editForm.title || !editForm.due_date) {
                setError('Title and due date are required');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('title', editForm.title);
            formData.append('description', editForm.description);
            formData.append('due_date', editForm.due_date);

            const response = await axios.put(
                `${BASE_API_URL}/update-assignment/${editingAssignment}/`,
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
                        assignment.id === editingAssignment
                            ? { ...assignment, ...response.data.data }
                            : assignment
                    )
                );
                setEditingAssignment(null);
                setSuccess('Assignment updated successfully!');

                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError('Failed to update assignment. Please try again.');
            }
        } catch (error) {
            console.error('Error updating assignment:', error);
            setError(error.response?.data?.message || 'Failed to update assignment');
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
                        background: 'linear-gradient(135deg, #ff6b6b 0%, #fec96b 100%)',
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
                                    background: 'linear-gradient(45deg, #ff6b6b, #fec96b)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(255, 107, 107, 0.3)'
                                }}>
                                    <i className="bi bi-clipboard2-check" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Student Assignments
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        {studentName ? `Review and grade assignments for ${studentName}` : 'Review student work'}
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
                                    background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(254, 201, 107, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-list-check" style={{
                                        color: '#ff6b6b',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Assignments Overview
                                </h5>
                            </div>
                        </div>

                        <div className="section-body p-4">
                            {error && (
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
                                            <p className="mb-0">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {success && (
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
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Success</h6>
                                            <p className="mb-0">{success}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <Loader size="medium" />
                            ) : assignments.length === 0 ? (
                                <div className="empty-state p-5 text-center">
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(254, 201, 107, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <i className="bi bi-clipboard-x" style={{
                                            color: '#ff6b6b',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Assignments Found</h5>
                                    <p className="text-muted mb-4">There are no assignments for this student yet.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(255, 107, 107, 0.03)' }}>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '22%' }}>Title</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '12%' }}>Course</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '15%' }}>Due Date</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '15%' }}>Submission Status</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '14%' }}>Files</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '7%' }}>Grade</th>
                                                <th style={{ padding: '15px 20px', fontWeight: '600', color: '#506690', width: '15%' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assignments.map(assignment => (
                                                <tr key={assignment.id} style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '10px' }}>
                                                    <td style={{ padding: '15px 20px', fontWeight: '500', color: '#002254' }}>
                                                        {editingAssignment === assignment.id ? (
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={editForm.title}
                                                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                                style={{
                                                                    padding: '0.6rem 0.75rem',
                                                                    borderRadius: '10px',
                                                                    border: '1px solid #e2e8f0',
                                                                    boxShadow: 'none'
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="d-flex align-items-center">
                                                                <div style={{
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    borderRadius: '8px',
                                                                    background: 'rgba(255, 107, 107, 0.1)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    marginRight: '10px',
                                                                    flexShrink: 0
                                                                }}>
                                                                    <i className="bi bi-file-text" style={{ color: '#ff6b6b', fontSize: '1rem' }}></i>
                                                                </div>
                                                                <div>
                                                                    <p className="mb-0" style={{ fontWeight: '500', color: '#002254' }}>
                                                                        {assignment.title}
                                                                    </p>
                                                                    {assignment.description && (
                                                                        <button
                                                                            className="btn btn-link p-0 mt-1"
                                                                            style={{ fontSize: '0.8rem', color: '#6c757d', textDecoration: 'none' }}
                                                                            onClick={() => {
                                                                                Swal.fire({
                                                                                    title: assignment.title,
                                                                                    html: `<div style="text-align: left;">${assignment.description}</div>`,
                                                                                    confirmButtonText: 'Close',
                                                                                    confirmButtonColor: '#ff6b6b',
                                                                                })
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-file-text me-1"></i> View Description
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        <span className="badge" style={{
                                                            background: 'rgba(13, 110, 253, 0.08)',
                                                            color: '#0d6efd',
                                                            fontWeight: '500',
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            {assignment.course_title}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        {editingAssignment === assignment.id ? (
                                                            <>
                                                                <input
                                                                    type="date"
                                                                    className="form-control"
                                                                    value={editForm.due_date}
                                                                    onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                                                                    style={{
                                                                        padding: '0.6rem 0.75rem',
                                                                        borderRadius: '10px',
                                                                        border: '1px solid #e2e8f0',
                                                                        boxShadow: 'none'
                                                                    }}
                                                                />
                                                                <textarea
                                                                    className="form-control mt-2"
                                                                    value={editForm.description}
                                                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                                    placeholder="Assignment description"
                                                                    rows="2"
                                                                    style={{
                                                                        padding: '0.6rem 0.75rem',
                                                                        borderRadius: '10px',
                                                                        border: '1px solid #e2e8f0',
                                                                        boxShadow: 'none',
                                                                        fontSize: '0.85rem'
                                                                    }}
                                                                ></textarea>
                                                            </>
                                                        ) : (
                                                            <span className="badge" style={{
                                                                background: 'rgba(255, 107, 107, 0.1)',
                                                                color: '#ff6b6b',
                                                                fontWeight: '500',
                                                                padding: '6px 12px',
                                                                borderRadius: '30px'
                                                            }}>
                                                                <i className="bi bi-calendar-event me-1"></i> {assignment.due_date_formatted}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        {assignment.submission_date_formatted ? (
                                                            <span className="badge" style={{
                                                                background: 'rgba(25, 135, 84, 0.1)',
                                                                color: '#198754',
                                                                fontWeight: '500',
                                                                padding: '5px 10px',
                                                                borderRadius: '30px'
                                                            }}>
                                                                <i className="bi bi-check-circle me-1"></i>
                                                                {assignment.submission_date_formatted}
                                                            </span>
                                                        ) : (
                                                            <span className="badge" style={{
                                                                background: 'rgba(255, 193, 7, 0.1)',
                                                                color: '#ffc107',
                                                                fontWeight: '500',
                                                                padding: '5px 10px',
                                                                borderRadius: '30px'
                                                            }}>
                                                                <i className="bi bi-clock me-1"></i>
                                                                Not Submitted
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        <div className="files-column d-flex flex-column gap-2">
                                                            {assignment.assignment_file ? (
                                                                <div className="assignment-file" style={{
                                                                    borderRadius: '8px',
                                                                    background: 'rgba(25, 135, 84, 0.05)',
                                                                    border: '1px solid rgba(25, 135, 84, 0.1)',
                                                                    padding: '6px 10px',
                                                                }}>
                                                                    <a
                                                                        href={formatFileUrl(assignment.assignment_file)}
                                                                        className="d-flex align-items-center gap-2 text-decoration-none"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <i className="bi bi-file-earmark-arrow-down" style={{ color: '#198754', fontSize: '0.9rem' }}></i>
                                                                        <span style={{ color: '#198754', fontSize: '0.85rem', fontWeight: '500' }}>Materials</span>
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <div className="no-materials d-flex align-items-center" style={{
                                                                    padding: '6px 10px'
                                                                }}>
                                                                    <i className="bi bi-dash-circle me-2" style={{ color: '#6c757d', fontSize: '0.9rem' }}></i>
                                                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>No materials</span>
                                                                </div>
                                                            )}

                                                            {assignment.submitted_file ? (
                                                                <div className="submission-file" style={{
                                                                    borderRadius: '8px',
                                                                    background: 'rgba(13, 110, 253, 0.05)',
                                                                    border: '1px solid rgba(13, 110, 253, 0.1)',
                                                                    padding: '6px 10px',
                                                                }}>
                                                                    <a
                                                                        href={formatFileUrl(assignment.submitted_file)}
                                                                        className="d-flex align-items-center gap-2 text-decoration-none"
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <i className="bi bi-file-earmark-text" style={{ color: '#0d6efd', fontSize: '0.9rem' }}></i>
                                                                        <span style={{ color: '#0d6efd', fontSize: '0.85rem', fontWeight: '500' }}>Submission</span>
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <div className="no-submission d-flex align-items-center" style={{
                                                                    padding: '6px 10px'
                                                                }}>
                                                                    <i className="bi bi-x-circle me-2" style={{ color: '#6c757d', fontSize: '0.9rem' }}></i>
                                                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>No submission</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        {assignment.grade ? (
                                                            <div className="grade-badge text-center">
                                                                <span className="badge" style={{
                                                                    background: assignment.grade === 'A' ? 'rgba(25, 135, 84, 0.1)' :
                                                                        assignment.grade === 'B' ? 'rgba(25, 135, 84, 0.1)' :
                                                                            assignment.grade === 'C' ? 'rgba(13, 110, 253, 0.1)' :
                                                                                assignment.grade === 'D' ? 'rgba(255, 193, 7, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                                                                    color: assignment.grade === 'A' ? '#198754' :
                                                                        assignment.grade === 'B' ? '#198754' :
                                                                            assignment.grade === 'C' ? '#0d6efd' :
                                                                                assignment.grade === 'D' ? '#ffc107' : '#dc3545',
                                                                    fontWeight: '600',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '30px',
                                                                    fontSize: '1rem',
                                                                    display: 'inline-block',
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    lineHeight: '28px'
                                                                }}>
                                                                    {assignment.grade}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>N/A</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        {editingAssignment === assignment.id ? (
                                                            <div className="d-flex flex-column gap-2">
                                                                <button
                                                                    className="btn btn-sm w-100"
                                                                    onClick={handleUpdate}
                                                                    style={{
                                                                        background: 'rgba(25, 135, 84, 0.1)',
                                                                        color: '#198754',
                                                                        border: 'none',
                                                                        borderRadius: '50px',
                                                                        padding: '0.35rem 0.8rem',
                                                                        fontWeight: '500',
                                                                        fontSize: '0.85rem'
                                                                    }}
                                                                >
                                                                    <i className="bi bi-check2 me-1"></i> Save
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm w-100"
                                                                    onClick={() => setEditingAssignment(null)}
                                                                    style={{
                                                                        background: '#f8f9fa',
                                                                        color: '#506690',
                                                                        border: 'none',
                                                                        borderRadius: '50px',
                                                                        padding: '0.35rem 0.8rem',
                                                                        fontWeight: '500',
                                                                        fontSize: '0.85rem'
                                                                    }}
                                                                >
                                                                    <i className="bi bi-x me-1"></i> Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="d-flex flex-column gap-2">
                                                                <button
                                                                    className="btn btn-sm w-100 text-start"
                                                                    onClick={() => handleEdit(assignment)}
                                                                    style={{
                                                                        background: 'rgba(13, 110, 253, 0.1)',
                                                                        color: '#0d6efd',
                                                                        border: 'none',
                                                                        borderRadius: '50px',
                                                                        padding: '0.35rem 0.8rem',
                                                                        fontWeight: '500',
                                                                        fontSize: '0.85rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center'
                                                                    }}
                                                                >
                                                                    <i className="bi bi-pencil me-1"></i>
                                                                    <span>Edit</span>
                                                                </button>

                                                                <div className="grading-container d-flex align-items-center gap-2 w-100">
                                                                    <span className="grade-label" style={{
                                                                        fontSize: '0.8rem',
                                                                        color: '#506690',
                                                                        width: '40px',
                                                                        whiteSpace: 'nowrap'
                                                                    }}>Grade:</span>
                                                                    <select
                                                                        className="form-select form-select-sm flex-grow-1"
                                                                        style={{
                                                                            padding: '0.25rem 0.5rem',
                                                                            borderRadius: '10px',
                                                                            border: '1px solid #e2e8f0',
                                                                            boxShadow: 'none',
                                                                            fontSize: '0.85rem'
                                                                        }}
                                                                        value={assignment.grade || ''}
                                                                        onChange={(e) => handleGrade(assignment.id, e.target.value)}
                                                                        disabled={!assignment.submission_date}
                                                                    >
                                                                        <option value="">-</option>
                                                                        <option value="A">A</option>
                                                                        <option value="B">B</option>
                                                                        <option value="C">C</option>
                                                                        <option value="D">D</option>
                                                                        <option value="F">F</option>
                                                                    </select>
                                                                </div>

                                                                <button
                                                                    className="btn btn-sm w-100 text-start"
                                                                    onClick={() => handleDelete(assignment.id)}
                                                                    style={{
                                                                        background: 'rgba(220, 53, 69, 0.1)',
                                                                        color: '#dc3545',
                                                                        border: 'none',
                                                                        borderRadius: '50px',
                                                                        padding: '0.35rem 0.8rem',
                                                                        fontWeight: '500',
                                                                        fontSize: '0.85rem',
                                                                        display: 'flex',
                                                                        alignItems: 'center'
                                                                    }}
                                                                >
                                                                    <i className="bi bi-trash me-1"></i>
                                                                    <span>Delete</span>
                                                                </button>
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

export default CheckAssignments;