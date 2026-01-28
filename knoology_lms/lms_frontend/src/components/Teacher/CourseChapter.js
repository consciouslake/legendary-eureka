import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TeacherSidebar from './TeacherSidebar';
import Swal from 'sweetalert2';

const BASE_API_URL = 'http://127.0.0.1:8000/api';
const BASE_URL = 'http://127.0.0.1:8000';

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
                        color: '#4e73df',
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
                        background: "linear-gradient(45deg, rgba(78, 115, 223, 0.3), rgba(116, 120, 214, 0.3))"
                    }}></div>
                </div>
            </div>
            <p className="mt-3 text-muted">Loading chapters...</p>
        </div>
    );
};

// Add custom styles for the rich text content viewing
const contentStyles = `
    .chapter-content h1, .chapter-content h2 {
        color: #4e73df;
        margin-bottom: 1rem;
        font-weight: 600;
    }
    .chapter-content h3, .chapter-content h4, .chapter-content h5, .chapter-content h6 {
        color: #2e59d9;
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
        border-left: 4px solid #4e73df;
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
        border-top: 1px solid #e3e6f0;
    }
    .chapter-content table thead th {
        vertical-align: bottom;
        border-bottom: 2px solid #e3e6f0;
        background-color: #f8f9fa;
    }
    .chapter-content a {
        color: #4e73df;
        text-decoration: none;
    }
    .chapter-content a:hover {
        text-decoration: underline;
    }
`;

function CourseChapter() {
    const [chapterData, setChapterData] = useState([]);
    const [courseTitle, setCourseTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [editingChapter, setEditingChapter] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const { course_id } = useParams();

    useEffect(() => {
        document.title = "Course Chapters | Knoology LMS";
        fetchChapters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [course_id]);

    const fetchChapters = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_API_URL}/course-chapters/${course_id}/`);
            setChapterData(response.data.chapters);
            setCourseTitle(response.data.course_title);
        } catch (error) {
            console.error('Error fetching chapters:', error);
            setErrorMsg('Failed to load chapters. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (chapterId) => {
        // Use SweetAlert2 for delete confirmation
        const result = await Swal.fire({
            title: 'Delete Chapter',
            text: 'Are you sure you want to delete this chapter? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setLoading(true);
            await axios.delete(`${BASE_API_URL}/chapter/${chapterId}/`);
            setChapterData(prevChapters => prevChapters.filter(chapter => chapter.id !== chapterId));

            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Chapter has been deleted successfully.',
                confirmButtonColor: '#4e73df',
                timer: 2000,
                timerProgressBar: true
            });

            setSuccessMsg('Chapter deleted successfully!');
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error('Error deleting chapter:', error);
            setErrorMsg('Failed to delete chapter. Please try again later.');

            // Show error message
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: 'Failed to delete chapter. Please try again later.',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (chapterId, updatedData) => {
        try {
            setLoading(true);
            setErrorMsg('');

            // Log the form data for debugging
            for (let pair of updatedData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            await axios.put(`${BASE_API_URL}/chapter/${chapterId}/`, updatedData);
            fetchChapters(); // Refresh the chapters list
            setEditingChapter(null); // Exit edit mode

            // Show success message using SweetAlert2
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Chapter updated successfully!',
                confirmButtonColor: '#4e73df',
                timer: 2000,
                timerProgressBar: true
            });

            setSuccessMsg('Chapter updated successfully!');
            setErrorMsg('');
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error('Error updating chapter:', error);
            setErrorMsg('Failed to update chapter. Please try again later.');
            setSuccessMsg('');

            // Show error message using SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update chapter. Please try again later.',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setLoading(false);
        }
    };

    const openVideoModal = (videoUrl) => {
        setSelectedVideo(videoUrl);
    };

    const closeVideoModal = () => {
        setSelectedVideo(null);
    };

    const openContentModal = (chapter) => {
        Swal.fire({
            title: chapter.title,
            html: `
                <style>${contentStyles}</style>
                <div class="content-viewer bg-white p-4" style="max-height: 70vh; overflow-y: auto; border-radius: 8px;">
                    <div class="chapter-content">
                        ${chapter.text_content}
                    </div>
                </div>
            `,
            width: '800px',
            showCloseButton: true,
            showConfirmButton: false,
            background: '#f8f9fa',
            padding: '1rem',
            customClass: {
                title: 'text-left fs-4 fw-bold text-primary mb-3',
                htmlContainer: 'p-0',
                container: 'content-modal-container',
                popup: 'content-modal-popup rounded shadow-lg'
            },
            didOpen: () => {
                // Apply any additional styling to content after modal opens
                const contentElements = document.querySelectorAll('.chapter-content');
                contentElements.forEach(el => {
                    // Add styling to common HTML elements that might be in the content
                    const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    headings.forEach(heading => heading.classList.add('mb-3', 'mt-4', 'text-primary'));

                    const paragraphs = el.querySelectorAll('p');
                    paragraphs.forEach(p => p.classList.add('mb-3', 'text-dark'));

                    const lists = el.querySelectorAll('ul, ol');
                    lists.forEach(list => list.classList.add('mb-4', 'ps-4'));

                    const listItems = el.querySelectorAll('li');
                    listItems.forEach(item => item.classList.add('mb-2'));

                    const blockquotes = el.querySelectorAll('blockquote');
                    blockquotes.forEach(quote => quote.classList.add('border-start', 'ps-4', 'border-4', 'border-primary', 'my-4', 'py-2'));

                    const images = el.querySelectorAll('img');
                    images.forEach(img => img.classList.add('img-fluid', 'rounded', 'my-3'));

                    // Add responsive table styling
                    const tables = el.querySelectorAll('table');
                    tables.forEach(table => {
                        const wrapper = document.createElement('div');
                        wrapper.classList.add('table-responsive', 'my-4');
                        table.classList.add('table', 'table-striped');
                        table.parentNode.insertBefore(wrapper, table);
                        wrapper.appendChild(table);
                    });
                });
            }
        });
    };

    const handleEditWithSweetAlert = (chapter) => {
        let primaryContentType = chapter.text_content ? 'text' : 'video';
        if (chapter.video_url) {
            primaryContentType = 'youtube';
        }

        Swal.fire({
            title: 'Edit Chapter',
            html: `
                <form id="edit-chapter-form" class="text-start">
                    <div class="mb-3">
                        <label for="title" class="form-label fw-bold">Title</label>
                        <input type="text" class="form-control" id="title" value="${chapter.title}" />
                    </div>
                    <div class="mb-3">
                        <label for="description" class="form-label fw-bold">Description</label>
                        <textarea class="form-control" id="description" rows="2">${chapter.description}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold d-block">Content Type</label>
                        <div class="form-check form-check-inline">
                            <input type="radio" class="form-check-input" id="video-type" name="content-type" value="video" ${primaryContentType === 'video' ? 'checked' : ''} />
                            <label class="form-check-label" for="video-type">Video Upload</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input type="radio" class="form-check-input" id="youtube-type" name="content-type" value="youtube" ${primaryContentType === 'youtube' ? 'checked' : ''} />
                            <label class="form-check-label" for="youtube-type">YouTube URL</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input type="radio" class="form-check-input" id="text-type" name="content-type" value="text" ${primaryContentType === 'text' ? 'checked' : ''} />
                            <label class="form-check-label" for="text-type">Text</label>
                        </div>
                    </div>
                    
                    <div id="video-content" class="mb-3" ${primaryContentType === 'video' ? '' : 'style="display:none;"'}>
                        <label for="video" class="form-label fw-bold">Video File</label>
                        <input type="file" class="form-control" id="video" accept="video/*" />
                        ${chapter.video ? `<div class="mt-2"><small class="text-muted">Current video will be kept if no new video is uploaded</small></div>` : ''}
                    </div>

                    <div id="youtube-content" class="mb-3" ${primaryContentType === 'youtube' ? '' : 'style="display:none;"'}>
                        <label for="video_url" class="form-label fw-bold">YouTube Video URL</label>
                        <input type="url" class="form-control" id="video_url" value="${chapter.video_url || ''}" placeholder="https://www.youtube.com/watch?v=..." />
                    </div>
                    
                    <div id="text-content" class="mb-3" ${primaryContentType === 'text' ? '' : 'style="display:none;"'}>
                        <label for="text_content" class="form-label fw-bold">Text Content</label>
                        <div class="d-flex justify-content-between mb-2">
                            <div class="rich-text-toolbar border rounded p-2 bg-light d-flex flex-wrap">
                                <button type="button" class="btn btn-sm btn-outline-secondary me-1 mb-1" title="Bold"><i class="bi bi-type-bold"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-secondary me-1 mb-1" title="Italic"><i class="bi bi-type-italic"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-secondary me-1 mb-1" title="Underline"><i class="bi bi-type-underline"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-secondary me-1 mb-1" title="Heading"><i class="bi bi-type-h1"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-secondary me-1 mb-1" title="List"><i class="bi bi-list-ul"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-secondary me-1 mb-1" title="Link"><i class="bi bi-link"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-secondary me-1 mb-1" title="Image"><i class="bi bi-image"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-secondary me-1 mb-1" title="Quote"><i class="bi bi-blockquote-left"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-secondary me-1 mb-1" title="Code"><i class="bi bi-code"></i></button>
                            </div>
                            <button id="preview-button" type="button" class="btn btn-sm btn-primary">
                                <i class="bi bi-eye me-1"></i> Preview
                            </button>
                        </div>
                        
                        <div id="editor-container">
                            <textarea class="form-control" id="text_content" rows="8" 
                                style="min-height: 200px; font-family: 'Roboto', sans-serif;">${chapter.text_content || ''}</textarea>
                        </div>
                        
                        <div id="preview-container" class="border rounded p-3 mt-2 bg-white" style="display: none; min-height: 200px; overflow-y: auto;">
                            <style>${contentStyles}</style>
                            <div class="chapter-content" id="content-preview"></div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <small class="text-muted">You can use HTML tags for formatting.</small>
                            <small class="text-primary"><i class="bi bi-info-circle me-1"></i> Rich text editor will be available soon</small>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="remarks" class="form-label fw-bold">Remarks</label>
                        <textarea class="form-control" id="remarks" rows="2">${chapter.remarks || ''}</textarea>
                    </div>
                </form>
            `,
            width: '700px',
            showCancelButton: true,
            confirmButtonText: 'Update Chapter',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#4e73df',
            didOpen: () => {
                // Add event listeners to toggle between video and text content
                document.getElementById('video-type').addEventListener('change', () => {
                    document.getElementById('video-content').style.display = 'block';
                    document.getElementById('youtube-content').style.display = 'none';
                    document.getElementById('text-content').style.display = 'none';
                });

                document.getElementById('youtube-type').addEventListener('change', () => {
                    document.getElementById('video-content').style.display = 'none';
                    document.getElementById('youtube-content').style.display = 'block';
                    document.getElementById('text-content').style.display = 'none';
                });

                document.getElementById('text-type').addEventListener('change', () => {
                    document.getElementById('video-content').style.display = 'none';
                    document.getElementById('youtube-content').style.display = 'none';
                    document.getElementById('text-content').style.display = 'block';
                });

                // Add basic functionality to the rich text toolbar buttons
                const textArea = document.getElementById('text_content');
                const toolbarButtons = document.querySelectorAll('.rich-text-toolbar button');
                const previewButton = document.getElementById('preview-button');
                const editorContainer = document.getElementById('editor-container');
                const previewContainer = document.getElementById('preview-container');
                const contentPreview = document.getElementById('content-preview');
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
                        previewContainer.style.display = 'block';
                        editorContainer.style.display = 'none';
                        previewButton.innerHTML = '<i class="bi bi-pencil me-1"></i> Edit';
                        previewActive = true;
                    }
                };

                // Add preview toggle functionality
                previewButton.addEventListener('click', togglePreview);

                toolbarButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();

                        // Switch to edit mode if we're in preview mode
                        if (previewActive) {
                            togglePreview();
                        }

                        const icon = button.querySelector('i');
                        const tag = icon.className;
                        const selection = textArea.value.substring(textArea.selectionStart, textArea.selectionEnd);
                        let replacement = '';

                        // Add basic formatting based on button clicked
                        if (tag.includes('bold')) {
                            replacement = `<strong>${selection || 'Bold text'}</strong>`;
                        } else if (tag.includes('italic')) {
                            replacement = `<em>${selection || 'Italic text'}</em>`;
                        } else if (tag.includes('underline')) {
                            replacement = `<u>${selection || 'Underlined text'}</u>`;
                        } else if (tag.includes('h1')) {
                            replacement = `<h2>${selection || 'Heading'}</h2>`;
                        } else if (tag.includes('list-ul')) {
                            replacement = `<ul>\n  <li>${selection || 'List item 1'}</li>\n  <li>List item 2</li>\n</ul>`;
                        } else if (tag.includes('link')) {
                            replacement = `<a href="https://example.com" target="_blank">${selection || 'Link text'}</a>`;
                        } else if (tag.includes('image')) {
                            replacement = `<img src="https://placeholder.pics/svg/300x200/DEDEDE/555555/Image%20Placeholder" alt="${selection || 'Image description'}" class="img-fluid" />`;
                        } else if (tag.includes('blockquote')) {
                            replacement = `<blockquote>${selection || 'Quoted text'}</blockquote>`;
                        } else if (tag.includes('code')) {
                            replacement = `<pre><code>${selection || 'Code snippet'}</code></pre>`;
                        }

                        if (replacement) {
                            const startPos = textArea.selectionStart;
                            const endPos = textArea.selectionEnd;

                            textArea.value =
                                textArea.value.substring(0, startPos) +
                                replacement +
                                textArea.value.substring(endPos);

                            // Set focus back to textarea
                            textArea.focus();
                        }

                        // Highlight the button briefly to provide feedback
                        button.classList.add('active', 'btn-primary', 'text-white');
                        setTimeout(() => {
                            button.classList.remove('active', 'btn-primary', 'text-white');
                        }, 300);
                    });
                });

                // Add input event listener to textarea for real-time preview updates
                textArea.addEventListener('input', () => {
                    if (previewActive) {
                        contentPreview.innerHTML = textArea.value;
                    }
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedData = new FormData();
                updatedData.append('title', document.getElementById('title').value);
                updatedData.append('description', document.getElementById('description').value);
                updatedData.append('remarks', document.getElementById('remarks').value);

                const contentType = document.querySelector('input[name="content-type"]:checked').value;

                if (contentType === 'video') {
                    const videoFile = document.getElementById('video').files[0];
                    if (videoFile) {
                        updatedData.append('video', videoFile);
                    }
                    // Clear video_url and text_content if switching to video upload
                    updatedData.append('video_url', '');
                    updatedData.append('text_content', '');
                } else if (contentType === 'youtube') {
                    updatedData.append('video_url', document.getElementById('video_url').value);
                    // Clear video and text_content if switching to YouTube URL
                    updatedData.append('video', ''); // Assuming backend handles empty file gracefully
                    updatedData.append('text_content', '');
                } else {
                    // Text content
                    updatedData.append('text_content', document.getElementById('text_content').value);
                    // Clear video and video_url if switching to text
                    updatedData.append('video', '');
                    updatedData.append('video_url', '');
                }

                handleUpdate(chapter.id, updatedData);
            }
        });
    };

    return (
        <div className='container-fluid py-4 px-4'>
            <div className='row g-4'>
                <div className='col-md-3'>
                    <TeacherSidebar />
                </div>
                <div className='col-md-9'>
                    {/* Page Header */}
                    <div className="page-header" style={{
                        background: 'linear-gradient(135deg, #4e73df 0%, #7478d6 100%)',
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
                                    background: 'linear-gradient(45deg, #4e73df, #7478d6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px',
                                    boxShadow: '0 10px 20px rgba(78, 115, 223, 0.3)'
                                }}>
                                    <i className="bi bi-collection-play" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                                </div>

                                <div>
                                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '5px' }}>
                                        Course Chapters
                                    </h3>
                                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                        {courseTitle ? `Manage content for "${courseTitle}"` : 'Course content management'}
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
                                    background: 'linear-gradient(135deg, rgba(78, 115, 223, 0.1), rgba(116, 120, 214, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '15px'
                                }}>
                                    <i className="bi bi-list-columns-reverse" style={{
                                        color: '#4e73df',
                                        fontSize: '1.2rem'
                                    }}></i>
                                </div>
                                <h5 className="mb-0" style={{ fontWeight: '600', color: '#002254' }}>
                                    Chapters Overview <span className="badge" style={{
                                        background: 'rgba(78, 115, 223, 0.1)',
                                        color: '#4e73df',
                                        fontWeight: '500',
                                        padding: '5px 10px',
                                        borderRadius: '30px',
                                        fontSize: '0.75rem',
                                        marginLeft: '10px'
                                    }}>{chapterData.length}</span>
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
                                            <h6 style={{ fontWeight: '600', marginBottom: '5px' }}>Success</h6>
                                            <p className="mb-0">{successMsg}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <Loader size="medium" />
                            ) : chapterData.length === 0 ? (
                                <div className="empty-state p-5 text-center">
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(78, 115, 223, 0.1), rgba(116, 120, 214, 0.1))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '20px'
                                    }}>
                                        <i className="bi bi-collection" style={{
                                            color: '#4e73df',
                                            fontSize: '2rem'
                                        }}></i>
                                    </div>
                                    <h5 style={{ color: '#002254', fontWeight: '600', marginBottom: '15px' }}>No Chapters Yet</h5>
                                    <p className="text-muted mb-4">No chapters have been added to this course yet.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>                                    <thead>
                                        <tr style={{ background: 'rgba(78, 115, 223, 0.03)' }}>
                                            <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Title</th>
                                            <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Description</th>
                                            <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Content Type</th>
                                            <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Remarks</th>
                                            <th style={{ padding: '15px', fontWeight: '600', color: '#506690' }}>Actions</th>
                                        </tr>
                                    </thead>
                                        <tbody>
                                            {chapterData.map((chapter) => (
                                                <tr key={chapter.id} style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '10px' }}>
                                                    {editingChapter === chapter.id ? (
                                                        <>
                                                            <td style={{ padding: '15px' }}>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    defaultValue={chapter.title}
                                                                    id={`title-${chapter.id}`}
                                                                    style={{
                                                                        padding: '0.6rem 0.75rem',
                                                                        borderRadius: '10px',
                                                                        border: '1px solid #e2e8f0',
                                                                        boxShadow: 'none'
                                                                    }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '15px' }}>
                                                                <textarea
                                                                    className="form-control"
                                                                    defaultValue={chapter.description}
                                                                    id={`description-${chapter.id}`}
                                                                    rows="3"
                                                                    style={{
                                                                        padding: '0.6rem 0.75rem',
                                                                        borderRadius: '10px',
                                                                        border: '1px solid #e2e8f0',
                                                                        boxShadow: 'none'
                                                                    }}
                                                                />
                                                            </td>                                                            <td style={{ padding: '15px' }}>
                                                                <div className="d-flex flex-column gap-2">
                                                                    {chapter.video && (
                                                                        <div className="d-flex align-items-center mb-1">
                                                                            <span className="badge me-2" style={{
                                                                                background: 'rgba(78, 115, 223, 0.1)',
                                                                                color: '#4e73df',
                                                                                padding: '0.4rem 0.7rem',
                                                                                borderRadius: '50px',
                                                                                fontSize: '0.8rem'
                                                                            }}>
                                                                                <i className="bi bi-camera-video me-1"></i>
                                                                                Video
                                                                            </span>
                                                                            <small className="text-muted">Uploaded Video</small>
                                                                        </div>
                                                                    )}
                                                                    {chapter.video_url && (
                                                                        <div className="d-flex align-items-center mb-1">
                                                                            <span className="badge me-2" style={{
                                                                                background: 'rgba(220, 53, 69, 0.1)',
                                                                                color: '#dc3545',
                                                                                padding: '0.4rem 0.7rem',
                                                                                borderRadius: '50px',
                                                                                fontSize: '0.8rem'
                                                                            }}>
                                                                                <i className="bi bi-youtube me-1"></i>
                                                                                YouTube
                                                                            </span>
                                                                            <small className="text-muted text-truncate" style={{ maxWidth: '150px' }} title={chapter.video_url}>{chapter.video_url}</small>
                                                                        </div>
                                                                    )}

                                                                    <div style={{ display: editingChapter === chapter.id ? 'none' : 'block' }}>
                                                                        {/* Hidden input in view mode */}
                                                                    </div>
                                                                    <input
                                                                        type="file"
                                                                        className="form-control"
                                                                        accept="video/*"
                                                                        id={`video-${chapter.id}`}
                                                                        style={{
                                                                            padding: '0.6rem 0.75rem',
                                                                            borderRadius: '10px',
                                                                            border: '1px solid #e2e8f0',
                                                                            boxShadow: 'none',
                                                                            fontSize: '0.85rem'
                                                                        }}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '15px' }}>
                                                                <textarea
                                                                    className="form-control"
                                                                    defaultValue={chapter.remarks}
                                                                    id={`remarks-${chapter.id}`}
                                                                    rows="2"
                                                                    style={{
                                                                        padding: '0.6rem 0.75rem',
                                                                        borderRadius: '10px',
                                                                        border: '1px solid #e2e8f0',
                                                                        boxShadow: 'none'
                                                                    }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '15px' }}>
                                                                <div className="d-flex gap-2">
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        onClick={() => {
                                                                            const updatedData = new FormData();
                                                                            updatedData.append('title', document.getElementById(`title-${chapter.id}`).value);
                                                                            updatedData.append('description', document.getElementById(`description-${chapter.id}`).value);
                                                                            updatedData.append('remarks', document.getElementById(`remarks-${chapter.id}`).value);
                                                                            const videoFile = document.getElementById(`video-${chapter.id}`).files[0];
                                                                            if (videoFile) {
                                                                                updatedData.append('video', videoFile);
                                                                            }

                                                                            // Preserve existing text content when uploading a new video
                                                                            if (chapter.text_content) {
                                                                                updatedData.append('text_content', chapter.text_content);
                                                                            }

                                                                            handleUpdate(chapter.id, updatedData);
                                                                        }}
                                                                        style={{
                                                                            background: 'rgba(25, 135, 84, 0.1)',
                                                                            color: '#198754',
                                                                            border: 'none',
                                                                            borderRadius: '50px',
                                                                            padding: '0.4rem 0.9rem',
                                                                            fontWeight: '500'
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-check2 me-1"></i>
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        onClick={() => setEditingChapter(null)}
                                                                        style={{
                                                                            background: '#f8f9fa',
                                                                            color: '#506690',
                                                                            border: 'none',
                                                                            borderRadius: '50px',
                                                                            padding: '0.4rem 0.9rem',
                                                                            fontWeight: '500'
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td style={{ padding: '15px', fontWeight: '500', color: '#002254' }}>{chapter.title}</td>
                                                            <td style={{ padding: '15px' }}>{chapter.description.length > 50 ? `${chapter.description.substring(0, 50)}...` : chapter.description}</td>                                                            <td style={{ padding: '15px' }}>
                                                                <div className="d-flex flex-column">
                                                                    <div className="d-flex gap-2">
                                                                        {chapter.video && (
                                                                            <button
                                                                                className="btn btn-sm d-flex align-items-center"
                                                                                onClick={() => openVideoModal(`${BASE_URL}${chapter.video}`)}
                                                                                style={{
                                                                                    background: 'rgba(78, 115, 223, 0.1)',
                                                                                    color: '#4e73df',
                                                                                    border: 'none',
                                                                                    borderRadius: '50px',
                                                                                    padding: '0.4rem 0.9rem',
                                                                                    fontWeight: '500'
                                                                                }}
                                                                            >
                                                                                <i className="bi bi-camera-video me-1"></i>
                                                                                Video
                                                                            </button>
                                                                        )}

                                                                        {chapter.text_content && (
                                                                            <button
                                                                                className="btn btn-sm d-flex align-items-center"
                                                                                onClick={() => openContentModal(chapter)}
                                                                                style={{
                                                                                    background: 'rgba(25, 135, 84, 0.1)',
                                                                                    color: '#198754',
                                                                                    border: 'none',
                                                                                    borderRadius: '50px',
                                                                                    padding: '0.4rem 0.9rem',
                                                                                    fontWeight: '500'
                                                                                }}
                                                                            >
                                                                                <i className="bi bi-file-text me-1"></i>
                                                                                Text
                                                                            </button>
                                                                        )}

                                                                        {!chapter.video && !chapter.text_content && (
                                                                            <span className="badge d-flex align-items-center" style={{
                                                                                background: '#f8f9fa',
                                                                                padding: '0.5rem 0.8rem',
                                                                                borderRadius: '50px',
                                                                                fontSize: '0.8rem'
                                                                            }}>
                                                                                <i className="bi bi-exclamation-circle me-1"></i>
                                                                                No content
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '15px' }}>{chapter.remarks || '—'}</td>
                                                            <td style={{ padding: '15px' }}>
                                                                <div className="d-flex gap-2">
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        onClick={() => handleEditWithSweetAlert(chapter)}
                                                                        style={{
                                                                            background: 'rgba(13, 110, 253, 0.1)',
                                                                            color: '#0d6efd',
                                                                            border: 'none',
                                                                            borderRadius: '50px',
                                                                            padding: '0.4rem 0.9rem',
                                                                            fontWeight: '500'
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-pencil me-1"></i>
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        onClick={() => handleDelete(chapter.id)}
                                                                        style={{
                                                                            background: 'rgba(220, 53, 69, 0.1)',
                                                                            color: '#dc3545',
                                                                            border: 'none',
                                                                            borderRadius: '50px',
                                                                            padding: '0.4rem 0.9rem',
                                                                            fontWeight: '500'
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-trash me-1"></i>
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <>
                    <div className="modal show d-block" style={{ zIndex: 1055 }} tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content" style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)' }}>
                                <div className="modal-header" style={{
                                    background: 'linear-gradient(135deg, #4e73df 0%, #7478d6 100%)',
                                    borderBottom: 'none',
                                    color: 'white',
                                    padding: '15px 20px'
                                }}>
                                    <h5 className="modal-title">Video Player</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeVideoModal}
                                        style={{ filter: 'brightness(0) invert(1)' }}
                                    ></button>
                                </div>
                                <div className="modal-body p-0">
                                    <div className="ratio ratio-16x9">
                                        <video controls controlsList="nodownload" autoPlay>
                                            <source src={selectedVideo} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                    <div className="p-3 text-center">
                                        <button
                                            className="btn"
                                            onClick={closeVideoModal}
                                            style={{
                                                background: '#f8f9fa',
                                                color: '#506690',
                                                border: 'none',
                                                borderRadius: '50px',
                                                padding: '0.6rem 1.5rem',
                                                fontWeight: '500',
                                                margin: '10px 0'
                                            }}
                                        >
                                            <i className="bi bi-x-circle me-2"></i>
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop show" style={{ zIndex: 1054 }} onClick={closeVideoModal}></div>
                </>
            )}
        </div>
    );
}

export default CourseChapter;