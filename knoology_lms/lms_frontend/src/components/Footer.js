import React from 'react';
import { Link } from "react-router-dom";

function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return (
        <footer className="footer mt-auto py-5" style={{
            background: 'var(--footer-bg)',
            color: '#e1e6f0',
            position: 'relative'
        }}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-4 mb-4 mb-lg-0">
                        <h4 className="mb-4" style={{
                            fontWeight: '700',
                            position: 'relative',
                            paddingBottom: '10px'
                        }}>
                            <span style={{
                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginRight: '6px'
                            }}>Knoology</span> LMS
                            <span style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '50px',
                                height: '3px',
                                background: 'linear-gradient(90deg, #2AF598, #08AEEA)'
                            }}></span>
                        </h4>
                        <p className="mb-4">Knoology provides a cutting-edge learning management system for educators and students, empowering knowledge sharing across the globe.</p>
                        <div className="d-flex gap-3 mb-4">
                            <Link to="/social/facebook" className="social-icon" aria-label="Facebook" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                transition: 'all 0.3s ease'
                            }} onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(45deg, #2AF598, #08AEEA)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onClick={scrollToTop}>
                                <i className="bi bi-facebook"></i>
                            </Link>
                            <Link to="/social/twitter" className="social-icon" aria-label="Twitter" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                transition: 'all 0.3s ease'
                            }} onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(45deg, #2AF598, #08AEEA)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onClick={scrollToTop}>
                                <i className="bi bi-twitter-x"></i>
                            </Link>
                            <Link to="/social/instagram" className="social-icon" aria-label="Instagram" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                transition: 'all 0.3s ease'
                            }} onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(45deg, #2AF598, #08AEEA)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onClick={scrollToTop}>
                                <i className="bi bi-instagram"></i>
                            </Link>
                            <Link to="/social/linkedin" className="social-icon" aria-label="LinkedIn" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                transition: 'all 0.3s ease'
                            }} onMouseOver={(e) => e.currentTarget.style.background = 'linear-gradient(45deg, #2AF598, #08AEEA)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onClick={scrollToTop}>
                                <i className="bi bi-linkedin"></i>
                            </Link>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-4 mb-4 mb-md-0">
                        <h5 className="mb-4 fw-bold">Explore</h5>
                        <ul className="list-unstyled">
                            <li className="mb-3"><Link to="/" className="text-decoration-none footer-link" style={{ color: '#e1e6f0', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#2AF598'} onMouseOut={(e) => e.currentTarget.style.color = '#e1e6f0'} onClick={scrollToTop}>Home</Link></li>
                            <li className="mb-3"><Link to="/all-courses" className="text-decoration-none footer-link" style={{ color: '#e1e6f0', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#2AF598'} onMouseOut={(e) => e.currentTarget.style.color = '#e1e6f0'} onClick={scrollToTop}>All Courses</Link></li>
                            <li className="mb-3"><Link to="/popular-courses" className="text-decoration-none footer-link" style={{ color: '#e1e6f0', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#2AF598'} onMouseOut={(e) => e.currentTarget.style.color = '#e1e6f0'} onClick={scrollToTop}>Popular Courses</Link></li>
                            <li className="mb-3"><Link to="/course-categories" className="text-decoration-none footer-link" style={{ color: '#e1e6f0', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#2AF598'} onMouseOut={(e) => e.currentTarget.style.color = '#e1e6f0'} onClick={scrollToTop}>Categories</Link></li>
                        </ul>
                    </div>
                    <div className="col-lg-2 col-md-4 mb-4 mb-md-0">
                        <h5 className="mb-4 fw-bold">Resources</h5>
                        <ul className="list-unstyled">
                            <li className="mb-3"><Link to="/about" className="text-decoration-none footer-link" style={{ color: '#e1e6f0', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#2AF598'} onMouseOut={(e) => e.currentTarget.style.color = '#e1e6f0'} onClick={scrollToTop}>About Us</Link></li>
                            <li className="mb-3"><Link to="/contact-us" className="text-decoration-none footer-link" style={{ color: '#e1e6f0', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#2AF598'} onMouseOut={(e) => e.currentTarget.style.color = '#e1e6f0'} onClick={scrollToTop}>Contact Us</Link></li>
                            <li className="mb-3"><Link to="/faq" className="text-decoration-none footer-link" style={{ color: '#e1e6f0', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#2AF598'} onMouseOut={(e) => e.currentTarget.style.color = '#e1e6f0'} onClick={scrollToTop}>FAQs</Link></li>
                            <li className="mb-3"><Link to="/blog" className="text-decoration-none footer-link" style={{ color: '#e1e6f0', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#2AF598'} onMouseOut={(e) => e.currentTarget.style.color = '#e1e6f0'} onClick={scrollToTop}>Blog</Link></li>
                        </ul>
                    </div>
                    <div className="col-lg-4 col-md-4">
                        <h5 className="mb-4 fw-bold">Newsletter</h5>
                        <p className="mb-4">Stay updated with our latest courses and educational insights.</p>
                        <form className="d-flex">
                            <input type="email" className="form-control me-2" placeholder="Your email" style={{
                                borderRadius: '50px 0 0 50px',
                                border: 'none',
                                padding: '0.6rem 1.2rem',
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                boxShadow: 'none'
                            }} />
                            <button className="btn px-3" type="submit" style={{
                                borderRadius: '0 50px 50px 0',
                                background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
                                color: 'white',
                                border: 'none',
                                fontWeight: '500'
                            }}>
                                <i className="bi bi-send"></i>
                            </button>
                        </form>
                    </div>
                </div>
                <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '2rem 0' }} />
                <div className="row align-items-center">
                    <div className="col-md-6 text-center text-md-start">
                        <p className="mb-md-0">© 2025 Knoology LMS. All rights reserved.</p>
                    </div>
                    <div className="col-md-6 text-center text-md-end">
                        <ul className="list-inline mb-0">
                            <li className="list-inline-item me-3"><Link to="/privacy-policy" className="text-decoration-none" style={{ color: '#e1e6f0', fontSize: '0.9rem' }} onClick={scrollToTop}>Privacy Policy</Link></li>
                            <li className="list-inline-item me-3"><Link to="/terms-of-service" className="text-decoration-none" style={{ color: '#e1e6f0', fontSize: '0.9rem' }} onClick={scrollToTop}>Terms of Service</Link></li>
                            <li className="list-inline-item"><Link to="/cookie-policy" className="text-decoration-none" style={{ color: '#e1e6f0', fontSize: '0.9rem' }} onClick={scrollToTop}>Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;