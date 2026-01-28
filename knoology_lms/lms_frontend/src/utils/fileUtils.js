/**
 * Utility functions for handling file URLs in the application
 */

// Base URL for media files from the backend
const MEDIA_URL = 'http://127.0.0.1:8000/media/';

/**
 * Formats a file URL by ensuring it has the correct base URL
 * @param {string} fileUrl - The file URL from API response
 * @returns {string} - The properly formatted file URL
 */
export const formatFileUrl = (fileUrl) => {
  console.log("formatFileUrl input:", fileUrl);
  
  // Handle null, undefined or empty strings
  if (!fileUrl) return '';
  
  // If it's already a complete URL, return it as is
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    console.log("Already complete URL:", fileUrl);
    return fileUrl;
  }

  // Remove any leading slashes or 'media/' from fileUrl to avoid path issues
  let cleanFileUrl = fileUrl;
  
  if (cleanFileUrl.startsWith('/')) {
    cleanFileUrl = cleanFileUrl.substring(1);
  }
  
  if (cleanFileUrl.startsWith('media/')) {
    cleanFileUrl = cleanFileUrl.substring(6);
  }
  
  // Create the final URL
  const finalUrl = `${MEDIA_URL}${cleanFileUrl}`;
  console.log("Formatted URL:", finalUrl);
  
  return finalUrl;
};
