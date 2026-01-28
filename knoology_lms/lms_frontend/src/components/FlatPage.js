import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const baseUrl = 'http://127.0.0.1:8000/api';

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
            <p className="mt-3 text-muted">Loading content...</p>
        </div>
    );
};

function FlatPage({ slug }) {
    const [content, setContent] = useState({
        title: '',
        content: 'Loading content...'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                // If slug is provided as prop use it, otherwise use hardcoded 'about' for backward compatibility if needed
                const urlSlug = slug || 'about';
                const response = await axios.get(`${baseUrl}/flatpage/${urlSlug}`);

                if (response.data.status === 'success') {
                    setContent(response.data.data);
                    document.title = `Knoology LMS - ${response.data.data.title}`;
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching page content:', error);
                setError('Failed to load content. Please try again later.');
                setLoading(false);
            }
        };

        fetchContent();
    }, [slug]);

    return (
        <div>
            {/* Hero Section */}
            <section className="flatpage-hero-section" style={{
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
                    background: 'url("https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80") center center/cover no-repeat'
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
                                    <i className="bi bi-file-text" style={{ fontSize: '1.2rem' }}></i>
                                </div>
                                <h1 className="fw-bold mb-0" style={{ fontSize: '2.2rem', lineHeight: 1.2 }}>
                                    {content.title || "Page Title"}
                                </h1>
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
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        padding: '30px'
                    }}>
                        <div className="flatpage-content"
                            dangerouslySetInnerHTML={{ __html: content.content }}
                            style={{
                                fontSize: '1.05rem',
                                lineHeight: '1.7',
                                color: '#444'
                            }}
                        />

                        {/* Style injection for content within dangerouslySetInnerHTML */}
                        <style jsx="true">{`
              .flatpage-content h2, 
              .flatpage-content h3, 
              .flatpage-content h4 {
                color: #333;
                margin-top: 1.5rem;
                margin-bottom: 1rem;
                font-weight: 600;
              }
              
              .flatpage-content p {
                margin-bottom: 1.2rem;
              }
              
              .flatpage-content ul, 
              .flatpage-content ol {
                margin-bottom: 1.5rem;
                padding-left: 1.5rem;
              }
              
              .flatpage-content li {
                margin-bottom: 0.5rem;
              }
              
              .flatpage-content a {
                color: #8e44ad;
                text-decoration: none;
                transition: all 0.2s ease;
              }
              
              .flatpage-content a:hover {
                color: #5b2c6f;
                text-decoration: underline;
              }
              
              .flatpage-content blockquote {
                border-left: 4px solid #8e44ad;
                padding-left: 1rem;
                font-style: italic;
                margin: 1.5rem 0;
                color: #666;
              }
              
              .flatpage-content img {
                max-width: 100%;
                height: auto;
                border-radius: 10px;
                margin: 1.5rem 0;
              }
              
              .flatpage-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5rem 0;
              }
              
              .flatpage-content th, 
              .flatpage-content td {
                padding: 0.75rem;
                border: 1px solid #e2e8f0;
              }
              
              .flatpage-content th {
                background-color: rgba(142, 68, 173, 0.1);
              }
            `}</style>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FlatPage;
