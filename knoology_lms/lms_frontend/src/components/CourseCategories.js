import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

const baseUrl = 'http://127.0.0.1:8000/api';

// Reusable loader component
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
      <p className="mt-3 text-muted">Loading categories...</p>
    </div>
  );
};

const CourseCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = "Knoology LMS - Course Categories";
        
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${baseUrl}/category/`);
                setCategories(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to fetch categories. Please try again later.');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Create slug for category title
    const createSlug = (title) => {
        return title.toLowerCase().replace(/\s+/g, '-');
    };

    // Generate a pastel color based on category index
    const getCategoryColor = (index) => {
        const colors = [
            'linear-gradient(135deg, #93a5cf 0%, #e4efe9 100%)',
            'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
            'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
            'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
            'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
            'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
            'linear-gradient(135deg, #f5efef 0%, #feada6 100%)'
        ];
        return colors[index % colors.length];
    };

    // Generate a category icon based on index
    const getCategoryIcon = (index) => {
        const icons = [
            'bi-laptop',
            'bi-code-square',
            'bi-palette',
            'bi-music-note-beamed',
            'bi-camera',
            'bi-bank',
            'bi-heart-pulse',
            'bi-globe',
            'bi-calculator',
            'bi-people'
        ];
        return icons[index % icons.length];
    };

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert" style={{
                    background: 'rgba(220, 53, 69, 0.1)', 
                    color: '#dc3545',
                    borderRadius: '15px',
                    border: 'none',
                    padding: '20px'
                }} role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <section className="categories-hero-section" style={{
                background: 'linear-gradient(135deg, #002254 0%, #1a56c9 100%)',
                color: 'white',
                position: 'relative',
                paddingTop: '3rem',
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
                    background: 'url("https://images.unsplash.com/photo-1485988412941-77a35537dae4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1996&q=80") center center/cover no-repeat'
                }}></div>
                <div className="container position-relative">
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <h1 className="fw-bold mb-2" style={{ fontSize: '2.5rem', lineHeight: 1.2 }}>
                                Course <span style={{ 
                                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)', 
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>Categories</span>
                            </h1>
                            <p className="lead mb-0" style={{ fontSize: '1rem', lineHeight: 1.5 }}>
                                Browse our diverse range of course categories to find the perfect learning path for your interests and goals.
                            </p>
                        </div>
                        <div className="col-lg-5 d-none d-lg-block text-center">
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '15px',
                                maxWidth: '300px',
                                margin: '0 auto'
                            }}>
                                {[0, 1, 2, 3, 4, 5].map(index => (
                                    <div key={index} className="category-icon-bubble" style={{
                                        width: '70px',
                                        height: '70px',
                                        borderRadius: '50%',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        backdropFilter: 'blur(5px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.8rem',
                                        color: 'white',
                                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        <i className={`bi ${getCategoryIcon(index)}`}></i>
                                    </div>
                                ))}
                            </div>
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
                        height: '30px',
                        fill: '#ffffff'
                    }}>
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>
            </section>
            
            <div id="categories-section" className="container mb-5">
                <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                        <div style={{
                            width: '5px',
                            height: '25px',
                            background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                            marginRight: '10px',
                            borderRadius: '10px'
                        }}></div>
                        <h2 className="fw-bold m-0" style={{ color: '#002254' }}>Browse Knowledge Areas</h2>
                    </div>
                    <p className="lead" style={{ color: '#506690' }}>Find the perfect course category that matches your interests and career goals</p>
                </div>
                
                {loading ? (
                    <Loader size="large" />
                ) : categories.length === 0 ? (
                    <div className="alert" style={{
                        background: 'rgba(8, 174, 234, 0.1)',
                        color: '#08AEEA',
                        borderRadius: '15px',
                        border: 'none',
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                            <i className="bi bi-grid-3x3-gap"></i>
                        </div>
                        <h4 className="mb-3">No Categories Available</h4>
                        <p className="mb-0">We're working on adding new categories. Please check back later!</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {categories.map((category, index) => (
                            <div className="col-lg-4 col-md-6" key={category.id}>
                                <div className="category-card" style={{
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
                                    <div className="p-4" style={{ 
                                        borderRadius: '20px 20px 0 0',
                                        background: getCategoryColor(index)
                                    }}>
                                        <div className="icon-container" style={{ 
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(255, 255, 255, 0.3)',
                                            backdropFilter: 'blur(5px)',
                                            fontSize: '1.8rem',
                                            marginBottom: '15px',
                                            transition: 'transform 0.3s ease',
                                            color: '#002254'
                                        }}>
                                            <i className={`bi ${getCategoryIcon(index)}`}></i>
                                        </div>
                                        <h4 style={{ 
                                            color: '#002254',
                                            fontWeight: '600',
                                            marginBottom: '5px'
                                        }}>
                                            {category.title}
                                        </h4>
                                </div>
                                    <div className="p-4 d-flex flex-column flex-grow-1">
                                        <p className="text-muted mb-4" style={{ 
                                            fontSize: '0.95rem',
                                            flexGrow: 1
                                        }}>
                                            {category.description || `Explore our ${category.title} courses to enhance your skills and knowledge.`}
                                        </p>
                                        <div className="mt-auto">
                                    <Link 
                                        to={`/category/${createSlug(category.title)}`}
                                                className="btn w-100"
                                                style={{
                                                    background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                                    color: 'white',
                                                    fontWeight: '500',
                                                    borderRadius: '50px',
                                                    padding: '0.6rem',
                                                    border: 'none',
                                                    boxShadow: '0 4px 15px rgba(42, 245, 152, 0.3)',
                                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(42, 245, 152, 0.4)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(42, 245, 152, 0.3)';
                                                }}
                                            >
                                                <i className="bi bi-grid-3x3-gap me-2"></i>
                                        Browse Courses
                                    </Link>
                                        </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
};

export default CourseCategories;