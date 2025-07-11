/**
 * Utility function to safely format vendor addresses
 * Handles both string and object formats
 */
export function formatVendorAddress(address: any): string {
  if (!address) return '';
  
  // If address is already a string, return it
  if (typeof address === 'string') return address;
  
  // If address is an object with the expected fields
  if (typeof address === 'object') {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zip || address.postal_code,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }
  
  // If address is something else (shouldn't happen), return empty string
  return '';
}

/**
 * Type guard to check if an object is a vendor address
 */
export function isVendorAddress(obj: any): boolean {
  return obj && 
    typeof obj === 'object' && 
    ('street' in obj || 'city' in obj || 'state' in obj || 'zip' in obj);
}