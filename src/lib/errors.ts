// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Error types for the application
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden access') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictError';
  }
}

// Error handler utility
export const handleError = (error: unknown): { error: string; code?: string; details?: any } => {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }

  return {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
};

// Validation utilities
export const validateRequired = (value: any, fieldName: string): void => {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }
};

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
};

export const validateUUID = (id: string, fieldName: string = 'ID'): void => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`);
  }
};

export const validateSlug = (slug: string): void => {
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    throw new ValidationError('Slug can only contain lowercase letters, numbers, and hyphens');
  }
};

export const validatePrice = (price: number, fieldName: string = 'Price'): void => {
  if (typeof price !== 'number' || price < 0) {
    throw new ValidationError(`${fieldName} must be a positive number`);
  }
  
  if (price > 999999.99) {
    throw new ValidationError(`${fieldName} is too high`);
  }
};

export const validateQuantity = (quantity: number, fieldName: string = 'Quantity'): void => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
  
  if (quantity > 10000) {
    throw new ValidationError(`${fieldName} is too high`);
  }
};

// API error handler utility
export const handleApiError = <T>(error: unknown, defaultMessage: string = 'An error occurred'): ApiResponse<T> => {
  console.error('API Error:', error);
  
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message
    };
  }

  return {
    success: false,
    error: defaultMessage
  };
};

// Success response utility - matches API response format
export const createSuccessResponse = <T>(data: T, meta?: any) => {
  return {
    data,
    error: undefined,
    ...(meta && { meta })
  };
};

