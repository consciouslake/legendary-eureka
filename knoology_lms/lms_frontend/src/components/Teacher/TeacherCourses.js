import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import TeacherSidebar from './TeacherSidebar';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

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
      <p className="mt-3 text-muted">Loading courses...</p>
    </div>
  );
};

function TeacherCourses() {
  const navigate = useNavigate();
  const [coursesData, setCourses] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "My Courses | Knoology LMS";
    // Check if teacher is logged in
    const teacherData = localStorage.getItem('teacherData');
    if (!teacherData) {
      navigate('/teacher-login');
      return;
    }

    const { teacherId } = JSON.parse(teacherData);

    // Fetch teacher's courses
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BASE_API_URL}/teacher-courses/${teacherId}/`);
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setErrorMsg('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  const handleDeleteCourse = async (courseId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BASE_API_URL}/course/${courseId}/`);
          setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
          Swal.fire(
            'Deleted!',
            'Your course has been deleted.',
            'success'
          );
        } catch (error) {
          console.error('Error deleting course:', error);
          Swal.fire(
            'Error!',
            'Failed to delete course. Please try again later.',
            'error'
          );
        }
      }
    });
  };

  const handleViewEnrolledStudents = async (courseId, courseTitle) => {
    try {
      const response = await axios.get(`${BASE_API_URL}/course-enrolled-students/${courseId}/`);
      const students = response.data.data;

      if (students.length === 0) {
        Swal.fire({
          title: 'No Students',
          text: 'No students enrolled in this course yet.',
          icon: 'info'
        });
        return;
      }

      let studentsHtml = `
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(student => `
                <tr>
                  <td>${student.id}</td>
                  <td>${student.fullname}</td>
                  <td>${student.username}</td>
                  <td>${student.email}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>`;

      await Swal.fire({
        title: `Enrolled Students - ${courseTitle}`,
        html: studentsHtml,
        width: '800px',
        confirmButtonText: 'Close',
        customClass: {
          htmlContainer: 'swal-html-container'
        }
      });
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load enrolled students. Please try again later.',
        icon: 'error'
      });
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
            background: 'linear-gradient(135deg, #1a56c9 0%, #002254 100%)',
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
                  background: 'linear-gradient(45deg, #002254, #1a56c9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px',
                  boxShadow: '0 10px 20px rgba(0, 34, 84, 0.3)'
                }}>
                  <i className="bi bi-journal-bookmark" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                </div>

                <div>
                  <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                    My Courses
                  </h3>
                  <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Manage your course content and settings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Course Management */}
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
                  background: 'linear-gradient(135deg, rgba(26, 86, 201, 0.1), rgba(0, 34, 84, 0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px'
                }}>
                  <i className="bi bi-grid-3x3-gap" style={{
                    color: '#1a56c9',
                    fontSize: '1.2rem'
                  }}></i>
                </div>
                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                  Course List ({coursesData.length})
                </h5>
              </div>
              <Link to="/add-courses" className="btn" style={{
                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                color: 'white',
                fontWeight: '500',
                borderRadius: '50px',
                padding: '0.6rem 1.5rem',
                border: 'none',
                boxShadow: '0 5px 15px rgba(8, 174, 234, 0.2)'
              }}>
                <i className="bi bi-plus-circle me-2"></i>
                Add New Course
              </Link>
            </div>
            <div className="section-body">
              {loading ? (
                <div className="p-4">
                  <Loader size="medium" />
                </div>
              ) : errorMsg ? (
                <div className="alert m-4" style={{
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
                      <p className="mb-0">{errorMsg}</p>
                    </div>
                  </div>
                </div>
              ) : coursesData.length === 0 ? (
                <div className="empty-state p-5 text-center">
                  <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(26, 86, 201, 0.1), rgba(0, 34, 84, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <i className="bi bi-journal-plus" style={{
                      color: '#1a56c9',
                      fontSize: '2rem'
                    }}></i>
                  </div>
                  <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Courses Yet</h5>
                  <p className="text-muted mb-4">You haven't created any courses yet. Start by adding your first course!</p>
                  <Link to="/add-courses" className="btn" style={{
                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                    color: 'white',
                    fontWeight: '500',
                    borderRadius: '50px',
                    padding: '0.6rem 1.5rem',
                    border: 'none',
                    boxShadow: '0 5px 15px rgba(8, 174, 234, 0.2)'
                  }}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Your First Course
                  </Link>
                </div>
              ) : (
                <div className="table-responsive p-4">
                  <table className="table table-hover" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(26, 86, 201, 0.03)' }}>
                        <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Name</th>
                        <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Category</th>
                        <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Image</th>
                        <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Enrolled</th>
                        <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Rating</th>
                        <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coursesData.map((course) => (
                        <tr key={course.id} style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '10px' }}>
                          <td style={{ padding: '15px', fontWeight: '500', color: '#002254' }}>
                            <Link to={`/teacher-course-chapters/${course.id}`} style={{ color: '#002254', textDecoration: 'none' }}>
                              {course.title}
                            </Link>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <span className="badge" style={{
                              background: 'rgba(26, 86, 201, 0.1)',
                              color: '#1a56c9',
                              fontWeight: '600',
                              padding: '5px 10px',
                              borderRadius: '30px'
                            }}>
                              {course.category.title}
                            </span>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <img src={course.featured_img} alt={course.title} style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '2px solid #f0f0f0'
                            }} />
                          </td>
                          <td style={{ padding: '15px' }}>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleViewEnrolledStudents(course.id, course.title)}
                              style={{
                                background: 'rgba(40, 167, 69, 0.1)',
                                color: '#28a745',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.3rem 0.8rem',
                                fontWeight: '500'
                              }}
                            >
                              <i className="bi bi-people me-1"></i>
                              {course.total_enrolled || 0} Students
                            </button>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div className="d-flex align-items-center">
                              <i className="bi bi-star-fill me-1" style={{ color: '#ffc107' }}></i>
                              <span>{course.average_rating ? Number(course.average_rating).toFixed(2) : 'N/A'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '15px' }}>
                            <div className="d-flex flex-wrap gap-2">
                              <Link to={`/edit-course/${course.id}`} className="btn btn-sm" style={{
                                background: 'rgba(26, 86, 201, 0.1)',
                                color: '#1a56c9',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.3rem 0.8rem',
                                fontWeight: '500'
                              }}>
                                <i className="bi bi-pencil me-1"></i> Edit
                              </Link>
                              <button
                                className="btn btn-sm"
                                onClick={() => handleDeleteCourse(course.id)}
                                style={{
                                  background: 'rgba(220, 53, 69, 0.1)',
                                  color: '#dc3545',
                                  border: 'none',
                                  borderRadius: '50px',
                                  padding: '0.3rem 0.8rem',
                                  fontWeight: '500'
                                }}
                              >
                                <i className="bi bi-trash me-1"></i> Delete
                              </button>
                              <Link to={`/add-chapter/${course.id}`} className="btn btn-sm" style={{
                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.3rem 0.8rem',
                                fontWeight: '500',
                                boxShadow: '0 2px 5px rgba(8, 174, 234, 0.2)'
                              }}>
                                <i className="bi bi-plus-circle me-1"></i> Add Chapter
                              </Link>
                              <Link to={`/teacher-study-materials/${course.id}`} className="btn btn-sm" style={{
                                background: 'rgba(255, 193, 7, 0.1)',
                                color: '#ffc107',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '0.3rem 0.8rem',
                                fontWeight: '500'
                              }}>
                                <i className="bi bi-file-earmark-text me-1"></i> Study Materials
                              </Link>
                            </div>
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

export default TeacherCourses;