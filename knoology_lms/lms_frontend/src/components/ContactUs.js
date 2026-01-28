import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

function ContactUs() {
  const [content, setContent] = useState({
    title: 'Contact Us',
    content: 'Loading content...'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  useEffect(() => {
    document.title = "Knoology LMS - Contact Us";

    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${baseUrl}/flatpage/contact`);

        if (response.data.status === 'success') {
          setContent(response.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contact page content:', error);
        setError('Failed to load content. Please try again later.');
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({
      submitted: true,
      success: false,
      message: 'Sending your message...'
    });

    try {
      // Send the contact form data to the backend API
      const response = await axios.post(`${baseUrl}/contact-form/submit/`, formData);

      if (response.data.status === 'success') {
        // Clear form and show success message
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });

        setFormStatus({
          submitted: true,
          success: true,
          message: response.data.message || 'Thank you! Your message has been sent successfully.'
        });
      } else {
        // Handle API error response
        setFormStatus({
          submitted: true,
          success: false,
          message: response.data.message || 'Failed to send message. Please try again later.'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setFormStatus({
        submitted: true,
        success: false,
        message: error.response?.data?.message || 'Failed to send message. Please try again later.'
      });
    }
  };

  // Function to split content into intro and contact info
  const splitContent = (htmlContent) => {
    if (!htmlContent) return { intro: '', contactInfo: '' };

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Assuming the intro is the first paragraph
    const introParagraph = doc.querySelector('p');
    const contactInfoDiv = doc.querySelector('.contact-info');

    const introHtml = introParagraph ? introParagraph.outerHTML : '';

    // Get everything after the intro paragraph for contact info
    let contactInfoHtml = '';
    if (contactInfoDiv) {
      contactInfoHtml = contactInfoDiv.outerHTML;
    }

    return {
      intro: introHtml,
      contactInfo: contactInfoHtml
    };
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="contact-hero-section" style={{
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
          background: 'url("https://images.unsplash.com/photo-1596524430615-b46475ddff6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80") center center/cover no-repeat'
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
                  <i className="bi bi-envelope" style={{ fontSize: '1.2rem' }}></i>
                </div>
                <h1 className="fw-bold mb-0" style={{ fontSize: '2.2rem', lineHeight: 1.2 }}>
                  {content.title || "Contact Us"}
                </h1>
              </div>
              <p className="lead mb-0" style={{ fontSize: '1.1rem', opacity: 0.85 }}>
                Get in touch with our support team
              </p>
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
            {/* Intro paragraph - full width */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              padding: '25px',
              marginBottom: '2rem'
            }}>
              <div
                className="contact-intro"
                dangerouslySetInnerHTML={{ __html: splitContent(content.content).intro }}
                style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.7',
                  color: '#444'
                }}
              />
            </div>

            {/* Contact info and form - side by side */}
            <div className="row g-4">
              {/* Contact info - Left column */}
              <div className="col-md-4">
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                  height: '100%'
                }}>
                  <div style={{
                    padding: '20px 25px',
                    background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.1), rgba(91, 44, 111, 0.1))',
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
                      <h4 className="mb-0" style={{ fontWeight: '600', color: '#333' }}>Contact Information</h4>
                    </div>
                  </div>
                  <div className="p-4">
                    <div
                      className="contact-details"
                      dangerouslySetInnerHTML={{ __html: splitContent(content.content).contactInfo }}
                    />

                    {/* Style injection for contact info */}
                    <style jsx="true">{`
                      .contact-details h5, 
                      .contact-details h6 {
                        color: #333;
                        margin-top: 1rem;
                        margin-bottom: 0.5rem;
                        font-weight: 600;
                      }
                      
                      .contact-details p {
                        margin-bottom: 1rem;
                      }
                      
                      .contact-details ul {
                        list-style: none;
                        padding-left: 0;
                      }
                      
                      .contact-details ul li {
                        margin-bottom: 1rem;
                        display: flex;
                      }
                      
                      .contact-details ul li i {
                        color: #8e44ad;
                        margin-right: 10px;
                        font-size: 1.2rem;
                      }
                      
                      .contact-details a {
                        color: #8e44ad;
                        text-decoration: none;
                        transition: all 0.2s ease;
                      }
                      
                      .contact-details a:hover {
                        color: #5b2c6f;
                        text-decoration: underline;
                      }
                    `}</style>
                  </div>
                </div>
              </div>

              {/* Contact Form - Right column */}
              <div className="col-md-8">
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '20px 25px',
                    background: 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)',
                    color: 'white'
                  }}>
                    <div className="d-flex align-items-center">
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
                        <i className="bi bi-chat-dots" style={{ fontSize: '1.2rem' }}></i>
                      </div>
                      <h4 className="mb-0" style={{ fontWeight: '600' }}>Send us a message</h4>
                    </div>
                  </div>
                  <div className="p-4">
                    {formStatus.submitted && (
                      <div style={{
                        background: formStatus.success ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                        color: formStatus.success ? '#198754' : '#dc3545',
                        padding: '15px 20px',
                        borderRadius: '10px',
                        marginBottom: '20px',
                        border: 'none'
                      }}>
                        <div className="d-flex">
                          <div style={{ marginRight: '15px' }}>
                            <i className={`bi ${formStatus.success ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`} style={{ fontSize: '1.5rem' }}></i>
                          </div>
                          <div>
                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>{formStatus.success ? 'Success' : 'Error'}</h6>
                            <p className="mb-0">{formStatus.message}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                          <i className="bi bi-person me-2" style={{ color: '#8e44ad' }}></i>
                          Your Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            boxShadow: 'none'
                          }}
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="email" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                          <i className="bi bi-envelope me-2" style={{ color: '#8e44ad' }}></i>
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            boxShadow: 'none'
                          }}
                          placeholder="Enter your email address"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="subject" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                          <i className="bi bi-tag me-2" style={{ color: '#8e44ad' }}></i>
                          Subject
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            boxShadow: 'none'
                          }}
                          placeholder="What is your message about?"
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="message" className="form-label" style={{ fontWeight: '500', color: '#495057' }}>
                          <i className="bi bi-chat-left-text me-2" style={{ color: '#8e44ad' }}></i>
                          Message
                        </label>
                        <textarea
                          className="form-control"
                          id="message"
                          name="message"
                          rows="5"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            boxShadow: 'none',
                            resize: 'vertical'
                          }}
                          placeholder="Please type your message here..."
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="btn"
                        disabled={formStatus.submitted && !formStatus.success}
                        style={{
                          background: formStatus.submitted && !formStatus.success ?
                            '#f1f5fb' :
                            'linear-gradient(45deg, #8e44ad, #5b2c6f)',
                          color: formStatus.submitted && !formStatus.success ?
                            '#adb5bd' :
                            'white',
                          border: 'none',
                          borderRadius: '50px',
                          padding: '0.7rem 2rem',
                          fontWeight: '500',
                          boxShadow: '0 4px 15px rgba(142, 68, 173, 0.2)'
                        }}
                      >
                        {formStatus.submitted && !formStatus.success ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
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

export default ContactUs;