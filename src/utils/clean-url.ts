/**
 * Utility to clean URLs of unwanted fragments and parameters
 */

export function cleanUrl() {
  // Check if URL needs cleaning
  const currentUrl = window.location.href;
  const hash = window.location.hash;
  
  // Remove empty hash or OAuth-related fragments
  if (hash === '#' || 
      hash.includes('access_token') || 
      hash.includes('error') ||
      hash.includes('error_description')) {
    
    // Get base URL without hash
    const cleanedUrl = currentUrl.split('#')[0];
    
    // Update URL without triggering navigation
    window.history.replaceState({}, document.title, cleanedUrl);
    
    return true; // URL was cleaned
  }
  
  return false; // No cleaning needed
}

// Auto-clean on page load
if (typeof window !== 'undefined') {
  // Clean URL immediately
  cleanUrl();
  
  // Also clean after a short delay to catch any late updates
  setTimeout(cleanUrl, 100);
}