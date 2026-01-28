import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config';

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
      <p className="mt-3 text-muted">Loading FAQs...</p>
    </div>
  );
};

function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    document.title = "FAQs | Knoology LMS";

    // Fetch FAQs from the API
    axios.get(`${apiUrl}/faq-list/`)
      .then((res) => {
        setFaqs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching FAQs:", err);
        setError("Failed to load FAQs. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Toggle FAQ panel
  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="faq-hero-section" style={{
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
          background: 'url("https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80") center center/cover no-repeat'
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
                  <i className="bi bi-question-circle" style={{ fontSize: '1.2rem' }}></i>
                </div>
                <h1 className="fw-bold mb-0" style={{ fontSize: '2.2rem', lineHeight: 1.2 }}>
                  Frequently Asked Questions
                </h1>
              </div>
              <p className="lead mb-0" style={{ fontSize: '1.1rem', opacity: 0.85 }}>
                Find answers to commonly asked questions about Knoology LMS
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
        ) : faqs.length > 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
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
                  <i className="bi bi-lightbulb" style={{
                    color: 'white',
                    fontSize: '1.2rem'
                  }}></i>
                </div>
                <h4 className="mb-0" style={{ fontWeight: '600', color: '#333' }}>Common Questions</h4>
              </div>
            </div>
            <div className="p-4">
              <div className="accordion" id="faqAccordion">
                {faqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    style={{
                      marginBottom: index < faqs.length - 1 ? '12px' : 0,
                      borderRadius: '15px',
                      overflow: 'hidden',
                      border: '1px solid #edf2f7',
                      transition: 'box-shadow 0.3s ease'
                    }}
                    className={activeIndex === index ? 'shadow-sm' : ''}
                  >
                    <div
                      onClick={() => toggleFAQ(index)}
                      style={{
                        padding: '16px 20px',
                        background: activeIndex === index ?
                          'linear-gradient(135deg, rgba(142, 68, 173, 0.1), rgba(91, 44, 111, 0.1))' :
                          'white',
                        cursor: 'pointer',
                        borderRadius: activeIndex === index ? '15px 15px 0 0' : '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div className="d-flex align-items-center" style={{ flex: 1 }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          minWidth: '30px',
                          borderRadius: '50%',
                          background: activeIndex === index ?
                            'linear-gradient(45deg, #8e44ad, #5b2c6f)' :
                            'rgba(142, 68, 173, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '15px',
                          transition: 'all 0.3s ease'
                        }}>
                          <i className="bi bi-question" style={{
                            fontSize: '0.9rem',
                            color: activeIndex === index ? 'white' : '#8e44ad'
                          }}></i>
                        </div>
                        <h5 style={{
                          fontSize: '1.05rem',
                          fontWeight: '500',
                          margin: 0,
                          color: activeIndex === index ? '#8e44ad' : '#333',
                          transition: 'color 0.3s ease'
                        }}>
                          {faq.question}
                        </h5>
                      </div>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '15px',
                        transition: 'transform 0.3s ease'
                      }}>
                        <i className={`bi ${activeIndex === index ? 'bi-dash' : 'bi-plus'}`} style={{
                          fontSize: '1.2rem',
                          color: activeIndex === index ? '#8e44ad' : '#718096'
                        }}></i>
                      </div>
                    </div>

                    {activeIndex === index && (
                      <div style={{
                        padding: '20px',
                        background: 'white',
                        borderTop: '1px solid #edf2f7',
                        borderRadius: '0 0 15px 15px'
                      }}>
                        <div
                          style={{
                            fontSize: '1rem',
                            lineHeight: '1.7',
                            color: '#444'
                          }}
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(142, 68, 173, 0.05)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            marginBottom: '2rem',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.03)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(142, 68, 173, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 25px'
            }}>
              <i className="bi bi-question-circle" style={{ fontSize: '2rem', color: '#8e44ad' }}></i>
            </div>
            <h4 style={{ fontWeight: '600', color: '#333', marginBottom: '15px' }}>No FAQs Available</h4>
            <p className="text-muted mb-4">We're working on adding frequently asked questions. Please check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FAQ;