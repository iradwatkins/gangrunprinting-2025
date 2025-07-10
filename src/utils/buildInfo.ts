/**
 * Build information utility
 * Provides information about the current build/deployment
 */

// This will be replaced at build time by your CI/CD process
// For now, we'll use a static timestamp that can be updated manually
// or via a build script
export const BUILD_TIMESTAMP = '2025-07-09T19:00:35.000Z';

/**
 * Format the build timestamp for display
 */
export function getFormattedBuildTime(): string {
  try {
    const date = new Date(BUILD_TIMESTAMP);
    
    // Format: "Jul 9, 2025 3:00 PM"
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options);
  } catch (error) {
    // Fallback if date parsing fails
    return 'Unknown';
  }
}

/**
 * Get a short version of the build time
 * Format: "Jul 9, 3:00 PM"
 */
export function getShortBuildTime(): string {
  try {
    const date = new Date(BUILD_TIMESTAMP);
    
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options);
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Get relative time since build
 * Format: "2 hours ago", "3 days ago", etc.
 */
export function getRelativeBuildTime(): string {
  try {
    const now = new Date();
    const buildDate = new Date(BUILD_TIMESTAMP);
    const diffMs = now.getTime() - buildDate.getTime();
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Get deployment environment information
 */
export function getDeploymentInfo() {
  const url = typeof window !== 'undefined' ? window.location.origin : '';
  const isVercel = url.includes('vercel.app');
  const isProduction = url.includes('gangrunprinting.com');
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
  
  let environment = 'unknown';
  let color = 'gray';
  
  if (isLocal) {
    environment = 'development';
    color = 'blue';
  } else if (isVercel) {
    environment = 'preview';
    color = 'yellow';
  } else if (isProduction) {
    environment = 'production';
    color = 'green';
  }
  
  return {
    url,
    environment,
    color,
    isVercel,
    isProduction,
    isLocal,
    displayName: isVercel ? 'Vercel Preview' : isProduction ? 'Production' : isLocal ? 'Development' : 'Unknown'
  };
}

// Export all functions
export const buildInfo = {
  timestamp: BUILD_TIMESTAMP,
  formatted: getFormattedBuildTime(),
  short: getShortBuildTime(),
  relative: getRelativeBuildTime(),
  deployment: getDeploymentInfo()
};