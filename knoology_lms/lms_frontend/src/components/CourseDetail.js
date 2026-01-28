import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
const baseUrl = 'http://127.0.0.1:8000/api';
const mediaUrl = 'http://127.0.0.1:8000';

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
            <p className="mt-3 text-muted">Loading course details...</p>
        </div>
    );
};

function CourseDetail() {
    let { id } = useParams();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState(null);
    const [chapterData, setChapterData] = useState([]);
    const [studyMaterials, setStudyMaterials] = useState([]);
    const [relatedCourses, setRelatedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [userRating, setUserRating] = useState(null);
    const [submittingRating, setSubmittingRating] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [togglingFavorite, setTogglingFavorite] = useState(false);

    const isTeacher = localStorage.getItem('teacherLoginStatus') === 'true';

    // New state for tracking video completion and content display
    const [completedChapters, setCompletedChapters] = useState([]);
    const [activeChapter, setActiveChapter] = useState(null);
    // Load completed chapters from localStorage on component mount
    useEffect(() => {
        if (id) {
            const storageKey = `course_${id}_completed_chapters`;
            const savedCompletedChapters = localStorage.getItem(storageKey);
            if (savedCompletedChapters) {
                try {
                    setCompletedChapters(JSON.parse(savedCompletedChapters));
                } catch (e) {
                    console.error("Failed to parse completed chapters from localStorage", e);
                    // Reset if data is corrupted
                    localStorage.removeItem(storageKey);
                }
            }
        }
    }, [id]);

    // Force re-render when completedChapters change to update UI
    useEffect(() => {
        if (id && completedChapters.length > 0) {
            localStorage.setItem(`course_${id}_completed_chapters`, JSON.stringify(completedChapters));
        }
    }, [completedChapters, id]);// Helper functions for chapter progression
    const isChapterAccessible = (chapterId, index) => {
        // Teachers can access all chapters
        if (isTeacher) return true;

        if (index === 0) return true; // First chapter is always accessible (Preview)

        // If not enrolled, only the first chapter is accessible
        if (!isEnrolled) return false;

        // If sequential access is explicitly disabled, all chapters are accessible
        if (courseData && courseData.require_sequential_progress === false) {
            return true;
        }

        // For sequential access: ALL previous chapters must be completed
        for (let i = 0; i < index; i++) {
            const previousChapter = chapterData[i];
            if (!completedChapters.includes(previousChapter.id)) {
                return false; // If any previous chapter is not completed, this one is locked
            }
        }

        // All previous chapters are completed, so this one is accessible
        return true;
    }; const markChapterAsComplete = (chapterId) => {
        if (!completedChapters.includes(chapterId)) {
            console.log(`Marking chapter ${chapterId} as complete`);

            // Create a new array with the newly completed chapter
            const updated = [...completedChapters, chapterId];

            // Update the state to trigger a re-render
            setCompletedChapters(updated);

            // Store completion in localStorage
            const storageKey = `course_${id}_completed_chapters`;
            localStorage.setItem(storageKey, JSON.stringify(updated));

            // Send completion status to server if user is logged in
            const studentInfo = localStorage.getItem('studentInfo');
            if (studentInfo) {
                try {
                    const { studentId } = JSON.parse(studentInfo);
                    axios.post(`${baseUrl}/mark-chapter-complete/`, {
                        student_id: studentId,
                        chapter_id: chapterId,
                        course_id: id
                    }).catch(err => console.error("Failed to mark chapter as complete on server", err));
                } catch (e) {
                    console.error("Error parsing student info", e);
                }
            }

            // Force a re-render to update chapter accessibility
            setTimeout(() => {
                // Force update by setting and immediately using the state
                setActiveChapter(prevActive => {
                    console.log("Forcing UI update after chapter completion");
                    return chapterId; // Set active chapter to the completed one
                });
            }, 100);
        }
    };
    const handleChapterComplete = (chapterId) => {
        // First mark the chapter as complete
        markChapterAsComplete(chapterId);

        // Show success message
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        Toast.fire({
            icon: 'success',
            title: 'Chapter Completed!'
        });
    };



    const handleRatingSubmit = async () => {
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) {
            navigate('/user-login');
            return;
        }

        try {
            setSubmittingRating(true);
            const { studentId } = JSON.parse(studentInfo);
            const response = await axios.post(`${baseUrl}/rate-course/`, {
                student_id: studentId,
                course_id: id,
                rating: rating,
                review: review
            });

            if (response.data.status === 'success') {
                setUserRating({ rating, review });
                setCourseData(prev => ({
                    ...prev,
                    average_rating: response.data.average_rating,
                    total_ratings: response.data.total_ratings
                }));
                setShowRatingModal(false);

                // Show success message using SweetAlert2
                Swal.fire({
                    title: 'Success!',
                    text: response.data.message,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Rating error:', error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to submit rating. Please try again.',
                icon: 'error'
            });
        } finally {
            setSubmittingRating(false);
        }
    }; useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const courseResponse = await axios.get(`${baseUrl}/course/${id}/`);
                const course = courseResponse.data;
                setCourseData(course);

                // Check enrollment, rating and favorite status if student is logged in
                const studentInfo = localStorage.getItem('studentInfo');
                if (studentInfo) {
                    const { studentId } = JSON.parse(studentInfo);
                    const enrollmentResponse = await axios.get(`${baseUrl}/check-enrollment/${studentId}/${id}/`);
                    setIsEnrolled(enrollmentResponse.data.is_enrolled);

                    // Check if course is favorited
                    try {
                        const favoriteResponse = await axios.get(`${baseUrl}/check-favorite/${studentId}/${id}/`);
                        setIsFavorite(favoriteResponse.data.is_favorite);
                    } catch (err) {
                        console.log('Error checking favorite status:', err);
                    }

                    // Only fetch rating if student is enrolled
                    if (enrollmentResponse.data.is_enrolled) {
                        try {
                            const ratingResponse = await axios.get(`${baseUrl}/check-rating/${studentId}/${id}/`);
                            if (ratingResponse.data.rating) {
                                setUserRating(ratingResponse.data.rating);
                                setRating(ratingResponse.data.rating.rating);
                                setReview(ratingResponse.data.rating.review || '');
                            }
                        } catch (err) {
                            console.log('No previous rating found');
                        }

                        // Fetch study materials if student is enrolled
                        try {
                            const materialsResponse = await axios.get(`${baseUrl}/study-materials/${id}/`);
                            setStudyMaterials(materialsResponse.data);
                        } catch (err) {
                            console.log('Error fetching study materials:', err);
                        }
                    }

                    // Fetch completed chapters
                    try {
                        const progressResponse = await axios.get(`${baseUrl}/get-completed-chapters/${studentId}/${id}/`);
                        if (progressResponse.data.status === 'success') {
                            setCompletedChapters(prev => {
                                const unique = [...new Set([...prev, ...progressResponse.data.completed_chapters])];
                                return unique;
                            });
                        }
                    } catch (err) {
                        console.log('Error fetching progress:', err);
                    }
                }

                // Fetch course chapters
                const chaptersResponse = await axios.get(`${baseUrl}/course-chapters/${id}/`);
                setChapterData(chaptersResponse.data.chapters);

                // Fetch related courses based on technologies
                const allCoursesResponse = await axios.get(`${baseUrl}/course/`);
                const courseTechnologies = course.technologies ? course.technologies.split(',').map(tech => tech.trim().toLowerCase()) : [];
                const filtered = allCoursesResponse.data
                    .filter(c => {
                        if (c.id === parseInt(id)) return false;
                        const cTechnologies = c.technologies ? c.technologies.split(',').map(tech => tech.trim().toLowerCase()) : [];
                        return courseTechnologies.some(tech => cTechnologies.includes(tech));
                    })
                    .slice(0, 4);
                setRelatedCourses(filtered);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching course data:', err);
                setError('Failed to load course data. Please try again later.');
            }
            setLoading(false);
        };

        fetchData();
    }, [id, navigate]);

    const handleEnroll = async () => {
        try {
            const studentInfo = localStorage.getItem('studentInfo');
            if (!studentInfo) {
                navigate('/user-login');
                return;
            }

            const parsedData = JSON.parse(studentInfo);
            if (!parsedData || !parsedData.studentId) {
                // Invalid or expired session
                localStorage.removeItem('studentInfo');
                navigate('/user-login');
                return;
            }

            setEnrolling(true);

            // Check if course is free
            if (courseData.price === 0) {
                const response = await axios.post(`${baseUrl}/course-enroll/`, {
                    student_id: parsedData.studentId,
                    course_id: id
                });

                if (response.data.status === 'success') {
                    setIsEnrolled(true);
                    Swal.fire({
                        title: 'Success!',
                        text: 'Enrolled Successfully!',
                        icon: 'success',
                        timer: 2000
                    });
                    // Fetch study materials
                    try {
                        const materialsResponse = await axios.get(`${baseUrl}/study-materials/${id}/`);
                        setStudyMaterials(materialsResponse.data);
                    } catch (err) {
                        console.log('Error fetching study materials:', err);
                    }
                } else {
                    Swal.fire('Error', response.data.message || 'Enrollment failed', 'error');
                }
                setEnrolling(false);
                return;
            }

            // Initiate Checkout
            const { data: orderData } = await axios.post(`${baseUrl}/checkout/`, {
                student_id: parsedData.studentId,
                course_id: id
            });

            if (orderData.status === 'error') {
                if (orderData.message === 'Already enrolled') {
                    setIsEnrolled(true);
                    Swal.fire('Info', 'You are already enrolled', 'info');
                    return;
                }
                throw new Error(orderData.message);
            }

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Knoology LMS",
                description: `Purchase ${courseData.title}`,
                order_id: orderData.order_id,
                handler: async function (response) {
                    try {
                        const verifyResponse = await axios.post(`${baseUrl}/verify-payment/`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyResponse.data.status === 'success') {
                            setIsEnrolled(true);
                            Swal.fire({
                                title: 'Success!',
                                text: 'Course Purchased Successfully!',
                                icon: 'success',
                                timer: 2000
                            });

                            // Fetch study materials
                            try {
                                const materialsResponse = await axios.get(`${baseUrl}/study-materials/${id}/`);
                                setStudyMaterials(materialsResponse.data);
                            } catch (err) {
                                console.log('Error fetching study materials:', err);
                            }
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error', 'Payment verification failed', 'error');
                    }
                },
                prefill: {
                    name: parsedData.full_name || 'Student',
                    email: parsedData.email || 'student@example.com',
                },
                theme: {
                    color: "#8e44ad"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Enrollment error:', error);
            if (error.name === 'SyntaxError') {
                localStorage.removeItem('studentInfo');
                navigate('/user-login');
                return;
            }
            Swal.fire('Error', error.response?.data?.message || error.message || 'Failed to initiate payment', 'error');
        } finally {
            setEnrolling(false);
        }
    };

    const handleFavoriteToggle = async () => {
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) {
            navigate('/user-login');
            return;
        }

        try {
            setTogglingFavorite(true);
            const { studentId } = JSON.parse(studentInfo);
            const response = await axios.post(`${baseUrl}/toggle-favorite/`, {
                student_id: studentId,
                course_id: id
            });

            if (response.data.status === 'success') {
                setIsFavorite(response.data.is_favorite);
                Swal.fire({
                    title: 'Success!',
                    text: response.data.is_favorite ? 'Added to favorites!' : 'Removed from favorites!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Favorite toggle error:', error);
            Swal.fire({
                title: 'Error!',
                text: error.response?.data?.message || 'Failed to update favorite status. Please try again.',
                icon: 'error'
            });
        } finally {
            setTogglingFavorite(false);
        }
    };

    const handleDownloadCertificate = async () => {
        const studentInfo = localStorage.getItem('studentInfo');
        if (!studentInfo) return;

        const { studentId } = JSON.parse(studentInfo);

        // Show loading state manually
        Swal.fire({
            title: 'Generating Certificate',
            text: 'Please wait while we prepare your certificate...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Using axios for blob response
            const response = await axios.get(`${baseUrl}/generate-certificate/${studentId}/${id}/`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate-${courseData.title}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            Swal.fire({
                title: 'Success!',
                text: 'Certificate downloaded successfully!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Certificate download error:', error);

            let errorMessage = 'Failed to generate certificate';

            if (error.response) {
                // If response is a blob (JSON in blob), we need to read it
                if (error.response.data instanceof Blob) {
                    try {
                        const text = await error.response.data.text();
                        const data = JSON.parse(text);
                        errorMessage = data.message || errorMessage;
                    } catch (e) {
                        // Likely HTML error if parsing fails
                        console.error("Could not parse error blob", e);
                        errorMessage = "Server error occurred. Please try again.";
                    }
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else {
                    errorMessage = `Server Error: ${error.response.status}`;
                }
            }

            Swal.fire('Error', errorMessage, 'error');
        }
    };

    if (loading) return (
        <div>
            {/* Simple header for loading state */}
            <section style={{
                background: 'linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%)',
                color: 'white',
                position: 'relative',
                paddingTop: '120px',
                paddingBottom: '2rem',
                marginBottom: '2rem'
            }}>
                <div className="container">
                    <h1 className="fw-bold mb-0">Loading Course</h1>
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

            <div className="container mt-3 text-center">
                <Loader size="large" />
            </div>
        </div>
    );

    if (error) return (
        <div>
            {/* Simple header for error state */}
            <section style={{
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                color: 'white',
                position: 'relative',
                paddingTop: '120px',
                paddingBottom: '2rem',
                marginBottom: '2rem'
            }}>
                <div className="container">
                    <h1 className="fw-bold mb-0">Error</h1>
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
                            <h5 style={{ fontWeight: '600', marginBottom: '10px' }}>Something went wrong</h5>
                            <p className="mb-0">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!courseData) return (
        <div>
            {/* Simple header for not found state */}
            <section style={{
                background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                color: 'white',
                position: 'relative',
                paddingTop: '120px',
                paddingBottom: '2rem',
                marginBottom: '2rem'
            }}>
                <div className="container">
                    <h1 className="fw-bold mb-0">Course Not Found</h1>
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
                <div style={{
                    background: 'rgba(255, 193, 7, 0.1)',
                    color: '#856404',
                    padding: '25px',
                    borderRadius: '15px',
                    marginBottom: '20px',
                    border: 'none'
                }}>
                    <div className="d-flex">
                        <div style={{ marginRight: '20px' }}>
                            <i className="bi bi-exclamation-circle-fill" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <div>
                            <h5 style={{ fontWeight: '600', marginBottom: '10px' }}>Course Not Available</h5>
                            <p className="mb-0">This course could not be found or has been removed.</p>
                            <div className="mt-3">
                                <Link to="/all-courses" className="btn" style={{
                                    background: 'linear-gradient(45deg, #ffc107, #e0a800)',
                                    color: 'white',
                                    borderRadius: '50px',
                                    padding: '0.5rem 1.5rem',
                                    fontWeight: '500',
                                    border: 'none',
                                    boxShadow: '0 4px 10px rgba(255, 193, 7, 0.2)',
                                    transition: 'all 0.3s ease',
                                    textDecoration: 'none'
                                }}>
                                    <i className="bi bi-arrow-left me-2"></i> Browse All Courses
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );

    return (
        <div className="container-fluid p-0" style={{ background: '#f8f9fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Top Navigation Bar */}
            <div className="bg-white border-bottom sticky-top" style={{ zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div className="container-fluid px-4 py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <Link to={isTeacher ? "/" : "/all-courses"} className="text-decoration-none text-dark me-3">
                                <i className="bi bi-arrow-left fs-5"></i>
                            </Link>
                            <h5 className="mb-0 fw-bold">{courseData.title}</h5>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-none d-md-block">
                                <span className="text-muted small me-2">Progress</span>
                                <span className="fw-bold" style={{ color: '#8e44ad' }}>
                                    {Math.round((completedChapters.length / chapterData.length) * 100) || 0}%
                                </span>
                            </div>
                            <div className="progress" style={{ width: '100px', height: '6px' }}>
                                <div className="progress-bar" role="progressbar"
                                    style={{ width: `${(completedChapters.length / chapterData.length) * 100}%`, backgroundColor: '#8e44ad' }}
                                    aria-valuenow={Math.round((completedChapters.length / chapterData.length) * 100)} aria-valuemin="0" aria-valuemax="100">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-0 flex-grow-1">

                {/* Left Sidebar - Chapter Navigation */}
                <div className="col-lg-3 d-none d-lg-block border-end bg-white" style={{ height: 'calc(100vh - 70px)', overflowY: 'auto' }}>
                    <div className="p-4 border-bottom">
                        <h6 className="fw-bold mb-1">Course Content</h6>
                        <small className="text-muted">{chapterData.length} Chapters • {completedChapters.length} Completed</small>
                    </div>
                    <div className="list-group list-group-flush">
                        <button
                            onClick={() => setActiveChapter(null)}
                            className={`list-group-item list-group-item-action p-3 border-0 border-bottom ${!activeChapter ? 'bg-light' : ''}`}
                            style={{
                                borderLeft: !activeChapter ? '4px solid #8e44ad' : '4px solid transparent',
                                cursor: 'pointer'
                            }}
                        >
                            <div className="d-flex w-100 justify-content-between align-items-center">
                                <h6 className="mb-0 fw-bold" style={{ color: !activeChapter ? '#8e44ad' : '#333' }}>
                                    <i className="bi bi-info-circle me-2"></i>Course Overview
                                </h6>
                            </div>
                        </button>
                        {chapterData.map((chapter, index) => {
                            const isAccessible = isChapterAccessible(chapter.id, index);
                            const isCompleted = completedChapters.includes(chapter.id);
                            const isActive = activeChapter === chapter.id;

                            return (
                                <button
                                    key={chapter.id}
                                    onClick={() => isAccessible && setActiveChapter(chapter.id)}
                                    className={`list-group-item list-group-item-action p-3 border-0 border-bottom ${isActive ? 'bg-light' : ''}`}
                                    style={{
                                        cursor: isAccessible ? 'pointer' : 'not-allowed',
                                        borderLeft: isActive ? '4px solid #8e44ad' : '4px solid transparent',
                                        opacity: isAccessible ? 1 : 0.7
                                    }}
                                >
                                    <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                                        <small className="text-uppercase text-muted fw-bold" style={{ fontSize: '0.75rem' }}>
                                            Chapter {index + 1}
                                        </small>
                                        {isCompleted ? (
                                            <i className="bi bi-check-circle-fill text-success"></i>
                                        ) : !isAccessible ? (
                                            <i className="bi bi-lock-fill text-muted"></i>
                                        ) : (
                                            <i className={`bi ${chapter.video ? 'bi-play-circle' : 'bi-file-text'} text-muted`}></i>
                                        )}
                                    </div>
                                    <h6 className="mb-0 text-truncate" style={{ color: isActive ? '#8e44ad' : '#333' }}>
                                        {chapter.title}
                                    </h6>
                                    <small className="text-muted">{chapter.video ? 'Video' : 'Reading'}</small>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="col-lg-9" style={{ height: 'calc(100vh - 70px)', overflowY: 'auto' }}>
                    {activeChapter ? (
                        // Active Chapter View
                        <div className="p-0">
                            {/* Video Player Section */}
                            {chapterData.find(c => c.id === activeChapter)?.video_url ? (
                                <div className="ratio ratio-16x9 bg-dark">
                                    <iframe
                                        src={chapterData.find(c => c.id === activeChapter).video_url.replace("watch?v=", "embed/")}
                                        title="YouTube video player"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : chapterData.find(c => c.id === activeChapter)?.video ? (
                                <div className="ratio ratio-16x9 bg-dark">
                                    <video
                                        controls
                                        className="w-100 h-100"
                                        onEnded={() => handleChapterComplete(activeChapter)}
                                        key={chapterData.find(c => c.id === activeChapter).video}
                                    >
                                        <source src={chapterData.find(c => c.id === activeChapter).video} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ) : null}

                            <div className="container p-4 p-md-5">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div>
                                        <h2 className="fw-bold mb-2">{chapterData.find(c => c.id === activeChapter)?.title}</h2>
                                        <p className="text-muted lead mb-0">{chapterData.find(c => c.id === activeChapter)?.description}</p>
                                    </div>
                                    {!completedChapters.includes(activeChapter) && (
                                        <button
                                            onClick={() => handleChapterComplete(activeChapter)}
                                            className="btn btn-success btn-lg px-4 rounded-pill"
                                        >
                                            <i className="bi bi-check2-circle me-2"></i> Mark Complete
                                        </button>
                                    )}
                                </div>

                                {/* Text Content */}
                                {chapterData.find(c => c.id === activeChapter)?.content && (
                                    <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
                                        <h5 className="fw-bold border-bottom pb-2 mb-3">Study Material</h5>
                                        <div dangerouslySetInnerHTML={{ __html: chapterData.find(c => c.id === activeChapter).content }} />
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="d-flex justify-content-between mt-5 pt-3 border-top">
                                    <button
                                        className="btn btn-outline-secondary rounded-pill px-4"
                                        onClick={() => {
                                            const currentIndex = chapterData.findIndex(c => c.id === activeChapter);
                                            if (currentIndex > 0) setActiveChapter(chapterData[currentIndex - 1].id);
                                        }}
                                        disabled={chapterData.findIndex(c => c.id === activeChapter) === 0}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i> Previous
                                    </button>
                                    <button
                                        className="btn btn-primary rounded-pill px-4"
                                        style={{ backgroundColor: '#8e44ad', borderColor: '#8e44ad' }}
                                        onClick={() => {
                                            const currentIndex = chapterData.findIndex(c => c.id === activeChapter);
                                            if (currentIndex < chapterData.length - 1) setActiveChapter(chapterData[currentIndex + 1].id);
                                        }}
                                        disabled={
                                            chapterData.findIndex(c => c.id === activeChapter) === chapterData.length - 1 ||
                                            !completedChapters.includes(activeChapter) ||
                                            (chapterData.findIndex(c => c.id === activeChapter) < chapterData.length - 1 &&
                                                !isChapterAccessible(chapterData[chapterData.findIndex(c => c.id === activeChapter) + 1].id, chapterData.findIndex(c => c.id === activeChapter) + 1))
                                        }
                                    >
                                        Next <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (

                        // Course Overview (No Chapter Selected)
                        <div className="p-4 p-lg-5">
                            <div className="row">
                                <div className={isTeacher ? "col-12" : "col-lg-8"}>
                                    <div className="d-flex align-items-center mb-4">
                                        <img src={courseData.featured_img ? (courseData.featured_img.startsWith('http') ? courseData.featured_img : `${mediaUrl}${courseData.featured_img}`) : "/logo512.png"} alt={courseData.title} className="rounded-3 me-4" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                        <div>
                                            <div className="d-flex align-items-center gap-3 mb-1">
                                                <h1 className="fw-bold mb-0">{courseData.title}</h1>
                                                {isEnrolled && (
                                                    <button
                                                        onClick={handleFavoriteToggle}
                                                        className="btn btn-outline-danger rounded-circle p-2 d-flex align-items-center justify-content-center"
                                                        style={{ width: '40px', height: '40px', transition: 'all 0.3s' }}
                                                        disabled={togglingFavorite}
                                                        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                                    >
                                                        <i className={`bi bi-heart${isFavorite ? '-fill' : ''}`}></i>
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-muted mb-0">By {courseData.teacher?.full_name}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
                                        <h5 className="fw-bold mb-3">About this Course</h5>
                                        <p>{courseData.description}</p>
                                    </div>

                                    <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
                                        <h5 className="fw-bold mb-3">What you'll learn</h5>
                                        <div className="d-flex flex-wrap gap-2">
                                            {courseData.technologies?.split(',').map((tech, i) => (
                                                <span key={i} className="badge bg-light text-dark p-2 border">{tech.trim()}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Study Materials - Only for Enrolled Students */}
                                    {isEnrolled && studyMaterials.length > 0 && (
                                        <div className="bg-white p-4 rounded-3 shadow-sm mb-4">
                                            <h5 className="fw-bold mb-3">Study Materials</h5>
                                            <div className="list-group list-group-flush">
                                                {studyMaterials.map((material) => (
                                                    <a
                                                        key={material.id}
                                                        href={material.file}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 border rounded-3 mb-2"
                                                    >
                                                        <div className="d-flex align-items-center">
                                                            <i className="bi bi-file-earmark-text fs-4 text-primary me-3"></i>
                                                            <div>
                                                                <h6 className="mb-0 fw-bold">{material.title}</h6>
                                                                <small className="text-muted">{material.description}</small>
                                                            </div>
                                                        </div>
                                                        <i className="bi bi-download fs-5 text-secondary"></i>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {!isTeacher && (
                                    <div className="col-lg-4">
                                        <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
                                            <div className="card-body p-4">
                                                <h3 className="fw-bold text-center mb-1">
                                                    {isEnrolled ? "Enrolled" : (courseData.price === 0 ? "FREE" : `₹${courseData.price}`)}
                                                </h3>
                                                <p className="text-center text-muted small mb-4">Full Lifetime Access</p>

                                                {isEnrolled ? (
                                                    <button
                                                        className="btn btn-success w-100 rounded-pill mb-3 py-2 fw-bold"
                                                        disabled
                                                    >
                                                        Enrolled
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleEnroll}
                                                        className="btn btn-primary w-100 rounded-pill mb-3 py-2 fw-bold"
                                                        style={{ backgroundColor: '#8e44ad', borderColor: '#8e44ad' }}
                                                    >
                                                        Enroll Now
                                                    </button>
                                                )}

                                                <div className="d-flex justify-content-between border-bottom py-2 mt-3">
                                                    <span><i className="bi bi-book me-2"></i>Chapters</span>
                                                    <span className="fw-bold">{chapterData.length}</span>
                                                </div>
                                                <div className="d-flex justify-content-between border-bottom py-2">
                                                    <span><i className="bi bi-people me-2"></i>Students</span>
                                                    <span className="fw-bold">{courseData.total_enrolled}</span>
                                                </div>
                                                <div className="d-flex justify-content-between py-2">
                                                    <span><i className="bi bi-star me-2"></i>Rating</span>
                                                    <span className="fw-bold">{courseData.average_rating}/5</span>
                                                </div>

                                                {isEnrolled && (
                                                    <div className="mt-4 pt-3 border-top text-center">
                                                        <p className="mb-2 fw-bold">Rate this course</p>
                                                        <div className="d-flex justify-content-center gap-2">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <i
                                                                    key={star}
                                                                    className={`bi bi-star${userRating?.rating >= star ? '-fill' : ''} text-warning fs-4`}
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => setShowRatingModal(true)}
                                                                ></i>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Certificate Download */}
                                                {isEnrolled && completedChapters.length === chapterData.length && chapterData.length > 0 && (
                                                    <div className="mt-3">
                                                        <button
                                                            onClick={handleDownloadCertificate}
                                                            className="btn btn-outline-success w-100 rounded-pill py-2 fw-bold"
                                                        >
                                                            <i className="bi bi-award me-2"></i> Download Certificate
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Related Courses */}
                            {relatedCourses.length > 0 && (
                                <div className="mt-5">
                                    <h4 className="fw-bold mb-4">Related Courses</h4>
                                    <div className="row g-4">
                                        {relatedCourses.map(course => (
                                            <div key={course.id} className="col-md-6 col-xl-4">
                                                <div className="card h-100 border-0 shadow-sm">
                                                    <Link to={`/detail/${course.id}`} className="text-decoration-none text-dark">
                                                        <img src={course.featured_img} className="card-img-top" alt={course.title} style={{ height: '180px', objectFit: 'cover' }} />
                                                        <div className="card-body">
                                                            <h5 className="card-title fw-bold">{course.title}</h5>
                                                            <p className="card-text text-muted small">{course.description.substring(0, 80)}...</p>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Rating Modal */}
            {
                showRatingModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                                <div className="modal-header border-0 bg-light p-4">
                                    <h5 className="modal-title fw-bold">Rate this Course</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowRatingModal(false)}></button>
                                </div>
                                <div className="modal-body p-4 text-center">
                                    <div className="mb-4">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <i key={star} className={`bi bi-star-fill display-6 mx-1`}
                                                style={{ color: rating >= star ? '#ffc107' : '#e4e5e9', cursor: 'pointer' }}
                                                onClick={() => setRating(star)}></i>
                                        ))}
                                    </div>
                                    <textarea
                                        className="form-control bg-light border-0 p-3 rounded-3"
                                        rows="3"
                                        placeholder="Write a review..."
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0 justify-content-center">
                                    <button className="btn btn-light rounded-pill px-4 me-2" onClick={() => setShowRatingModal(false)}>Cancel</button>
                                    <button className="btn btn-primary rounded-pill px-5" style={{ backgroundColor: '#8e44ad', border: 'none' }} onClick={handleRatingSubmit} disabled={submittingRating}>
                                        {submittingRating ? 'Submitting...' : 'Submit Rating'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}



export default CourseDetail;
