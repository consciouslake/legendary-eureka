import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

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
            <p className="mt-3 text-muted">Loading profile...</p>
        </div>
    );
};

function TeacherDetail() {
    const [teacherData, setTeacherData] = useState({});
    const [courseData, setCourseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { teacher_id } = useParams();

    useEffect(() => {
        document.title = "Teacher Profile | Knoology LMS";

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch teacher data
                const teacherResponse = await axios.get(`http://127.0.0.1:8000/api/teacher/${teacher_id}`);
                setTeacherData(teacherResponse.data);

                // Fetch teacher's courses
                const coursesResponse = await axios.get(`http://127.0.0.1:8000/api/teacher-courses/${teacher_id}`);
                setCourseData(coursesResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching teacher data:', err);
                setError('Failed to load teacher information. Please try again later.');
                setLoading(false);
            }
        };

        fetchData();
    }, [teacher_id]);

    const renderSkills = (skills) => {
        if (!skills) return null;
        const skillsArray = skills.split(',').map(skill => skill.trim());
        return skillsArray.map((skill, index) => (
            <Link
                key={index}
                to={`/courses/skill/${encodeURIComponent(skill)}`}
                style={{
                    display: 'inline-block',
                    padding: '0.4rem 0.8rem',
                    margin: '0.2rem',
                    background: 'rgba(142, 68, 173, 0.1)',
                    color: '#8e44ad',
                    fontWeight: '500',
                    fontSize: '0.85rem',
                    borderRadius: '50px',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(45deg, #8e44ad, #5b2c6f)';
                    e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(142, 68, 173, 0.1)';
                    e.target.style.color = '#8e44ad';
                }}
            >
                <i className="bi bi-tag-fill me-1"></i>
                {skill}
            </Link>
        ));
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="teacher-hero-section" style={{
                background: 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)',
                color: 'white',
                position: 'relative',
                paddingTop: '120px',
                paddingBottom: '3rem',
                marginBottom: '2rem',
                overflow: 'hidden'
            }}>
                {/* Abstract background elements */}
                <div className="hero-bg" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.1,
                    background: 'url("https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80") center center/cover no-repeat'
                }}></div>
                <div className="container position-relative">
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <div className="d-flex align-items-center mb-2">
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-person-badge" style={{ fontSize: '1.2rem' }}></i>
                                </div>
                                <h1 className="fw-bold mb-0" style={{ fontSize: '2.2rem', lineHeight: 1.2 }}>
                                    {loading ? 'Teacher Profile' : teacherData.full_name}
                                </h1>
                            </div>
                            {!loading && teacherData.qualification && (
                                <p className="lead mb-0" style={{ fontSize: '1.1rem', opacity: 0.85 }}>
                                    {teacherData.qualification}
                                </p>
                            )}
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
                    lineHeight: 0
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{
                        position: 'relative',
                        display: 'block',
                        width: 'calc(100% + 1.3px)',
                        height: '30px',
                        fill: '#ffffff'
                    }}>
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>
            </section>

            <div className="container mb-5">
                {loading ? (
                    <Loader size="large" />
                ) : error ? (
                    <div style={{
                        background: 'rgba(220, 53, 69, 0.1)',
                        color: '#dc3545',
                        padding: '25px',
                        borderRadius: '15px',
                        marginBottom: '20px',
                        border: 'none'
                    }}>
                        <div className="d-flex">
                            <div style={{ marginRight: '20px' }}>
                                <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2rem' }}></i>
                            </div>
                            <div>
                                <h5 style={{ fontWeight: '600', marginBottom: '10px' }}>Error</h5>
                                <p className="mb-0">{error}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="row g-4">
                            <div className="col-lg-4">
                                <div style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                    overflow: 'hidden',
                                    height: '100%'
                                }}>
                                    <div style={{
                                        width: '100%',
                                        height: '250px',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.1), rgba(91, 44, 111, 0.1))'
                                    }}>
                                        <img
                                            src={teacherData.profile_img || "/teacher.png"}
                                            alt={teacherData.full_name}
                                            style={{
                                                width: '180px',
                                                height: '180px',
                                                objectFit: 'cover',
                                                borderRadius: '50%',
                                                border: '5px solid white',
                                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                                            }}
                                            onError={(e) => {
                                                e.target.src = "/teacher.png";
                                            }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h4 style={{ fontWeight: '600', color: '#333', marginBottom: '15px', textAlign: 'center' }}>
                                            {teacherData.full_name}
                                        </h4>

                                        <div className="mt-4">
                                            {teacherData.email && (
                                                <div className="d-flex align-items-center mb-3">
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        background: 'rgba(142, 68, 173, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: '15px'
                                                    }}>
                                                        <i className="bi bi-envelope" style={{ color: '#8e44ad', fontSize: '1.2rem' }}></i>
                                                    </div>
                                                    <div>
                                                        <p className="small text-muted mb-0">Email</p>
                                                        <p className="mb-0">{teacherData.email}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {teacherData.mobile_number && (
                                                <div className="d-flex align-items-center mb-3">
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        background: 'rgba(142, 68, 173, 0.1)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginRight: '15px'
                                                    }}>
                                                        <i className="bi bi-telephone" style={{ color: '#8e44ad', fontSize: '1.2rem' }}></i>
                                                    </div>
                                                    <div>
                                                        <p className="small text-muted mb-0">Phone</p>
                                                        <p className="mb-0">{teacherData.mobile_number}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-8">
                                <div style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                                    overflow: 'hidden',
                                    height: '100%'
                                }}>
                                    <div style={{
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
                                                <i className="bi bi-info-circle" style={{
                                                    color: 'white',
                                                    fontSize: '1.2rem'
                                                }}></i>
                                            </div>
                                            <h4 className="mb-0" style={{ fontWeight: '600', color: '#333' }}>Teacher Profile</h4>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        {teacherData.bio && (
                                            <div className="mb-4">
                                                <h5 style={{ fontWeight: '600', color: '#333', marginBottom: '15px' }}>
                                                    <i className="bi bi-person-lines-fill me-2" style={{ color: '#8e44ad' }}></i>
                                                    Biography
                                                </h5>
                                                <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#444' }}>
                                                    {teacherData.bio}
                                                </p>
                                            </div>
                                        )}

                                        {teacherData.skills && (
                                            <div className="mb-4">
                                                <h5 style={{ fontWeight: '600', color: '#333', marginBottom: '15px' }}>
                                                    <i className="bi bi-lightning-charge me-2" style={{ color: '#8e44ad' }}></i>
                                                    Skills & Expertise
                                                </h5>
                                                <div>{renderSkills(teacherData.skills)}</div>
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <h5 style={{ fontWeight: '600', color: '#333', marginBottom: '15px' }}>
                                                <i className="bi bi-mortarboard me-2" style={{ color: '#8e44ad' }}></i>
                                                Courses Taught
                                            </h5>

                                            {courseData.length > 0 ? (
                                                <div className="row g-3">
                                                    {courseData.map((course, index) => (
                                                        <div key={index} className="col-md-6">
                                                            <Link
                                                                to={`/detail/${course.id}`}
                                                                style={{
                                                                    display: 'block',
                                                                    background: 'rgba(142, 68, 173, 0.05)',
                                                                    borderRadius: '15px',
                                                                    padding: '15px',
                                                                    transition: 'all 0.3s ease',
                                                                    textDecoration: 'none',
                                                                    color: '#333',
                                                                    border: '1px solid rgba(142, 68, 173, 0.1)',
                                                                    height: '100%'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.target.style.boxShadow = '0 10px 20px rgba(142, 68, 173, 0.1)';
                                                                    e.target.style.transform = 'translateY(-5px)';
                                                                    e.target.style.borderColor = 'rgba(142, 68, 173, 0.3)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.target.style.boxShadow = 'none';
                                                                    e.target.style.transform = 'translateY(0)';
                                                                    e.target.style.borderColor = 'rgba(142, 68, 173, 0.1)';
                                                                }}
                                                            >
                                                                <div className="d-flex align-items-center">
                                                                    <div style={{
                                                                        width: '35px',
                                                                        height: '35px',
                                                                        borderRadius: '10px',
                                                                        background: 'rgba(142, 68, 173, 0.1)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        marginRight: '12px'
                                                                    }}>
                                                                        <i className="bi bi-book" style={{ color: '#8e44ad', fontSize: '1.1rem' }}></i>
                                                                    </div>
                                                                    <h6 className="mb-0" style={{ fontWeight: '500' }}>{course.title}</h6>
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted mb-0">No courses available for this teacher yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default TeacherDetail;