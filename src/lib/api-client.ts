import { toast } from 'sonner';

// Default timeout in milliseconds
const DEFAULT_TIMEOUT = 30000; // 30 seconds

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  skipToast?: boolean;
}

export class ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: any;

  constructor(message: string, status?: number, statusText?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Creates a promise that rejects after a specified timeout
 */
function createTimeout(ms: number): { promise: Promise<never>; cancel: () => void } {
  let timeoutId: NodeJS.Timeout;
  const promise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(`Request timed out after ${ms}ms`));
    }, ms);
  });

  const cancel = () => clearTimeout(timeoutId);
  
  return { promise, cancel };
}

/**
 * Enhanced fetch with timeout support and consistent error handling
 */
export async function apiClient(url: string, options: ApiRequestOptions = {}): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, skipToast = false, ...fetchOptions } = options;

  // Create timeout
  const { promise: timeoutPromise, cancel: cancelTimeout } = createTimeout(timeout);

  try {
    // Race between fetch and timeout
    const response = await Promise.race([
      fetch(url, fetchOptions),
      timeoutPromise
    ]);

    // Cancel timeout since fetch completed
    cancelTimeout();

    // Handle non-OK responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If response isn't JSON, use status text
        errorData = { message: response.statusText };
      }

      const error = new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status,
        response.statusText,
        errorData
      );

      if (!skipToast) {
        toast.error(error.message);
      }

      throw error;
    }

    return response;
  } catch (error) {
    // Cancel timeout on any error
    cancelTimeout();

    // Re-throw API and Timeout errors as-is
    if (error instanceof ApiError || error instanceof TimeoutError) {
      if (!skipToast && error instanceof TimeoutError) {
        toast.error('Request timed out. Please try again.');
      }
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const networkError = new ApiError('Network error. Please check your connection.');
      if (!skipToast) {
        toast.error(networkError.message);
      }
      throw networkError;
    }

    // Handle other errors
    const genericError = new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
    if (!skipToast) {
      toast.error(genericError.message);
    }
    throw genericError;
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  async get(url: string, options?: ApiRequestOptions) {
    return apiClient(url, { ...options, method: 'GET' });
  },

  async post(url: string, data?: any, options?: ApiRequestOptions) {
    return apiClient(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put(url: string, data?: any, options?: ApiRequestOptions) {
    return apiClient(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch(url: string, data?: any, options?: ApiRequestOptions) {
    return apiClient(url, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete(url: string, options?: ApiRequestOptions) {
    return apiClient(url, { ...options, method: 'DELETE' });
  },
};

// Export for use in existing code that might expect different timeout values
export const API_TIMEOUTS = {
  DEFAULT: DEFAULT_TIMEOUT,
  QUICK: 10000,     // 10 seconds for quick operations
  STANDARD: 30000,  // 30 seconds for standard operations
  LONG: 60000,      // 60 seconds for file uploads, etc.
  EXTRA_LONG: 300000 // 5 minutes for very large operations
} as const;