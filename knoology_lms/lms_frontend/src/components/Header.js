import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../config';

function Header() {
  const [teacherLoginStatus, setTeacherLoginStatus] = useState(localStorage.getItem('teacherLoginStatus') || 'false');
  const [studentLoginStatus, setStudentLoginStatus] = useState(Boolean(localStorage.getItem('studentInfo')));
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation(); // Use location to determine active link

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const [teacherName, setTeacherName] = useState('');
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    const checkLoginStatus = () => {
      const teacherStatus = localStorage.getItem('teacherLoginStatus');
      const studentInfo = localStorage.getItem('studentInfo');
      const teacherData = localStorage.getItem('teacherData');

      if (teacherStatus !== teacherLoginStatus) {
        setTeacherLoginStatus(teacherStatus || 'false');
      }

      if (teacherData) {
        try {
          const parsedTeacher = JSON.parse(teacherData);
          setTeacherName(parsedTeacher.fullName);
        } catch (e) {
          console.error('Error parsing teacher data', e);
        }
      }

      setStudentLoginStatus(Boolean(studentInfo));

      if (studentInfo) {
        try {
          const parsedStudent = JSON.parse(studentInfo);
          setStudentName(parsedStudent.fullname);
        } catch (e) {
          console.error('Error parsing student info', e);
        }
      }
    };

    // Check initial status
    checkLoginStatus();

    // Listen for login status changes
    window.addEventListener('teacherLoginChange', checkLoginStatus);
    window.addEventListener('studentLoginChange', checkLoginStatus);
    window.addEventListener('storage', checkLoginStatus);

    // Cleanup listener
    return () => {
      window.removeEventListener('teacherLoginChange', checkLoginStatus);
      window.removeEventListener('studentLoginChange', checkLoginStatus);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [teacherLoginStatus]);

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${apiUrl}/category/`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length > 2) {
      // Set new timeout for API call
      searchTimeoutRef.current = setTimeout(() => {
        fetchSearchResults(query);
      }, 300);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  // Fetch search results from API
  const fetchSearchResults = async (query) => {
    try {
      const response = await axios.get(`${apiUrl}/search-courses/?q=${query}`);
      if (response.data.status === 'success') {
        setSearchResults(response.data.data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search-results?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  // Handle clicking outside search suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Create slug for category title
  const createSlug = (title) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  // Helper function to check if a nav link is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return path !== '/' && location.pathname.startsWith(path);
  };

  // Navigation link with consistent styling
  const NavLink = ({ to, children }) => {
    const active = isActive(to);

    return (
      <Link
        className={`nav-link mx-1 ${active ? 'active' : ''}`}
        aria-current={active ? "page" : undefined}
        to={to}
        style={{
          fontWeight: '500',
          padding: '0.5rem 1rem',
          position: 'relative',
          color: active ? '#2AF598' : '#ffffff', // Active is Green, others White (Always dark header now)
          transition: 'color 0.3s ease'
        }}
      >
        <span>{children}</span>
        {active && (
          <span className="active-indicator" style={{
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: '#2AF598',
            display: 'block',
          }}></span>
        )}
      </Link>
    );
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark ${isScrolled ? 'scrolled' : ''}`}
      style={{
        background: (location.pathname === '/' && !isScrolled) ? 'var(--header-bg-initial)' : 'var(--navbar-bg-scrolled)',
        backdropFilter: 'var(--header-backdrop)',
        WebkitBackdropFilter: 'var(--header-backdrop)',
        transition: 'all 0.3s ease',
        boxShadow: isScrolled ? '0 4px 30px rgba(0, 0, 0, 0.1)' : 'none',
        padding: isScrolled ? '0.5rem 1rem' : '1rem',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
        zIndex: 1000
      }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/" style={{ fontWeight: '700', fontSize: '1.5rem' }}>
          <span style={{
            background: 'linear-gradient(45deg, #2AF598, #08AEEA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginRight: '6px'
          }}>Knoology</span>
          <span style={{ color: isScrolled ? 'var(--navbar-text-scrolled)' : 'white' }}>LMS</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          {/* Search Form */}
          <form className="d-flex mx-auto search-container position-relative" onSubmit={handleSearchSubmit} style={{ maxWidth: '400px', width: '100%' }}>
            <div className="input-group" style={{
              background: isScrolled ? 'var(--input-bg)' : 'rgba(255, 255, 255, 0.15)',
              borderRadius: '50px',
              padding: '2px',
              border: isScrolled ? '1px solid var(--border-color)' : '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: isScrolled ? 'none' : 'blur(5px)',
              transition: 'all 0.3s ease'
            }}>
              <input
                className="form-control"
                type="search"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '0.6rem 1.2rem',
                  color: isScrolled ? 'var(--navbar-text-scrolled)' : 'white',
                  boxShadow: 'none',
                  borderRadius: '50px 0 0 50px',
                }}
              />
              <button className="btn" type="submit" style={{
                borderRadius: '0 50px 50px 0',
                backgroundColor: '#08AEEA',
                color: 'white',
                border: 'none',
                padding: '0.6rem 1.2rem',
                transition: 'all 0.3s ease',
              }}>
                <i className="bi bi-search"></i>
              </button>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm" style={{ top: '100%', zIndex: 1000, borderRadius: '12px', overflow: 'hidden' }}>
                {searchResults.map(course => (
                  <Link
                    key={course.id}
                    to={`/detail/${course.id}`}
                    className="d-block text-decoration-none p-3 border-bottom transition-bg"
                    onClick={() => setShowSuggestions(false)}
                    style={{
                      color: '#333',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div className="fw-bold">{course.title}</div>
                    <small className="text-muted">{course.teacher?.full_name}</small>
                  </Link>
                ))}
              </div>
            )}
          </form>

          <div className="navbar-nav ms-auto">
            {/* Dark Mode Toggle */}
            <button
              className="btn btn-link nav-link mx-2"
              onClick={toggleTheme}
              style={{
                color: isScrolled ? 'var(--navbar-text-scrolled)' : 'white',
                textDecoration: 'none',
                fontSize: '1.2rem',
                transition: 'color 0.3s ease'
              }}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <i className="bi bi-sun-fill"></i> : <i className="bi bi-moon-fill"></i>}
            </button>

            <NavLink to="/">Home</NavLink>
            {teacherLoginStatus !== 'true' && (
              <>
                <NavLink to="/all-courses">Courses</NavLink>
                <NavLink to="/course-categories">Categories</NavLink>
              </>
            )}

            {!studentLoginStatus &&
              <div className="nav-item dropdown mx-1">
                <a
                  className={`nav-link dropdown-toggle ${location.pathname.includes('/teacher-') ? 'active' : ''
                    }`}
                  href="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    fontWeight: '500',
                    padding: '0.5rem 1rem',
                    position: 'relative',
                    color: isScrolled ? 'var(--navbar-text-scrolled)' : '#ffffff'
                  }}
                >
                  {teacherLoginStatus === 'true' ? (teacherName || 'Teacher') : 'Teacher'}
                  {location.pathname.includes('/teacher-') && (
                    <span className="active-indicator" style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: '#2AF598',
                      display: 'block',
                    }}></span>
                  )}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  {teacherLoginStatus === 'true' ? (
                    <>
                      <li><Link className="dropdown-item py-2" to="/teacher-dashboard">Dashboard</Link></li>
                      <li><hr className="dropdown-divider" style={{ margin: '0.25rem 0' }} /></li>
                      <li><Link className="dropdown-item py-2" to="/teacher-logout">Logout</Link></li>
                    </>
                  ) : (
                    <>
                      <li><Link className="dropdown-item py-2 rounded" to="/teacher-login">Login</Link></li>
                      <li><Link className="dropdown-item py-2 rounded" to="/teacher-register">Register</Link></li>
                    </>
                  )}
                </ul>
              </div>
            }

            {(teacherLoginStatus !== 'true') &&
              <div className="nav-item dropdown mx-1">
                <a
                  className={`nav-link dropdown-toggle ${location.pathname.includes('/user-') ? 'active' : ''
                    }`}
                  href="#"
                  id="studentDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    fontWeight: '500',
                    padding: '0.5rem 1rem',
                    position: 'relative',
                    color: isScrolled ? 'var(--navbar-text-scrolled)' : '#ffffff'
                  }}
                >
                  {studentLoginStatus ? (studentName || 'Student') : 'Student'}
                  {location.pathname.includes('/user-') && (
                    <span className="active-indicator" style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: '#2AF598',
                      display: 'block',
                    }}></span>
                  )}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="studentDropdown" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  {studentLoginStatus ? (
                    <>
                      <li><Link className="dropdown-item py-2" to="/user-dashboard">Dashboard</Link></li>
                      <li><Link className="dropdown-item py-2" to="/user-logout">Logout</Link></li>
                    </>
                  ) : (
                    <>
                      <li><Link className="dropdown-item py-2 rounded" to="/user-login">Login</Link></li>
                      <li><Link className="dropdown-item py-2 rounded" to="/user-register">Register</Link></li>
                    </>
                  )}
                </ul>
              </div>
            }
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
