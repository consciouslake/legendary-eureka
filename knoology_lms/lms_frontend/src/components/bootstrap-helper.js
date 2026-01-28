// Helper functions for working with Bootstrap components and functionality

/**
 * Closes a Bootstrap modal by its ID and ensures backdrop is removed
 * @param {string} modalId - The ID of the modal to close
 */
export const closeBootstrapModal = (modalId) => {
  // First try using Bootstrap's Modal API
  if (window.bootstrap && window.bootstrap.Modal) {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  } 
  
  // Backup method if the first one doesn't work
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    // Find and click the close button if available
    const closeBtn = modalElement.querySelector('[data-bs-dismiss="modal"]');
    if (closeBtn) {
      closeBtn.click();
    }
    
    // Force remove modal-backdrop and other classes
    setTimeout(() => {
      // Remove the modal-open class from the body
      document.body.classList.remove('modal-open');
      
      // Remove any backdrop elements
      const backdrops = document.getElementsByClassName('modal-backdrop');
      while (backdrops.length > 0) {
        backdrops[0].remove();
      }
      
      // Reset body padding and overflow
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 100);
  }
};