import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import SEO from "./SEO";

const baseUrl = 'http://127.0.0.1:8000/api';
const mediaUrl = 'http://127.0.0.1:8000';

function Home() {
  const [latestCourses, setLatestCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]); // For logged in teacher
  const [teacherLoginStatus, setTeacherLoginStatus] = useState(localStorage.getItem('teacherLoginStatus') || 'false');
  const [studentLoginStatus, setStudentLoginStatus] = useState(localStorage.getItem('studentInfo') ? 'true' : 'false');
  const [featuredTeachers, setFeaturedTeachers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalLessons: 0
  });

  useEffect(() => {
    document.title = "Knoology LMS - Home";

    const fetchData = async () => {
      try {
        setLoading(true);

        // Check if teacher is logged in
        if (teacherLoginStatus === 'true') {
          const teacherData = JSON.parse(localStorage.getItem('teacherData'));
          if (teacherData && teacherData.teacherId) {
            const myCoursesResponse = await axios.get(`${baseUrl}/teacher-courses/${teacherData.teacherId}/`);
            setMyCourses(myCoursesResponse.data);
          }
        }

        // Fetch latest courses (always fetch for stats, but conditionally render)
        const latestResponse = await axios.get(`${baseUrl}/course/`);
        // Get the latest 4 courses
        setLatestCourses(latestResponse.data.slice(0, 4));

        // Set total courses for stats
        setStats(prev => ({ ...prev, totalCourses: latestResponse.data.length }));

        // Fetch all courses for popular courses
        const allCoursesResponse = await axios.get(`${baseUrl}/course/`);
        // Sort courses by average_rating in descending order
        const sortedCourses = allCoursesResponse.data.sort((a, b) => {
          const ratingA = a.average_rating || 0;
          const ratingB = b.average_rating || 0;
          return ratingB - ratingA;
        });

        // Get the top 4 popular courses
        setPopularCourses(sortedCourses.slice(0, 4));

        // Fetch all teachers
        const teachersResponse = await axios.get(`${baseUrl}/teacher/`);

        // Set total teachers for stats
        setStats(prev => ({ ...prev, totalTeachers: teachersResponse.data.length }));

        // Get teacher course counts - need to count how many courses each teacher has uploaded
        const teacherCourseCountMap = {};
        allCoursesResponse.data.forEach(course => {
          if (course.teacher && course.teacher.id) {
            const teacherId = course.teacher.id;
            teacherCourseCountMap[teacherId] = (teacherCourseCountMap[teacherId] || 0) + 1;
          }
        });

        // Add course count to teachers and filter/sort
        const teachersWithCourseCount = teachersResponse.data
          .map(teacher => ({
            ...teacher,
            courseCount: teacherCourseCountMap[teacher.id] || 0
          }))
          // Filter to only include teachers who have uploaded at least one course
          .filter(teacher => teacher.courseCount > 0)
          // Sort teachers by number of courses in descending order
          .sort((a, b) => b.courseCount - a.courseCount);

        // Get the top 4 featured teachers
        setFeaturedTeachers(teachersWithCourseCount.slice(0, 4));

        // Fetch top course ratings for testimonials
        const testimonialsResponse = await axios.get(`${baseUrl}/get-top-course-ratings/`);
        if (testimonialsResponse.data.status === 'success') {
          setTestimonials(testimonialsResponse.data.data);
        }

        // Estimate total students (this is just for demo - in a real app we'd fetch actual student count)
        // Here we're assuming each course has an average of 15 enrolled students
        const estimatedStudents = Math.min(10000, allCoursesResponse.data.length * 15);
        setStats(prev => ({ ...prev, totalStudents: estimatedStudents }));

        // Estimate total lessons (this is just for demo - in a real app we'd fetch actual lesson count)
        // Here we're assuming each course has an average of 8 lessons
        const estimatedLessons = allCoursesResponse.data.length * 8;
        setStats(prev => ({ ...prev, totalLessons: estimatedLessons }));

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add this reusable loader component before the return statement
  const Loader = ({ size = "medium" }) => {
    const dimensions = {
      small: { width: "30px", height: "30px" },
      medium: { width: "40px", height: "40px" },
      large: { width: "60px", height: "60px" }
    };

    return (
      <div className="text-center py-5">
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
        <p className="mt-3 text-muted">Loading content...</p>
      </div>
    );
  };

  return (
    <div>
      <SEO
        title="Home"
        description="Welcome to Knoology LMS - Your gateway to expert-led courses and interactive learning."
      />

      {/* Hero Section */}
      <section className="hero-section" style={{
        background: 'var(--hero-bg)',
        color: 'white',
        position: 'relative',
        paddingTop: '8rem', // Increased padding
        paddingBottom: '10rem', // Increased padding
        marginBottom: '5rem',
        overflow: 'hidden'
      }}>
        {/* Abstract background elements */}
        <div className="hero-bg" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.15, // Slightly increased opacity
          background: 'url("https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2020&q=80") center center/cover no-repeat'
        }}></div>
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0 animate-fade-in"> { /* Added animate-fade-in */}
              <h1 className="fw-bold mb-4" style={{ fontSize: '3.5rem', lineHeight: 1.2, letterSpacing: '-1px' }}>
                {teacherLoginStatus === 'true' ? (
                  <>
                    Welcome Back, <span style={{
                      background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>Instructor</span>
                  </>
                ) : (
                  <>
                    Transform Your Learning Journey with <span style={{
                      background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>Knoology</span>
                  </>
                )}
              </h1>
              <p className="lead mb-5" style={{ fontSize: '1.25rem', lineHeight: 1.8, opacity: 0.9 }}>
                {teacherLoginStatus === 'true'
                  ? "Manage your courses, track student progress, and create engaging content for your students."
                  : "Discover, learn, and excel with our cutting-edge learning management system. Connect with top educators and access quality courses that elevate your skills to the next level."
                }
              </p>
              <div className="d-flex gap-3 flex-wrap">
                {teacherLoginStatus === 'true' ? (
                  <Link to="/teacher-dashboard" className="btn btn-lg" style={{
                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '50px',
                    padding: '1rem 2.5rem',
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(42, 245, 152, 0.4)'
                  }}>Go to Dashboard</Link>
                ) : (
                  <>
                    <Link to="/all-courses" className="btn btn-lg" style={{
                      background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                      color: 'white',
                      fontWeight: '600',
                      borderRadius: '50px',
                      padding: '1rem 2.5rem',
                      border: 'none',
                      boxShadow: '0 10px 30px rgba(42, 245, 152, 0.4)'
                    }}>Explore Courses</Link>
                    {studentLoginStatus !== 'true' && (
                      <Link to="/user-register" className="btn btn-lg" style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontWeight: '600',
                        borderRadius: '50px',
                        padding: '1rem 2.5rem',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>Sign Up Free</Link>
                    )}
                    {studentLoginStatus === 'true' && (
                      <Link to="/user-dashboard" className="btn btn-lg" style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontWeight: '600',
                        borderRadius: '50px',
                        padding: '1rem 2.5rem',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>My Dashboard</Link>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="col-lg-6 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}> {/* Added animate-fade-in with delay */}
              <img src="/hero-illustration.svg" alt="Education illustration" className="img-fluid" style={{
                maxWidth: '90%',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))',
                transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)',
                transition: 'transform 0.5s ease'
              }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(2deg) scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'perspective(1000px) rotateY(-10deg) rotateX(5deg)'}
                onError={(e) => {
                  // Fallback if SVG isn't available
                  e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
                  e.target.style.borderRadius = '20px';
                  e.target.style.maxHeight = '400px';
                  e.target.style.objectFit = 'cover';
                  e.target.style.transform = 'none'; // Reset transform for photo fallback
                }} />
            </div>
          </div>
        </div>

        {/* Wave shape divider at bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          overflow: 'hidden',
          lineHeight: 0,
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{
            position: 'relative',
            display: 'block',
            width: 'calc(100% + 1.3px)',
            height: '120px',
            fill: 'var(--bg-primary)' // Use variable for background color
          }}>
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section - Hide for teachers */}
      {teacherLoginStatus !== 'true' && (
        <section className="stats-section py-5 mb-5">
          <div className="container">
            <div className="row g-4 text-center">
              <div className="col-md-3 col-6">
                <div className="stat-card p-4 h-100 animate-fade-in" style={{
                  background: 'var(--card-bg)',
                  borderRadius: '20px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.3s ease',
                  animationDelay: '0.3s'
                }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="stat-icon mb-3" style={{
                    width: '60px',
                    height: '60px',
                    margin: '0 auto',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                    color: 'white',
                    fontSize: '1.5rem'
                  }}>
                    <i className="bi bi-person-video3"></i>
                  </div>
                  <h2 className="fw-bold mb-0" style={{ color: '#002254', fontSize: '2.5rem' }}>{stats.totalTeachers}+</h2>
                  <p className="mb-0" style={{ color: '#506690' }}>Teachers</p>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="stat-card p-4 h-100 animate-fade-in" style={{
                  background: 'var(--card-bg)',
                  borderRadius: '20px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.3s ease',
                  animationDelay: '0.4s'
                }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="stat-icon mb-3" style={{
                    width: '60px',
                    height: '60px',
                    margin: '0 auto',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                    color: 'white',
                    fontSize: '1.5rem'
                  }}>
                    <i className="bi bi-film"></i>
                  </div>
                  <h2 className="fw-bold mb-0" style={{ color: '#002254', fontSize: '2.5rem' }}>{stats.totalLessons}+</h2>
                  <p className="mb-0" style={{ color: '#506690' }}>Lessons</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Knoology Section - Hide for teachers */}
      {teacherLoginStatus !== 'true' && (
        <div className="container mb-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '-15px',
                  width: '80%',
                  height: '80%',
                  borderRadius: '20px',
                  background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                  zIndex: -1
                }}></div>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
                  alt="Students learning"
                  className="img-fluid"
                  style={{
                    borderRadius: '20px',
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="section-title mb-4">
                <span style={{
                  color: '#08AEEA',
                  fontWeight: '600',
                  display: 'inline-block',
                  marginBottom: '10px',
                  fontSize: '1.1rem'
                }}>About Knoology</span>
                <h2 className="fw-bold" style={{ color: '#002254', fontSize: '2.5rem' }}>Empowering Education Through Technology</h2>
              </div>
              <p className="lead mb-4" style={{ color: '#506690', fontSize: '1.1rem' }}>
                Knoology is a cutting-edge learning management system designed to transform the educational experience for both educators and learners worldwide.
              </p>
              <div className="mb-4">
                <div className="d-flex mb-3">
                  <div className="feature-icon me-3" style={{
                    minWidth: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(8, 174, 234, 0.1)',
                    color: '#08AEEA',
                  }}>
                    <i className="bi bi-check2-circle"></i>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold" style={{ color: '#002254' }}>Interactive Learning</h5>
                    <p style={{ color: '#506690' }}>Engage with dynamic content, quizzes, and collaborative tools that make learning enjoyable.</p>
                  </div>
                </div>
                <div className="d-flex mb-3">
                  <div className="feature-icon me-3" style={{
                    minWidth: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(8, 174, 234, 0.1)',
                    color: '#08AEEA',
                  }}>
                    <i className="bi bi-check2-circle"></i>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold" style={{ color: '#002254' }}>Expert Instructors</h5>
                    <p style={{ color: '#506690' }}>Learn from experienced educators passionate about their subjects and teaching.</p>
                  </div>
                </div>
                <div className="d-flex">
                  <div className="feature-icon me-3" style={{
                    minWidth: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(8, 174, 234, 0.1)',
                    color: '#08AEEA',
                  }}>
                    <i className="bi bi-check2-circle"></i>
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold" style={{ color: '#002254' }}>Flexible Learning</h5>
                    <p style={{ color: '#506690' }}>Access your courses anytime, anywhere, on any device, making it easy to learn at your own pace.</p>
                  </div>
                </div>
              </div>
              <Link to="/about" className="btn" style={{
                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                color: 'white',
                fontWeight: '500',
                borderRadius: '50px',
                padding: '0.8rem 2rem',
                border: 'none',
                boxShadow: '0 4px 15px rgba(42, 245, 152, 0.3)'
              }}>Learn More About Us</Link>
            </div>
          </div>
        </div>
      )}


      {/* Teacher's My Courses Section */}
      {
        teacherLoginStatus === 'true' && (
          <section className="my-courses-section py-5 mb-5" style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: '30px',
            margin: '2rem 0',
            padding: '3rem 0'
          }}>
            <div className="container">
              <div className="row mb-4">
                <div className="col-lg-6">
                  <div className="section-title">
                    <span style={{
                      color: '#08AEEA',
                      fontWeight: '600',
                      display: 'inline-block',
                      marginBottom: '10px',
                      fontSize: '1.1rem'
                    }}>My Content</span>
                    <h2 className="fw-bold" style={{ color: '#002254', fontSize: '2.2rem' }}>My Courses</h2>
                    <p className="lead" style={{ color: '#506690' }}>Manage your created courses:</p>
                  </div>
                </div>
                <div className="col-lg-6 d-flex align-items-center justify-content-end">
                  <Link to="/add-course" className="btn" style={{
                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                    color: 'white',
                    fontWeight: '500',
                    borderRadius: '50px',
                    padding: '0.6rem 1.5rem',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(42, 245, 152, 0.3)',
                    transition: 'transform 0.3s ease'
                  }}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Add New Course
                  </Link>
                </div>
              </div>

              <div className="row g-4">
                {loading ? (
                  <div className="col-12">
                    <Loader size="medium" />
                  </div>
                ) : myCourses.length === 0 ? (
                  <div className="col-12">
                    <div className="alert" style={{
                      background: 'rgba(8, 174, 234, 0.1)',
                      color: '#08AEEA',
                      borderRadius: '15px',
                      border: 'none',
                      padding: '20px'
                    }}>
                      <i className="bi bi-info-circle me-2"></i>
                      You haven't created any courses yet. Click "Add New Course" to get started!
                    </div>
                  </div>
                ) : (
                  myCourses.map(course => (
                    <div className="col-lg-3 col-md-6" key={course.id}>
                      <div className="course-card" style={{
                        background: 'white',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        height: '100%',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        position: 'relative'
                      }}>
                        <Link to={`/detail/${course.id}`} style={{ textDecoration: 'none' }}>
                          <div className="position-relative">
                            <img
                              src={course.featured_img ?
                                (course.featured_img.startsWith('http') ?
                                  course.featured_img :
                                  `${mediaUrl}${course.featured_img}`
                                ) : "/logo512.png"}
                              alt={course.title}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover'
                              }}
                            />
                            <div className="course-overlay" style={{
                              position: 'absolute',
                              bottom: '0',
                              left: '0',
                              width: '100%',
                              background: 'linear-gradient(0deg, rgba(0,34,84,0.8) 0%, rgba(0,34,84,0) 100%)',
                              padding: '30px 20px 15px',
                            }}>
                              <div style={{
                                display: 'inline-block',
                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>Enrolled: {course.total_enrolled || 0}</div>
                            </div>
                          </div>
                          <div className="p-4 d-flex flex-column flex-grow-1">
                            <h5 style={{
                              color: '#002254',
                              fontWeight: '600',
                              marginBottom: '10px',
                              transition: 'color 0.3s ease'
                            }}>
                              {course.title}
                            </h5>
                            <div className="mt-auto d-flex justify-content-between align-items-center">
                              <span style={{ fontSize: '0.9rem', color: '#506690' }}>
                                <i className="bi bi-people me-2"></i>
                                {course.total_enrolled || 0} Students
                              </span>
                              <div>
                                <i className="bi bi-pencil-square" style={{
                                  color: '#08AEEA',
                                  fontSize: '1.2rem'
                                }}></i>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )
      }

      {/* Latest Courses - Show only if NOT teacher */}
      {
        teacherLoginStatus !== 'true' && (
          <section className="latest-courses-section section-padding" style={{
            background: 'var(--bg-secondary)',
            margin: '0',
            position: 'relative'
          }}>
            <div className="container">
              <div className="row mb-4">
                <div className="col-lg-6">
                  <div className="section-title">
                    <span style={{
                      color: '#08AEEA',
                      fontWeight: '600',
                      display: 'inline-block',
                      marginBottom: '10px',
                      fontSize: '1.1rem'
                    }}>Fresh Content</span>
                    <h2 className="fw-bold" style={{ color: '#002254', fontSize: '2.2rem' }}>Latest Courses</h2>
                    <p className="lead" style={{ color: '#506690' }}>Explore our newest educational offerings:</p>
                  </div>
                </div>
                <div className="col-lg-6 d-flex align-items-center justify-content-end">
                  <Link to="/all-courses" className="btn" style={{
                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                    color: 'white',
                    fontWeight: '500',
                    borderRadius: '50px',
                    padding: '0.6rem 1.5rem',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(42, 245, 152, 0.3)',
                    transition: 'transform 0.3s ease'
                  }}>
                    <i className="bi bi-grid me-2"></i>
                    View All Courses
                  </Link>
                </div>
              </div>

              <div className="row g-4">
                {loading ? (
                  <div className="col-12">
                    <Loader size="medium" />
                  </div>
                ) : latestCourses.length === 0 ? (
                  <div className="col-12">
                    <div className="alert" style={{
                      background: 'rgba(8, 174, 234, 0.1)',
                      color: '#08AEEA',
                      borderRadius: '15px',
                      border: 'none',
                      padding: '20px'
                    }}>
                      <i className="bi bi-info-circle me-2"></i>
                      No courses available at the moment. Check back soon!
                    </div>
                  </div>
                ) : (
                  latestCourses.map(course => (
                    <div className="col-lg-3 col-md-6" key={course.id}>
                      <div className="course-card" style={{
                        background: 'white',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-10px)';
                          e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
                        }}>
                        <Link to={`/detail/${course.id}`} style={{ textDecoration: 'none' }}>
                          <div className="position-relative">
                            <img
                              src={course.featured_img ?
                                (course.featured_img.startsWith('http') ?
                                  course.featured_img :
                                  `${mediaUrl}${course.featured_img}`
                                ) : "/logo512.png"}
                              alt={course.title}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover'
                              }}
                            />
                            <div className="course-overlay" style={{
                              position: 'absolute',
                              bottom: '0',
                              left: '0',
                              width: '100%',
                              background: 'linear-gradient(0deg, rgba(0,34,84,0.8) 0%, rgba(0,34,84,0) 100%)',
                              padding: '30px 20px 15px',
                            }}>
                              <div style={{
                                display: 'inline-block',
                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>New</div>
                            </div>
                          </div>
                          <div className="p-4 d-flex flex-column flex-grow-1">
                            <h5 style={{
                              color: '#002254',
                              fontWeight: '600',
                              marginBottom: '10px',
                              transition: 'color 0.3s ease'
                            }}>
                              {course.title}
                            </h5>
                            <p className="text-truncate text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                              {course.description || "Explore this course to learn more"}
                            </p>
                            <div className="mt-auto d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <img
                                  src="/teacher.png"
                                  alt="Teacher"
                                  style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '50%',
                                    marginRight: '10px'
                                  }}
                                />
                                <span style={{ fontSize: '0.9rem', color: '#506690' }}>
                                  {course.teacher ? course.teacher.full_name : "Instructor"}
                                </span>
                              </div>
                              <div>
                                <i className="bi bi-arrow-right-circle" style={{
                                  color: '#08AEEA',
                                  fontSize: '1.4rem'
                                }}></i>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )
      }

      {/* Popular Courses - Show only if NOT teacher */}
      {
        teacherLoginStatus !== 'true' && (
          <section className="popular-courses-section section-padding" style={{
            background: 'var(--bg-primary)'
          }}>
            <div className="container">
              <div className="row mb-4">
                <div className="col-lg-6">
                  <div className="section-title">
                    <span style={{
                      color: '#08AEEA',
                      fontWeight: '600',
                      display: 'inline-block',
                      marginBottom: '10px',
                      fontSize: '1.1rem'
                    }}>Highly Rated</span>
                    <h2 className="fw-bold" style={{ color: '#002254', fontSize: '2.2rem' }}>Popular Courses</h2>
                    <p className="lead" style={{ color: '#506690' }}>Top-rated courses chosen by our students:</p>
                  </div>
                </div>
                <div className="col-lg-6 d-flex align-items-center justify-content-end">
                  <Link to="/popular-courses" className="btn" style={{
                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                    color: 'white',
                    fontWeight: '500',
                    borderRadius: '50px',
                    padding: '0.6rem 1.5rem',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(42, 245, 152, 0.3)',
                    transition: 'transform 0.3s ease'
                  }}>
                    <i className="bi bi-star me-2"></i>
                    View All Popular Courses
                  </Link>
                </div>
              </div>

              <div className="row g-4">
                {loading ? (
                  <div className="col-12">
                    <Loader size="medium" />
                  </div>
                ) : popularCourses.length === 0 ? (
                  <div className="col-12">
                    <div className="alert" style={{
                      background: 'rgba(8, 174, 234, 0.1)',
                      color: '#08AEEA',
                      borderRadius: '15px',
                      border: 'none',
                      padding: '20px'
                    }}>
                      <i className="bi bi-info-circle me-2"></i>
                      No rated courses available at the moment. Check back soon!
                    </div>
                  </div>
                ) : (
                  popularCourses.map(course => (
                    <div className="col-lg-3 col-md-6" key={course.id}>
                      <div className="course-card" style={{
                        background: 'white',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-10px)';
                          e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
                        }}>
                        <Link to={`/detail/${course.id}`} style={{ textDecoration: 'none' }}>
                          <div className="position-relative">
                            <img
                              src={course.featured_img ?
                                (course.featured_img.startsWith('http') ?
                                  course.featured_img :
                                  `${mediaUrl}${course.featured_img}`
                                ) : "/logo512.png"}
                              alt={course.title}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover'
                              }}
                            />
                            <div className="course-overlay" style={{
                              position: 'absolute',
                              bottom: '0',
                              left: '0',
                              width: '100%',
                              background: 'linear-gradient(0deg, rgba(0,34,84,0.8) 0%, rgba(0,34,84,0) 100%)',
                              padding: '30px 20px 15px',
                            }}>
                              <div style={{
                                display: 'inline-block',
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(5px)',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                <i className="bi bi-star-fill me-1" style={{ color: '#FFD700' }}></i>
                                {(course.average_rating && course.total_ratings > 0) ? Number(course.average_rating).toFixed(1) : 'NA'}
                              </div>
                            </div>
                          </div>
                          <div className="p-4 d-flex flex-column flex-grow-1">
                            <h5 style={{
                              color: '#002254',
                              fontWeight: '600',
                              marginBottom: '10px',
                              transition: 'color 0.3s ease'
                            }}>
                              {course.title}
                            </h5>
                            <p className="text-truncate text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                              {course.description || "Explore this course to learn more"}
                            </p>
                            <div className="mt-auto">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center">
                                  <img
                                    src="/teacher.png"
                                    alt="Teacher"
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      borderRadius: '50%',
                                      marginRight: '10px'
                                    }}
                                  />
                                  <span style={{ fontSize: '0.9rem', color: '#506690' }}>
                                    {course.teacher ? course.teacher.full_name : "Instructor"}
                                  </span>
                                </div>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span style={{
                                  fontSize: '0.9rem',
                                  color: '#08AEEA',
                                  fontWeight: '600'
                                }}>
                                  <i className="bi bi-people me-2"></i>
                                  {course.total_enrolled || 0} enrolled
                                </span>
                                <i className="bi bi-arrow-right-circle" style={{
                                  color: '#08AEEA',
                                  fontSize: '1.4rem'
                                }}></i>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )
      }

      {/* Featured Teachers */}
      {
        teacherLoginStatus !== 'true' && (
          <section className="featured-teachers-section py-5" style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: '30px',
            margin: '2rem 0',
            padding: '3rem 0'
          }}>
            <div className="container">
              <div className="row mb-4">
                <div className="col-lg-6">
                  <div className="section-title">
                    <span style={{
                      color: '#08AEEA',
                      fontWeight: '600',
                      display: 'inline-block',
                      marginBottom: '10px',
                      fontSize: '1.1rem'
                    }}>Expert Educators</span>
                    <h2 className="fw-bold" style={{ color: '#002254', fontSize: '2.2rem' }}>Featured Teachers</h2>
                    <p className="lead" style={{ color: '#506690' }}>Learn from our talented instructors:</p>
                  </div>
                </div>
                <div className="col-lg-6 d-flex align-items-center justify-content-end">
                  <Link to="/popular-teachers" className="btn" style={{
                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                    color: 'white',
                    fontWeight: '500',
                    borderRadius: '50px',
                    padding: '0.6rem 1.5rem',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(42, 245, 152, 0.3)',
                    transition: 'transform 0.3s ease'
                  }}>
                    <i className="bi bi-person-video3 me-2"></i>
                    View All Teachers
                  </Link>
                </div>
              </div>

              <div className="row g-4">
                {loading ? (
                  <div className="col-12">
                    <Loader size="medium" />
                  </div>
                ) : featuredTeachers.length === 0 ? (
                  <div className="col-12">
                    <div className="alert" style={{
                      background: 'rgba(8, 174, 234, 0.1)',
                      color: '#08AEEA',
                      borderRadius: '15px',
                      border: 'none',
                      padding: '20px'
                    }}>
                      <i className="bi bi-info-circle me-2"></i>
                      No teachers available at the moment. Check back soon!
                    </div>
                  </div>
                ) : (
                  featuredTeachers.map(teacher => (
                    <div className="col-lg-3 col-md-6" key={teacher.id}>
                      <div className="teacher-card" style={{
                        background: 'white',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-10px)';
                          e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
                        }}>
                        <Link to={`/teacher-detail/${teacher.id}`} style={{ textDecoration: 'none' }}>
                          <div className="position-relative">
                            <div style={{
                              position: 'absolute',
                              top: '0',
                              left: '0',
                              width: '100%',
                              height: '120px',
                              background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                              zIndex: '0'
                            }}></div>
                            <div className="text-center" style={{ paddingTop: '50px', position: 'relative', zIndex: '1' }}>
                              <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                margin: '0 auto',
                                border: '5px solid white',
                                boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
                              }}>
                                <img
                                  src="/teacher.png"
                                  alt={teacher.full_name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="p-4 text-center d-flex flex-column flex-grow-1">
                            <h5 style={{
                              color: '#002254',
                              fontWeight: '600',
                              marginBottom: '10px'
                            }}>
                              {teacher.full_name}
                            </h5>
                            {teacher.qualification &&
                              <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                                {teacher.qualification}
                              </p>
                            }
                            <div style={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: '10px',
                              marginBottom: '20px'
                            }}>
                              {teacher.facebook_url &&
                                <a href={teacher.facebook_url} target="_blank" rel="noopener noreferrer" style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: '#f8f9fa',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#08AEEA',
                                  transition: 'all 0.3s ease'
                                }}>
                                  <i className="bi bi-facebook"></i>
                                </a>
                              }
                              {teacher.twitter_url &&
                                <a href={teacher.twitter_url} target="_blank" rel="noopener noreferrer" style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: '#f8f9fa',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#08AEEA',
                                  transition: 'all 0.3s ease'
                                }}>
                                  <i className="bi bi-twitter"></i>
                                </a>
                              }
                              {teacher.linkedin_url &&
                                <a href={teacher.linkedin_url} target="_blank" rel="noopener noreferrer" style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: '#f8f9fa',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#08AEEA',
                                  transition: 'all 0.3s ease'
                                }}>
                                  <i className="bi bi-linkedin"></i>
                                </a>
                              }
                              {teacher.website_url &&
                                <a href={teacher.website_url} target="_blank" rel="noopener noreferrer" style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: '#f8f9fa',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#08AEEA',
                                  transition: 'all 0.3s ease'
                                }}>
                                  <i className="bi bi-globe"></i>
                                </a>
                              }
                            </div>
                            <div className="mt-auto">
                              <div style={{
                                display: 'inline-block',
                                padding: '8px 20px',
                                borderRadius: '50px',
                                background: 'rgba(8, 174, 234, 0.1)',
                                color: '#08AEEA',
                                fontWeight: '600'
                              }}>
                                <i className="bi bi-book me-2"></i>
                                {teacher.courseCount} {teacher.courseCount === 1 ? 'Course' : 'Courses'}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )
      }

      {/* Student Testimonials - Hide for teachers */}
      {teacherLoginStatus !== 'true' && (
        <section className="testimonials-section py-5 my-5">
          <div className="container">
            <div className="text-center mb-5">
              <span style={{
                color: '#08AEEA',
                fontWeight: '600',
                display: 'inline-block',
                marginBottom: '10px',
                fontSize: '1.1rem'
              }}>Student Feedback</span>
              <h2 className="fw-bold" style={{ color: '#002254', fontSize: '2.5rem' }}>What Our Students Say</h2>
              <p className="lead mx-auto" style={{ color: '#506690', maxWidth: '700px' }}>
                Read what our community has to say about their learning experiences
              </p>
            </div>

            <div className="testimonial-carousel-wrapper" style={{
              position: 'relative',
              padding: '40px 0'
            }}>
              {/* Background decoration */}
              <div style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                top: '0',
                left: '-100px',
                zIndex: '-1'
              }}></div>
              <div style={{
                position: 'absolute',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(42, 245, 152, 0.1), rgba(8, 174, 234, 0.1))',
                bottom: '0',
                right: '-50px',
                zIndex: '-1'
              }}></div>

              {loading ? (
                <Loader size="medium" />
              ) : testimonials.length === 0 ? (
                <div className="alert" style={{
                  background: 'rgba(8, 174, 234, 0.1)',
                  color: '#08AEEA',
                  borderRadius: '15px',
                  border: 'none',
                  padding: '20px',
                  maxWidth: '700px',
                  margin: '0 auto'
                }}>
                  <i className="bi bi-info-circle me-2"></i>
                  No testimonials available yet. Be the first to leave a review!
                </div>
              ) : (
                <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel">
                  <div className="carousel-inner">
                    {testimonials.map((testimonial, index) => (
                      <div key={testimonial.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                        <div className="testimonial-card" style={{
                          background: 'white',
                          borderRadius: '20px',
                          padding: '40px',
                          maxWidth: '800px',
                          margin: '0 auto',
                          boxShadow: '0 15px 50px rgba(0, 0, 0, 0.05)',
                          position: 'relative'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '30px',
                            left: '40px',
                            fontSize: '4rem',
                            lineHeight: '1',
                            fontFamily: 'Georgia, serif',
                            color: 'rgba(8, 174, 234, 0.1)',
                            zIndex: '0'
                          }}>
                            "
                          </div>
                          <div className="position-relative" style={{ zIndex: '1' }}>
                            <div className="mb-4">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`bi ${i < testimonial.rating ? 'bi-star-fill' : 'bi-star'}`}
                                  style={{
                                    color: i < testimonial.rating ? '#FFD700' : '#e0e0e0',
                                    fontSize: '1.2rem',
                                    marginRight: '5px'
                                  }}
                                ></i>
                              ))}
                            </div>
                            <p className="mb-4" style={{
                              fontSize: '1.1rem',
                              color: '#506690',
                              lineHeight: '1.8',
                              fontStyle: 'italic'
                            }}>
                              "{testimonial.review}"
                            </p>
                            <div className="d-flex align-items-center">
                              <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                marginRight: '15px',
                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                              }}>
                                {testimonial.student_name.charAt(0)}
                              </div>
                              <div>
                                <h5 className="mb-0" style={{ color: '#002254', fontWeight: '600' }}>
                                  {testimonial.student_name}
                                </h5>
                                <p className="mb-0" style={{ color: '#08AEEA', fontSize: '0.9rem' }}>
                                  {testimonial.course_title}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="carousel-control-prev" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev" style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: '-25px',
                    opacity: '1',
                    color: '#08AEEA'
                  }}>
                    <i className="bi bi-book" style={{ fontSize: '1.8rem' }}></i>
                    <span className="visually-hidden">Previous</span>
                  </button>
                  <button className="carousel-control-next" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next" style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: '-25px',
                    opacity: '1'
                  }}>
                    <i className="bi bi-chevron-right" style={{ color: '#08AEEA' }}></i>
                    <span className="visually-hidden">Next</span>
                  </button>
                  <div className="carousel-indicators" style={{
                    position: 'relative',
                    marginTop: '30px',
                    bottom: 'auto'
                  }}>
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        data-bs-target="#testimonialCarousel"
                        data-bs-slide-to={index}
                        className={index === 0 ? "active" : ""}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: index === 0 ? '#08AEEA' : '#e0e0e0',
                          border: 'none',
                          margin: '0 5px'
                        }}
                      ></button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div >
  );
}

export default Home;
