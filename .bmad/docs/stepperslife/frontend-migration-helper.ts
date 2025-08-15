// src/lib/database.ts
// New database client to replace Supabase

class DatabaseClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    // Use production URL when not on localhost
    this.baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3010' 
      : 'https://stepperslife.com';
    
    // Get token from localStorage
    this.authToken = localStorage.getItem('auth_token');
  }

  // Authentication methods
  auth = {
    signUp: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch(`${this.baseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) throw new Error('Signup failed');
      
      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      this.authToken = data.access_token;
      
      return { data: { user: data.user, session: data }, error: null };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch(`${this.baseUrl}/auth/v1/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          grant_type: 'password',
          email, 
          password 
        })
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      this.authToken = data.access_token;
      
      return { data: { user: data.user, session: data }, error: null };
    },

    signOut: async () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      this.authToken = null;
      return { error: null };
    },

    getSession: async () => {
      const token = localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) return { data: { session: null }, error: null };
      
      // Try to refresh the token
      try {
        const response = await fetch(`${this.baseUrl}/auth/v1/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            grant_type: 'refresh_token',
            refresh_token: refreshToken 
          })
        });
        
        if (!response.ok) throw new Error('Session refresh failed');
        
        const data = await response.json();
        localStorage.setItem('auth_token', data.access_token);
        this.authToken = data.access_token;
        
        return { data: { session: data }, error: null };
      } catch (error) {
        return { data: { session: null }, error };
      }
    },

    getUser: async () => {
      const session = await this.auth.getSession();
      return { data: { user: session.data?.session?.user || null }, error: session.error };
    }
  };

  // Database query methods (PostgreSQL via REST API)
  from(table: string) {
    const chainable = {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => this.query('GET', `/rest/${table}?${column}=eq.${value}`),
        neq: (column: string, value: any) => this.query('GET', `/rest/${table}?${column}=neq.${value}`),
        gt: (column: string, value: any) => this.query('GET', `/rest/${table}?${column}=gt.${value}`),
        gte: (column: string, value: any) => this.query('GET', `/rest/${table}?${column}=gte.${value}`),
        lt: (column: string, value: any) => this.query('GET', `/rest/${table}?${column}=lt.${value}`),
        lte: (column: string, value: any) => this.query('GET', `/rest/${table}?${column}=lte.${value}`),
        like: (column: string, value: any) => this.query('GET', `/rest/${table}?${column}=like.*${value}*`),
        ilike: (column: string, value: any) => this.query('GET', `/rest/${table}?${column}=ilike.*${value}*`),
        is: (column: string, value: any) => this.query('GET', `/rest/${table}?${column}=is.${value}`),
        in: (column: string, values: any[]) => this.query('GET', `/rest/${table}?${column}=in.(${values.join(',')})`),
        order: (column: string, options?: { ascending?: boolean }) => 
          this.query('GET', `/rest/${table}?order=${column}.${options?.ascending === false ? 'desc' : 'asc'}`),
        limit: (count: number) => this.query('GET', `/rest/${table}?limit=${count}`),
        range: (from: number, to: number) => {
          const headers = { 'Range': `${from}-${to}` };
          return this.query('GET', `/rest/${table}`, undefined, headers);
        },
        single: async () => {
          const result = await this.query('GET', `/rest/${table}?limit=1`);
          return { ...result, data: result.data?.[0] || null };
        },
        // Direct execution
        then: (resolve: any, reject: any) => {
          return this.query('GET', `/rest/${table}`).then(resolve, reject);
        }
      }),
      
      insert: (data: any | any[]) => this.query('POST', `/rest/${table}`, data),
      
      update: (data: any) => ({
        eq: (column: string, value: any) => 
          this.query('PATCH', `/rest/${table}?${column}=eq.${value}`, data),
        match: (match: any) => {
          const params = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join('&');
          return this.query('PATCH', `/rest/${table}?${params}`, data);
        }
      }),
      
      delete: () => ({
        eq: (column: string, value: any) => 
          this.query('DELETE', `/rest/${table}?${column}=eq.${value}`),
        match: (match: any) => {
          const params = Object.entries(match).map(([k, v]) => `${k}=eq.${v}`).join('&');
          return this.query('DELETE', `/rest/${table}?${params}`);
        }
      }),
      
      upsert: (data: any | any[]) => this.query('POST', `/rest/${table}`, data, {
        'Prefer': 'resolution=merge-duplicates'
      })
    };
    
    return chainable;
  }

  // Storage methods
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${this.baseUrl}/storage/v1/object/${bucket}/${path}`, {
          method: 'POST',
          headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {},
          body: formData
        });
        
        if (!response.ok) return { data: null, error: new Error('Upload failed') };
        
        const data = await response.json();
        return { data, error: null };
      },
      
      download: async (path: string) => {
        const response = await fetch(`${this.baseUrl}/storage/v1/object/${bucket}/${path}`, {
          headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
        });
        
        if (!response.ok) return { data: null, error: new Error('Download failed') };
        
        const blob = await response.blob();
        return { data: blob, error: null };
      },
      
      list: async (path?: string) => {
        const url = path 
          ? `${this.baseUrl}/storage/v1/object/${bucket}?prefix=${path}`
          : `${this.baseUrl}/storage/v1/object/${bucket}`;
          
        const response = await fetch(url, {
          headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
        });
        
        if (!response.ok) return { data: null, error: new Error('List failed') };
        
        const data = await response.json();
        return { data, error: null };
      },
      
      remove: async (paths: string[]) => {
        const response = await fetch(`${this.baseUrl}/storage/v1/object/${bucket}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
          },
          body: JSON.stringify({ paths })
        });
        
        if (!response.ok) return { data: null, error: new Error('Delete failed') };
        
        return { data: { message: 'Deleted successfully' }, error: null };
      },
      
      getPublicUrl: (path: string) => {
        return {
          data: { publicUrl: `${this.baseUrl}/storage/v1/object/public/${bucket}/${path}` }
        };
      }
    })
  };

  // Helper method for API calls
  private async query(method: string, endpoint: string, data?: any, headers?: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}),
          ...headers
        },
        body: data ? JSON.stringify(data) : undefined
      });
      
      if (!response.ok) {
        const error = await response.text();
        return { data: null, error: new Error(error) };
      }
      
      const result = await response.json();
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Export as a singleton to match Supabase pattern
export const supabase = new DatabaseClient();

// For compatibility, also export the class
export default DatabaseClient;