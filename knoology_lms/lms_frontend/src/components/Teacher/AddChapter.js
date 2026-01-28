import React from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import TeacherSidebar from './TeacherSidebar';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const BASE_API_URL = 'http://127.0.0.1:8000/api';

// Add custom styles for the rich text content viewing
const contentStyles = `
    .chapter-content h1, .chapter-content h2 {
        color: #1a56c9;
        margin-bottom: 1rem;
        font-weight: 600;
    }
    .chapter-content h3, .chapter-content h4, .chapter-content h5, .chapter-content h6 {
        color: #002254;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
    }
    .chapter-content p {
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    .chapter-content ul, .chapter-content ol {
        margin-bottom: 1.5rem;
        padding-left: 1.5rem;
    }
    .chapter-content li {
        margin-bottom: 0.5rem;
    }
    .chapter-content img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 1rem 0;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .chapter-content blockquote {
        border-left: 4px solid #1a56c9;
        padding-left: 1rem;
        margin: 1.5rem 0;
        color: #506690;
        font-style: italic;
    }
    .chapter-content code {
        background-color: #f8f9fa;
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-family: monospace;
        color: #e83e8c;
    }
    .chapter-content pre {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 5px;
        border: 1px solid #e3e6f0;
        overflow-x: auto;
        margin: 1rem 0;
    }
    .chapter-content table {
        width: 100%;
        margin-bottom: 1rem;
        background-color: transparent;
        border-collapse: collapse;
    }
    .chapter-content table th,
    .chapter-content table td {
        padding: 0.75rem;
        vertical-align: top;
        border: 1px solid #e3e6f0;
    }
    .chapter-content table thead th {
        vertical-align: bottom;
        border-bottom: 2px solid #e3e6f0;
        background-color: #f8f9fa;
    }
`;

// Reusable loader component
const Loader = ({ size = "medium" }) => {
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
            <p className="mt-3 text-muted">Processing your request...</p>
        </div>
    );
};

function AddChapter() {
    const { course_id } = useParams();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [courseTitle, setCourseTitle] = useState('');
    const [chapterData, setChapterData] = useState({
        title: '',
        description: '',
        video: null,
        video_url: '',
        text_content: '',
        remarks: ''
    });
    const [contentType, setContentType] = useState('video'); // 'video', 'youtube', or 'text'

    // Store rich text editor event listeners to clean up
    const editorListenersRef = useRef([]);

    // Clean up event listeners
    const cleanupRichTextEditor = useCallback(() => {
        editorListenersRef.current.forEach(item => {
            const { element, type, listener } = item;
            if (element) {
                element.removeEventListener(type, listener);
            }
        });
        editorListenersRef.current = [];
    }, []);

    // Add an event listener that will be cleaned up later
    const addEditorListener = useCallback((element, type, listener) => {
        if (element) {
            element.addEventListener(type, listener);
            editorListenersRef.current.push({ element, type, listener });
        }
    }, []);

    // Function to initialize the rich text editor
    const initRichTextEditor = useCallback(() => {
        const textArea = document.getElementById('text_content');
        const previewButton = document.getElementById('preview-button');
        const editorContainer = document.getElementById('editor-container');
        const previewContainer = document.getElementById('preview-container');
        const contentPreview = document.getElementById('content-preview');

        if (!textArea || !previewButton || !editorContainer || !previewContainer || !contentPreview) {
            return; // Exit if elements not found
        }

        let previewActive = false;

        // Function to toggle between edit and preview modes
        const togglePreview = () => {
            if (previewActive) {
                // Switch to edit mode
                previewContainer.style.display = 'none';
                editorContainer.style.display = 'block';
                previewButton.innerHTML = '<i class="bi bi-eye me-1"></i> Preview';
                previewActive = false;
            } else {
                // Switch to preview mode
                contentPreview.innerHTML = textArea.value;

                // Add responsive table styling
                const tables = contentPreview.querySelectorAll('table');
                tables.forEach(table => {
                    const wrapper = document.createElement('div');
                    wrapper.classList.add('table-responsive', 'my-4');
                    table.classList.add('table', 'table-striped');
                    table.parentNode.insertBefore(wrapper, table);
                    wrapper.appendChild(table);
                });

                previewContainer.style.display = 'block';
                editorContainer.style.display = 'none';
                previewButton.innerHTML = '<i class="bi bi-pencil me-1"></i> Edit';
                previewActive = true;
            }
        };

        // Add preview toggle functionality
        addEditorListener(previewButton, 'click', togglePreview);

        // Add functionality to toolbar buttons
        const toolbarButtons = document.querySelectorAll('.rich-text-toolbar button');
        toolbarButtons.forEach(button => {
            const buttonClickHandler = (e) => {
                e.preventDefault();

                // Switch to edit mode if we're in preview mode
                if (previewActive) {
                    togglePreview();
                }

                const format = button.getAttribute('data-format');
                const selection = textArea.value.substring(textArea.selectionStart, textArea.selectionEnd);
                let replacement = '';

                // Add formatting based on button clicked
                switch (format) {
                    case 'bold':
                        replacement = `<strong>${selection || 'Bold text'}</strong>`;
                        break;
                    case 'italic':
                        replacement = `<em>${selection || 'Italic text'}</em>`;
                        break;
                    case 'underline':
                        replacement = `<u>${selection || 'Underlined text'}</u>`;
                        break;
                    case 'heading':
                        replacement = `<h2>${selection || 'Heading'}</h2>`;
                        break;
                    case 'list':
                        replacement = `<ul>\n  <li>${selection || 'List item'}</li>\n  <li>Another list item</li>\n</ul>`;
                        break;
                    case 'ol':
                        replacement = `<ol>\n  <li>${selection || 'First item'}</li>\n  <li>Second item</li>\n</ol>`;
                        break;
                    case 'link':
                        replacement = `<a href="https://example.com" target="_blank">${selection || 'Link text'}</a>`;
                        break;
                    case 'image':
                        replacement = `<img src="https://placeholder.pics/svg/300x200/DEDEDE/555555/Image%20Placeholder" alt="${selection || 'Image description'}" class="img-fluid" />`;
                        break;
                    case 'quote':
                        replacement = `<blockquote>${selection || 'Quoted text'}</blockquote>`;
                        break;
                    case 'code':
                        replacement = `<pre><code>${selection || 'Code snippet'}</code></pre>`;
                        break;
                    case 'table':
                        replacement = `<table class="table">\n  <thead>\n    <tr>\n      <th>Header 1</th>\n      <th>Header 2</th>\n      <th>Header 3</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td>Row 1, Cell 1</td>\n      <td>Row 1, Cell 2</td>\n      <td>Row 1, Cell 3</td>\n    </tr>\n    <tr>\n      <td>Row 2, Cell 1</td>\n      <td>Row 2, Cell 2</td>\n      <td>Row 2, Cell 3</td>\n    </tr>\n  </tbody>\n</table>`;
                        break;
                    default:
                        break;
                }

                if (replacement) {
                    const startPos = textArea.selectionStart;
                    const endPos = textArea.selectionEnd;

                    // Update text area content
                    const newContent =
                        textArea.value.substring(0, startPos) +
                        replacement +
                        textArea.value.substring(endPos);

                    // Update state
                    setChapterData(prev => ({
                        ...prev,
                        text_content: newContent
                    }));

                    // Set focus back to textarea
                    setTimeout(() => {
                        textArea.focus();
                        // Try to set cursor position after the inserted text
                        textArea.selectionStart = startPos + replacement.length;
                        textArea.selectionEnd = startPos + replacement.length;
                    }, 0);
                }

                // Highlight the button briefly to provide feedback
                button.classList.add('active', 'btn-primary', 'text-white');
                setTimeout(() => {
                    button.classList.remove('active', 'btn-primary', 'text-white');
                }, 300);
            };

            addEditorListener(button, 'click', buttonClickHandler);
        });

        // Add input event listener to textarea for real-time preview updates
        const textAreaInputHandler = () => {
            if (previewActive) {
                contentPreview.innerHTML = textArea.value;
            }
        };

        addEditorListener(textArea, 'input', textAreaInputHandler);
    }, [addEditorListener]);

    useEffect(() => {
        document.title = "Add Chapter | Knoology LMS";
        // Check if teacher is logged in
        const teacherData = localStorage.getItem('teacherData');
        if (!teacherData) {
            navigate('/teacher-login');
            return;
        }

        // Fetch course title
        const fetchCourseDetails = async () => {
            try {
                const response = await axios.get(`${BASE_API_URL}/course/${course_id}/`);
                setCourseTitle(response.data.title);
            } catch (error) {
                console.error('Error fetching course details:', error);
            }
        };

        fetchCourseDetails();
    }, [navigate, course_id]);

    // Effect for rich text editor initialization
    useEffect(() => {
        // Initialize rich text editor when contentType is text
        if (contentType === 'text') {
            const initTimer = setTimeout(() => {
                initRichTextEditor();
            }, 100);

            return () => {
                clearTimeout(initTimer);
                cleanupRichTextEditor();
            };
        }
    }, [contentType, initRichTextEditor, cleanupRichTextEditor]);

    const handleChange = (e) => {
        setChapterData({
            ...chapterData,
            [e.target.name]: e.target.value
        });
        setErrorMsg("");
        setSuccessMsg("");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (50MB max)
            if (file.size > 50 * 1024 * 1024) {
                setErrorMsg("Video size should not exceed 50MB");
                e.target.value = '';
                return;
            }
            setChapterData({
                ...chapterData,
                video: file
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setLoading(true);

        // Validate based on content type
        if (contentType === 'video' && !chapterData.video && !chapterData.text_content) {
            setErrorMsg("Please upload a video or provide text content");
            setLoading(false);
            return;
        }

        if (contentType === 'youtube' && !chapterData.video_url && !chapterData.text_content) {
            setErrorMsg("Please provide a YouTube URL or text content");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', chapterData.title);
        formData.append('description', chapterData.description);

        if (chapterData.video) {
            formData.append('video', chapterData.video);
        }
        if (chapterData.video_url) {
            formData.append('video_url', chapterData.video_url);
        }

        // Always include text_content field (can be empty)
        formData.append('text_content', chapterData.text_content);
        formData.append('remarks', chapterData.remarks);

        try {
            const response = await axios.post(
                `${BASE_API_URL}/course/${course_id}/chapters/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setSuccessMsg("Chapter added successfully!");
            // Reset form
            setChapterData({
                title: '',
                description: '',
                video: null,
                text_content: '',
                remarks: ''
            });
            // Clear file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

            // Redirect after 2 seconds
            setTimeout(() => {
                navigate(`/teacher-courses`);
            }, 2000);

        } catch (error) {
            console.error('Error adding chapter:', error);
            if (error.response?.data?.message) {
                setErrorMsg(error.response.data.message);
            } else if (error.response?.data) {
                const errors = Object.values(error.response.data).flat().join(', ');
                setErrorMsg(errors);
            } else {
                setErrorMsg('Failed to add chapter. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='container-fluid pb-4 px-4' style={{ paddingTop: '100px' }}>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <TeacherSidebar />
                </div>
                <div className='col-md-9'>
                    {/* Page Header */}
                    <div className="page-header" style={{
                        background: 'linear-gradient(135deg, #1a56c9 0%, #002254 100%)',
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
                                    background: 'linear-gradient(45deg, #002254, #1a56c9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(0, 34, 84, 0.3)'
                                }}>
                                    <i className="bi bi-collection-play" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Add Chapter
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        {courseTitle ? `Add content to "${courseTitle}"` : 'Create new educational content'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="card-section" style={{
                        background: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                        overflow: 'hidden',
                        marginBottom: '30px'
                    }}>
                        <div className="section-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '20px 25px',
                            borderBottom: '1px solid #f0f0f0'
                        }}>
                            <div className="d-flex align-items-center">
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, rgba(26, 86, 201, 0.1), rgba(0, 34, 84, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-pencil-square" style={{
                                        color: '#1a56c9',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Chapter Details
                                </h5>
                            </div>
                        </div>
                        <div className="section-body p-4">
                            {errorMsg && (
                                <div className="alert mb-4" style={{
                                    background: 'rgba(220, 53, 69, 0.1)',
                                    color: '#dc3545',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px'
                                }} role="alert">
                                    <div className="d-flex">
                                        <div style={{ marginRight: '15px' }}>
                                            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Error</h6>
                                            <p className="mb-0">{errorMsg}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {successMsg && (
                                <div className="alert mb-4" style={{
                                    background: 'rgba(25, 135, 84, 0.1)',
                                    color: '#198754',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '15px'
                                }} role="alert">
                                    <div className="d-flex">
                                        <div style={{ marginRight: '15px' }}>
                                            <i className="bi bi-check-circle-fill" style={{ fontSize: '1.5rem' }}></i>
                                        </div>
                                        <div>
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Success!</h6>
                                            <p className="mb-0">{successMsg}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <Loader size="medium" />
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-section mb-4" style={{
                                        background: 'rgba(26, 86, 201, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <div className="mb-3">
                                            <label htmlFor="title" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Chapter Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                id="title"
                                                value={chapterData.title}
                                                onChange={handleChange}
                                                placeholder="Enter chapter title"
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="description" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Description</label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                id="description"
                                                value={chapterData.description}
                                                onChange={handleChange}
                                                rows="4"
                                                placeholder="Enter chapter description"
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                                required
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="form-section mb-4" style={{
                                        background: 'rgba(26, 86, 201, 0.03)',
                                        padding: '20px',
                                        borderRadius: '15px'
                                    }}>
                                        <div className="mb-4">
                                            <label className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Content Type</label>
                                            <div className="d-flex">
                                                <div className="form-check me-4">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="contentType"
                                                        id="videoContent"
                                                        checked={contentType === 'video'}
                                                        onChange={() => setContentType('video')}
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderColor: '#1a56c9'
                                                        }}
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="videoContent"
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <i className="bi bi-camera-video me-2" style={{ color: '#1a56c9' }}></i>
                                                        Video Upload
                                                    </label>
                                                </div>
                                                <div className="form-check me-4">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="contentType"
                                                        id="youtubeContent"
                                                        checked={contentType === 'youtube'}
                                                        onChange={() => setContentType('youtube')}
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderColor: '#ff0000'
                                                        }}
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="youtubeContent"
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <i className="bi bi-youtube me-2" style={{ color: '#ff0000' }}></i>
                                                        YouTube URL
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="contentType"
                                                        id="textContent"
                                                        checked={contentType === 'text'}
                                                        onChange={() => setContentType('text')}
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderColor: '#1a56c9'
                                                        }}
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="textContent"
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <i className="bi bi-file-text me-2" style={{ color: '#1a56c9' }}></i>
                                                        Text Content
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="form-text text-muted mt-2">
                                                <i className="bi bi-info-circle me-1"></i>
                                                You can provide video, text content, or both
                                            </div>
                                        </div>

                                        {/* Video Upload Form */}
                                        {contentType === 'video' && (
                                            <div className="mb-3">
                                                <label htmlFor="video" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Video Content (Max 50MB)</label>
                                                <div className="input-group">
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        name="video"
                                                        id="video"
                                                        onChange={handleFileChange}
                                                        accept="video/*"
                                                        style={{
                                                            padding: '0.75rem 1rem',
                                                            borderRadius: '10px',
                                                            border: '1px solid #e2e8f0',
                                                            boxShadow: 'none'
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-text text-muted">
                                                    <i className="bi bi-info-circle me-1"></i>
                                                    Upload educational video content (MP4 format is recommended)
                                                </div>
                                            </div>
                                        )}

                                        {/* YouTube URL Form */}
                                        {contentType === 'youtube' && (
                                            <div className="mb-3">
                                                <label htmlFor="video_url" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>YouTube Video URL</label>
                                                <div className="input-group">
                                                    <span className="input-group-text" style={{ background: '#f8d7da', border: '1px solid #e2e8f0' }}>
                                                        <i className="bi bi-youtube text-danger"></i>
                                                    </span>
                                                    <input
                                                        type="url"
                                                        className="form-control"
                                                        name="video_url"
                                                        id="video_url"
                                                        value={chapterData.video_url}
                                                        onChange={handleChange}
                                                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                                                        style={{
                                                            padding: '0.75rem 1rem',
                                                            borderRadius: '0 10px 10px 0',
                                                            border: '1px solid #e2e8f0',
                                                            boxShadow: 'none'
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-text text-muted">
                                                    <i className="bi bi-info-circle me-1"></i>
                                                    Paste the full YouTube video URL
                                                </div>
                                            </div>
                                        )}

                                        {/* Text Content Form (shown when contentType is 'text' or both are allowed) */}
                                        {contentType === 'text' && (
                                            <div className="mb-3">
                                                <label htmlFor="text_content" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Text Content</label>

                                                <div className="d-flex justify-content-between mb-2">
                                                    <div className="rich-text-toolbar border rounded p-2 bg-light d-flex flex-wrap">
                                                        <button type="button" className="btn btn-sm btn-outline-secondary me-1 mb-1" title="Bold" data-format="bold">
                                                            <i className="bi bi-type-bold"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary me-1 mb-1" title="Italic" data-format="italic">
                                                            <i className="bi bi-type-italic"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary me-1 mb-1" title="Underline" data-format="underline">
                                                            <i className="bi bi-type-underline"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary me-1 mb-1" title="Heading" data-format="heading">
                                                            <i className="bi bi-type-h1"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary me-1 mb-1" title="List" data-format="list">
                                                            <i className="bi bi-list-ul"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary me-1 mb-1" title="Numbered List" data-format="ol">
                                                            <i className="bi bi-list-ol"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary me-1 mb-1" title="Link" data-format="link">
                                                            <i className="bi bi-link"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary me-1 mb-1" title="Image" data-format="image">
                                                            <i className="bi bi-image"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary me-1 mb-1" title="Quote" data-format="quote">
                                                            <i className="bi bi-blockquote-left"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary me-1 mb-1" title="Code" data-format="code">
                                                            <i className="bi bi-code"></i>
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary me-1 mb-1" title="Table" data-format="table">
                                                            <i className="bi bi-table"></i>
                                                        </button>
                                                    </div>
                                                    <button id="preview-button" type="button" className="btn btn-sm btn-primary">
                                                        <i className="bi bi-eye me-1"></i> Preview
                                                    </button>
                                                </div>

                                                <div id="editor-container">
                                                    <textarea
                                                        className="form-control"
                                                        name="text_content"
                                                        id="text_content"
                                                        value={chapterData.text_content}
                                                        onChange={handleChange}
                                                        rows="12"
                                                        placeholder="Enter detailed text content for this chapter"
                                                        style={{
                                                            padding: '0.75rem 1rem',
                                                            borderRadius: '10px',
                                                            border: '1px solid #e2e8f0',
                                                            boxShadow: 'none',
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.9rem',
                                                            minHeight: '300px',
                                                            lineHeight: '1.5'
                                                        }}
                                                    ></textarea>
                                                </div>

                                                <div id="preview-container" className="border rounded p-3 mt-2 bg-white" style={{ display: 'none', minHeight: '300px', maxHeight: '600px', overflowY: 'auto' }}>
                                                    <style>{contentStyles}</style>
                                                    <div className="chapter-content" id="content-preview"></div>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <small className="text-muted">You can use HTML tags for advanced formatting</small>
                                                    <small className="text-primary"><i className="bi bi-lightbulb me-1"></i> Format selected text with toolbar buttons</small>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label htmlFor="remarks" className="form-label" style={{ fontWeight: '500', color: '#506690' }}>Remarks (Optional)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="remarks"
                                                id="remarks"
                                                value={chapterData.remarks}
                                                onChange={handleChange}
                                                placeholder="Enter remarks (optional)"
                                                style={{
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e2e8f0',
                                                    boxShadow: 'none'
                                                }}
                                            />
                                            <div className="form-text text-muted">
                                                <i className="bi bi-info-circle me-1"></i>
                                                Additional notes for students about this chapter
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between mt-4">
                                        <button
                                            type="button"
                                            onClick={() => navigate(-1)}
                                            className="btn"
                                            style={{
                                                background: '#f8f9fa',
                                                color: '#506690',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.75rem 1.5rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            <i className="bi bi-arrow-left me-2"></i>
                                            Back
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn"
                                            disabled={loading}
                                            style={{
                                                background: 'linear-gradient(45deg, #1a56c9, #002254)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.75rem 2rem',
                                                fontWeight: '500',
                                                boxShadow: '0 5px 15px rgba(26, 86, 201, 0.2)'
                                            }}
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Add Chapter
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddChapter;