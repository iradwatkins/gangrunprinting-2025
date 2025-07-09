# API Client Usage Guide

## Overview

The centralized API client (`/src/lib/api-client.ts`) provides consistent timeout handling and error management for all HTTP requests in the application.

## Features

- **Automatic Timeout Handling**: All requests have configurable timeouts with sensible defaults
- **Consistent Error Handling**: Unified error responses with automatic toast notifications
- **Type-Safe**: Full TypeScript support with custom error types
- **Network Error Detection**: Automatic detection and user-friendly messages for network issues
- **Configurable**: Per-request timeout and toast notification settings

## Basic Usage

```typescript
import { api, API_TIMEOUTS } from '@/lib/api-client';

// GET request
const response = await api.get('/api/users');
const data = await response.json();

// POST request
const response = await api.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const response = await api.put('/api/users/123', {
  name: 'Jane Doe'
});

// DELETE request
const response = await api.delete('/api/users/123');
```

## Timeout Configuration

```typescript
// Use predefined timeout values
await api.get('/api/data', {
  timeout: API_TIMEOUTS.QUICK      // 10 seconds
});

await api.post('/api/upload', formData, {
  timeout: API_TIMEOUTS.LONG       // 60 seconds
});

// Or specify custom timeout
await api.get('/api/data', {
  timeout: 5000  // 5 seconds
});
```

### Available Timeout Presets

- `API_TIMEOUTS.QUICK`: 10 seconds (for quick operations)
- `API_TIMEOUTS.DEFAULT`: 30 seconds (standard operations)
- `API_TIMEOUTS.STANDARD`: 30 seconds (alias for DEFAULT)
- `API_TIMEOUTS.LONG`: 60 seconds (file uploads, etc.)
- `API_TIMEOUTS.EXTRA_LONG`: 300 seconds (very large operations)

## Error Handling

```typescript
import { ApiError, TimeoutError } from '@/lib/api-client';

try {
  const response = await api.get('/api/data');
  const data = await response.json();
} catch (error) {
  if (error instanceof TimeoutError) {
    // Handle timeout specifically
    console.log('Request timed out');
  } else if (error instanceof ApiError) {
    // Handle API errors
    console.log('Status:', error.status);
    console.log('Message:', error.message);
    console.log('Data:', error.data);
  }
}
```

## Disabling Toast Notifications

```typescript
// Disable toast for specific request
await api.get('/api/data', {
  skipToast: true
});
```

## Migration Examples

### Before (using fetch directly):
```typescript
const response = await fetch('/api/payments/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});

if (!response.ok) {
  throw new Error('Payment failed');
}

const result = await response.json();
```

### After (using api client):
```typescript
const response = await api.post('/api/payments/process', data, {
  timeout: API_TIMEOUTS.STANDARD
});

const result = await response.json();
```

## Integration with Existing Code

The API client is designed to be a drop-in replacement for `fetch()`. The response object is the standard `Response` object, so existing code that uses `.json()`, `.text()`, etc. will continue to work.

## Best Practices

1. **Choose appropriate timeouts**: Use `QUICK` for simple queries, `STANDARD` for most operations, and `LONG` for file uploads
2. **Handle errors gracefully**: Always wrap API calls in try-catch blocks
3. **Use skipToast sparingly**: Only disable toasts for background operations or when you're showing custom error UI
4. **Leverage TypeScript**: Import and use the error types for better error handling