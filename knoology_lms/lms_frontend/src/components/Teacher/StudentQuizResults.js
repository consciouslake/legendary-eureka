import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../../config';
import TeacherSidebar from './TeacherSidebar';

// Reusable loader component
const Loader = ({ size = "medium", message = "Loading..." }) => {
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
            color: '#8e44ad',
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
      <p className="mt-3 text-muted">{message}</p>
    </div>
  );
};

// Alert component
const Alert = ({ type, title, message }) => {
  const colors = {
    error: {
      bg: 'rgba(220, 53, 69, 0.1)',
      color: '#dc3545',
      icon: 'bi-exclamation-triangle-fill'
    },
    info: {
      bg: 'rgba(13, 202, 240, 0.1)',
      color: '#0dcaf0',
      icon: 'bi-info-circle-fill'
    }
  };

  const style = colors[type] || colors.info;

  return (
    <div style={{
      background: style.bg,
      color: style.color,
      padding: '20px',
      borderRadius: '15px',
      border: 'none'
    }}>
      <div className="d-flex">
        <div style={{ marginRight: '15px' }}>
          <i className={`bi ${style.icon}`} style={{ fontSize: '1.5rem' }}></i>
        </div>
        <div>
          <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>{title}</h6>
          <p className="mb-0">{message}</p>
        </div>
      </div>
    </div>
  );
};

function StudentQuizResults() {
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    averageScore: 0,
    passRate: 0,
    totalAttempts: 0
  });
  const [teacherId, setTeacherId] = useState(null);

  const { student_id } = useParams();

  // Fetch quiz results for enrolled students
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on load
    document.title = "Student Quiz Results | Knoology LMS";

    const fetchQuizResults = async () => {
      try {
        // Get teacher ID from localStorage
        const teacherData = localStorage.getItem('teacherData');
        if (!teacherData) {
          setError('Authentication required. Please login again.');
          setLoading(false);
          return;
        }

        const { teacherId } = JSON.parse(teacherData);
        setTeacherId(teacherId);

        setLoading(true);
        // If student_id is provided, fetch results for that student
        // Otherwise fetch all results for teacher's students
        const endpoint = student_id
          ? `${apiUrl}/teacher-student-quiz-attempts/${teacherId}/${student_id}/`
          : `${apiUrl}/teacher-all-quiz-attempts/${teacherId}/`;

        const response = await axios.get(endpoint);
        if (response.data && response.data.status === 'success') {
          setQuizResults(response.data.data);
          calculateAnalytics(response.data.data);

          // If viewing a specific student's results, set them as selected
          if (student_id && response.data.data.length > 0) {
            const studentData = response.data.data.find(result =>
              result.student.toString() === student_id
            );
            if (studentData) {
              setSelectedStudent(studentData);
            }
          }
        } else {
          throw new Error('Failed to fetch quiz results');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, [student_id]);

  // Calculate analytics from quiz results
  const calculateAnalytics = (results) => {
    if (!results || results.length === 0) {
      return;
    }

    // Calculate average score based on percentage, not raw scores
    const totalPercentage = results.reduce((sum, attempt) => {
      const percentage = (attempt.total_score / attempt.total_questions) * 100;
      return sum + percentage;
    }, 0);
    const averageScore = totalPercentage / results.length;

    // Calculate pass rate (assuming 60% is passing)
    const passingThreshold = 60;
    const passCount = results.filter(attempt =>
      (attempt.total_score / attempt.total_questions * 100) >= passingThreshold
    ).length;
    const passRate = (passCount / results.length) * 100;

    setAnalyticsData({
      averageScore: averageScore.toFixed(2),
      passRate: passRate.toFixed(2),
      totalAttempts: results.length
    });
  };

  // Handle selecting a student to view their results
  const handleStudentSelect = async (student) => {
    console.log("Selected student data:", student);

    // If questions_data is missing, fetch it directly from the API
    if (!student.questions_data) {
      try {
        // Make sure to include teacher ID in the request to verify permissions
        const response = await axios.get(`${apiUrl}/teacher-student-quiz-attempts/${teacherId}/${student.student}/`);
        if (response.data.status === 'success') {
          // Find the matching attempt for this student and quiz
          const matchingAttempt = response.data.data.find(
            item => item.id === student.id ||
              (item.student === student.student && item.quiz === student.quiz)
          );
          if (matchingAttempt && matchingAttempt.questions_data) {
            student = { ...student, questions_data: matchingAttempt.questions_data };
            console.log("Enhanced student data with questions:", student);
          }
        }
      } catch (err) {
        console.error("Error fetching detailed student data:", err);
      }
    }

    setSelectedStudent(student);
    // Scroll to top to view student details
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get percentage score
  const getPercentage = (score, total) => {
    return ((score / total) * 100).toFixed(2);
  };

  // Get status badge based on percentage
  const getStatusBadge = (score, total) => {
    const percentage = (score / total) * 100;

    if (percentage >= 80) {
      return (
        <span style={{
          background: 'linear-gradient(45deg, rgba(25, 135, 84, 0.1), rgba(40, 167, 69, 0.1))',
          color: '#198754',
          padding: '6px 12px',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: '500',
        }}>
          <i className="bi bi-check-circle-fill me-1"></i>
          Excellent
        </span>
      );
    } else if (percentage >= 60) {
      return (
        <span style={{
          background: 'linear-gradient(45deg, rgba(23, 162, 184, 0.1), rgba(13, 202, 240, 0.1))',
          color: '#17a2b8',
          padding: '6px 12px',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: '500',
        }}>
          <i className="bi bi-check-circle me-1"></i>
          Pass
        </span>
      );
    } else {
      return (
        <span style={{
          background: 'linear-gradient(45deg, rgba(220, 53, 69, 0.1), rgba(255, 107, 129, 0.1))',
          color: '#dc3545',
          padding: '6px 12px',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: '500',
        }}>
          <i className="bi bi-x-circle me-1"></i>
          Fail
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="container-fluid pb-4 px-4" style={{ paddingTop: '120px' }}>
        <div className="row g-4">
          <div className="col-md-3">
            <TeacherSidebar />
          </div>
          <div className="col-md-9">
            <Loader message="Loading quiz results..." size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid pb-4 px-4" style={{ paddingTop: '120px' }}>
        <div className="row g-4">
          <div className="col-md-3">
            <TeacherSidebar />
          </div>
          <div className="col-md-9">
            <Alert type="error" title="Error" message={error} />
          </div>
        </div>
      </div>
    );
  }

  // If no quiz attempts are available, show a message instead
  if (quizResults.length === 0) {
    return (
      <div className="container-fluid pb-4 px-4" style={{ paddingTop: '120px' }}>
        <div className="row g-4">
          <div className="col-md-3">
            <TeacherSidebar />
          </div>
          <div className="col-md-9">
            <div style={{
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            }}>
              <div className="py-5 px-4 text-center">
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
                  <i className="bi bi-clipboard-data" style={{ fontSize: '2rem', color: '#8e44ad' }}></i>
                </div>
                <h3 style={{ fontWeight: '600', color: '#495057', marginBottom: '16px' }}>No Quiz Results Available</h3>
                <p className="text-muted mb-0">No students have attempted quizzes yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid pb-4 px-4" style={{ paddingTop: '120px' }}>
      <div className="row g-4">
        <div className="col-md-3">
          <TeacherSidebar />
        </div>
        <div className="col-md-9">
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
                  <i className="bi bi-clipboard-data" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                    Student Quiz Results
                  </h3>
                  <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    <span style={{ fontWeight: '600' }}>{quizResults.length}</span> quiz attempts recorded
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}>
                <div className="d-flex align-items-center mb-3">
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '12px',
                    background: 'rgba(13, 202, 240, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px'
                  }}>
                    <i className="bi bi-percent" style={{ fontSize: '1.2rem', color: '#0dcaf0' }}></i>
                  </div>
                  <h5 className="mb-0" style={{ fontWeight: '600', color: '#495057' }}>Average Score</h5>
                </div>
                <div className="text-center mt-4">
                  <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#0dcaf0',
                    marginBottom: '5px'
                  }}>{analyticsData.averageScore}%</h2>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>across all attempts</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}>
                <div className="d-flex align-items-center mb-3">
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '12px',
                    background: 'rgba(25, 135, 84, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px'
                  }}>
                    <i className="bi bi-graph-up-arrow" style={{ fontSize: '1.2rem', color: '#198754' }}></i>
                  </div>
                  <h5 className="mb-0" style={{ fontWeight: '600', color: '#495057' }}>Pass Rate</h5>
                </div>
                <div className="text-center mt-4">
                  <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#198754',
                    marginBottom: '5px'
                  }}>{analyticsData.passRate}%</h2>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>students passed (60% threshold)</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
                height: '100%'
              }}>
                <div className="d-flex align-items-center mb-3">
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '12px',
                    background: 'rgba(142, 68, 173, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px'
                  }}>
                    <i className="bi bi-people" style={{ fontSize: '1.2rem', color: '#8e44ad' }}></i>
                  </div>
                  <h5 className="mb-0" style={{ fontWeight: '600', color: '#495057' }}>Total Attempts</h5>
                </div>
                <div className="text-center mt-4">
                  <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#8e44ad',
                    marginBottom: '5px'
                  }}>{analyticsData.totalAttempts}</h2>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>quiz attempts recorded</p>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Student Details */}
          {selectedStudent && (
            <div className="mb-4" style={{
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
              marginBottom: '24px',
            }}>
              <div style={{
                background: 'linear-gradient(45deg, #5b2c6f, #8e44ad)',
                padding: '20px 25px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)'
                }}></div>

                <h4 style={{
                  color: 'white',
                  fontWeight: '600',
                  marginBottom: '5px',
                  position: 'relative'
                }}>
                  <i className="bi bi-person-badge me-2"></i>
                  {selectedStudent.student_name || `Student ID: ${selectedStudent.student}`}
                </h4>
                <p className="mb-0" style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  position: 'relative'
                }}>
                  {selectedStudent.quiz_title || `Quiz ID: ${selectedStudent.quiz}`}
                </p>
              </div>

              <div className="p-4">
                <div className="row">
                  <div className="col-md-4">
                    <div style={{
                      background: 'rgba(142, 68, 173, 0.05)',
                      borderRadius: '15px',
                      padding: '20px'
                    }}>
                      <h5 style={{ fontWeight: '600', color: '#495057', marginBottom: '15px' }}>Result Summary</h5>

                      <div className="mb-3 d-flex justify-content-between">
                        <span style={{ color: '#6c757d' }}>Student ID:</span>
                        <span style={{ fontWeight: '500', color: '#212529' }}>{selectedStudent.student}</span>
                      </div>
                      <div className="mb-3 d-flex justify-content-between">
                        <span style={{ color: '#6c757d' }}>Username:</span>
                        <span style={{ fontWeight: '500', color: '#212529' }}>{selectedStudent.username || 'N/A'}</span>
                      </div>
                      <div className="mb-3 d-flex justify-content-between">
                        <span style={{ color: '#6c757d' }}>Score:</span>
                        <span style={{
                          fontWeight: '600',
                          color: '#8e44ad'
                        }}>{selectedStudent.obtained_marks}/{selectedStudent.total_marks}</span>
                      </div>
                      <div className="mb-3 d-flex justify-content-between">
                        <span style={{ color: '#6c757d' }}>Percentage:</span>
                        <span style={{ fontWeight: '600', color: '#8e44ad' }}>
                          {getPercentage(selectedStudent.total_score, selectedStudent.total_questions)}%
                        </span>
                      </div>
                      <div className="mb-3 d-flex justify-content-between">
                        <span style={{ color: '#6c757d' }}>Attempt Date:</span>
                        <span style={{ fontWeight: '500', color: '#212529' }}>
                          {new Date(selectedStudent.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="mb-3 d-flex justify-content-between">
                        <span style={{ color: '#6c757d' }}>Status:</span>
                        <span>
                          {getStatusBadge(selectedStudent.total_score, selectedStudent.total_questions)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-8">
                    <h5 style={{
                      fontWeight: '600',
                      color: '#495057',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <i className="bi bi-list-check me-2" style={{ color: '#8e44ad' }}></i>
                      Question-wise Performance
                    </h5>

                    {selectedStudent.questions_data ? (
                      (() => {
                        try {
                          const questionsData = typeof selectedStudent.questions_data === 'string'
                            ? JSON.parse(selectedStudent.questions_data)
                            : selectedStudent.questions_data;

                          if (Array.isArray(questionsData) && questionsData.length > 0) {
                            return questionsData.map((question, index) => (
                              <div key={index} style={{
                                padding: '15px',
                                background: question.is_correct
                                  ? 'rgba(25, 135, 84, 0.05)'
                                  : 'rgba(220, 53, 69, 0.05)',
                                borderRadius: '12px',
                                marginBottom: '15px',
                                borderLeft: question.is_correct
                                  ? '4px solid #198754'
                                  : '4px solid #dc3545'
                              }}>
                                <div className="mb-2">
                                  <span style={{
                                    display: 'inline-block',
                                    background: question.is_correct ? '#198754' : '#dc3545',
                                    color: 'white',
                                    width: '24px',
                                    height: '24px',
                                    textAlign: 'center',
                                    lineHeight: '24px',
                                    borderRadius: '50%',
                                    fontSize: '0.75rem',
                                    marginRight: '10px',
                                    fontWeight: '600'
                                  }}>
                                    {index + 1}
                                  </span>
                                  <span style={{ fontWeight: '500', color: '#212529' }}>
                                    {question.question_text}
                                  </span>
                                </div>
                                <div className="ps-4 pt-1">
                                  <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                                    <span style={{ color: '#6c757d', display: 'inline-block', width: '120px' }}>Your Answer:</span>
                                    <span style={{
                                      fontWeight: '500',
                                      color: question.is_correct ? '#198754' : '#dc3545',
                                    }}>
                                      {question.selected_option}
                                    </span>
                                  </p>
                                  <p className="mb-1" style={{ fontSize: '0.95rem' }}>
                                    <span style={{ color: '#6c757d', display: 'inline-block', width: '120px' }}>Correct Answer:</span>
                                    <span style={{ fontWeight: '500', color: '#198754' }}>
                                      {question.correct_option}
                                    </span>
                                  </p>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '3px 10px',
                                    borderRadius: '50px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    background: question.is_correct
                                      ? 'rgba(25, 135, 84, 0.1)'
                                      : 'rgba(220, 53, 69, 0.1)',
                                    color: question.is_correct ? '#198754' : '#dc3545',
                                  }}>
                                    {question.is_correct
                                      ? <><i className="bi bi-check-circle-fill me-1"></i>Correct</>
                                      : <><i className="bi bi-x-circle-fill me-1"></i>Incorrect</>}
                                  </span>
                                </div>
                              </div>
                            ));
                          } else {
                            return <Alert type="info" title="No Details" message="No detailed question data available for this attempt." />;
                          }
                        } catch (error) {
                          console.error("Error parsing questions data:", error);
                          return <Alert type="error" title="Error" message="Error displaying question details. Data format may be incorrect." />;
                        }
                      })()
                    ) : (
                      <Alert type="info" title="No Data" message="No question data available for this quiz attempt." />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Student Results Table */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            marginBottom: '30px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '20px 25px',
              borderBottom: '1px solid #f0f0f0'
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
                <i className="bi bi-table" style={{
                  color: '#8e44ad',
                  fontSize: '1.2rem'
                }}></i>
              </div>
              <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                All Student Quiz Attempts
              </h5>
            </div>

            <div className="p-4">
              <div className="table-responsive">
                <table className="table" style={{
                  borderCollapse: 'separate',
                  borderSpacing: '0 10px'
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
                      }}>Student</th>
                      <th style={{
                        padding: '12px 16px',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                      }}>Username</th>
                      <th style={{
                        padding: '12px 16px',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                      }}>Quiz</th>
                      <th style={{
                        padding: '12px 16px',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                      }}>Score</th>
                      <th style={{
                        padding: '12px 16px',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                      }}>Percentage</th>
                      <th style={{
                        padding: '12px 16px',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                      }}>Date</th>
                      <th style={{
                        padding: '12px 16px',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                      }}>Status</th>
                      <th style={{
                        padding: '12px 16px',
                        fontWeight: '600',
                        color: '#495057',
                        borderBottom: '2px solid rgba(142, 68, 173, 0.1)'
                      }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizResults.map((result, index) => (
                      <tr key={index} style={{
                        background: 'white',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                        borderRadius: '10px',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: '500', color: '#212529' }}>
                            {result.student_name || `Student ID: ${result.student}`}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {result.username || 'N/A'}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ color: '#6c757d' }}>
                            {result.quiz_title || `Quiz ID: ${result.quiz}`}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '50px',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            background: 'rgba(142, 68, 173, 0.1)',
                            color: '#8e44ad'
                          }}>
                            {result.obtained_marks}/{result.total_marks}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          {getPercentage(result.total_score, result.total_questions)}%
                        </td>
                        <td style={{ padding: '16px' }}>
                          {new Date(result.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {getStatusBadge(result.total_score, result.total_questions)}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => handleStudentSelect(result)}
                            className="btn"
                            style={{
                              background: 'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50px',
                              padding: '0.4rem 0.8rem',
                              fontWeight: '500'
                            }}
                          >
                            <i className="bi bi-eye-fill me-1"></i>
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentQuizResults;