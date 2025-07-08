import { CustomerSegment } from '../../types/email';

// Mock data for development
const mockSegments: CustomerSegment[] = [
  {
    id: 'segment-1',
    name: 'New Customers',
    description: 'Customers who joined in the last 30 days',
    criteria: {
      rules: [
        {
          field: 'created_at',
          operator: 'gte',
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      logic: 'and'
    },
    customer_count: 45,
    is_dynamic: true,
    created_by: 'admin',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  },
  {
    id: 'segment-2',
    name: 'High Value Customers',
    description: 'Customers with orders over $500',
    criteria: {
      rules: [
        {
          field: 'total_spent',
          operator: 'gte',
          value: '500'
        }
      ],
      logic: 'and'
    },
    customer_count: 23,
    is_dynamic: true,
    created_by: 'admin',
    created_at: '2024-01-12T11:00:00Z',
    updated_at: '2024-01-12T11:00:00Z'
  }
];

export const emailSegmentApi = {
  // List all segments
  getSegments: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ segments: CustomerSegment[]; total: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const total = mockSegments.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || 20;
    const paginatedSegments = mockSegments.slice(offset, offset + limit);
    
    return { segments: paginatedSegments, total };
  },

  // Get a specific segment
  getSegment: async (id: string): Promise<CustomerSegment> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const segment = mockSegments.find(s => s.id === id);
    if (!segment) {
      throw new Error(`Segment with id ${id} not found`);
    }
    return segment;
  },

  // Create a new segment
  createSegment: async (segment: Omit<CustomerSegment, 'id' | 'customer_count' | 'created_at' | 'updated_at'>): Promise<CustomerSegment> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newSegment: CustomerSegment = {
      ...segment,
      id: `segment-${mockSegments.length + 1}`,
      customer_count: Math.floor(Math.random() * 100) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockSegments.push(newSegment);
    return newSegment;
  },

  // Update a segment
  updateSegment: async (id: string, updates: Partial<CustomerSegment>): Promise<CustomerSegment> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockSegments.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Segment with id ${id} not found`);
    }
    
    mockSegments[index] = {
      ...mockSegments[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return mockSegments[index];
  },

  // Delete a segment
  deleteSegment: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockSegments.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Segment with id ${id} not found`);
    }
    
    mockSegments.splice(index, 1);
  },

  // Get segment preview (customers that would match)
  getSegmentPreview: async (criteria: CustomerSegment['criteria'], limit?: number): Promise<{ customers: any[]; total: number }> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Return mock preview data
    const mockCustomers = Array.from({ length: Math.min(limit || 10, 50) }, (_, i) => ({
      id: `customer-${i + 1}`,
      email: `customer${i + 1}@example.com`,
      name: `Customer ${i + 1}`,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    return { customers: mockCustomers, total: mockCustomers.length };
  },

  // Get segment customers
  getSegmentCustomers: async (id: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ customers: any[]; total: number }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const segment = mockSegments.find(s => s.id === id);
    if (!segment) {
      throw new Error(`Segment with id ${id} not found`);
    }
    
    const mockCustomers = Array.from({ length: segment.customer_count }, (_, i) => ({
      id: `customer-${i + 1}`,
      email: `customer${i + 1}@example.com`,
      name: `Customer ${i + 1}`,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    const offset = params?.offset || 0;
    const limit = params?.limit || 20;
    const paginatedCustomers = mockCustomers.slice(offset, offset + limit);
    
    return { customers: paginatedCustomers, total: mockCustomers.length };
  },

  // Export segment customers
  exportSegmentCustomers: async (id: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const segment = mockSegments.find(s => s.id === id);
    if (!segment) {
      throw new Error(`Segment with id ${id} not found`);
    }
    
    // Create mock CSV data
    const csvData = `Email,Name,Created At\ncustomer1@example.com,Customer 1,2024-01-01\ncustomer2@example.com,Customer 2,2024-01-02`;
    return new Blob([csvData], { type: 'text/csv' });
  },

  // Refresh segment (recalculate customer count)
  refreshSegment: async (id: string): Promise<CustomerSegment> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = mockSegments.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Segment with id ${id} not found`);
    }
    
    // Simulate recalculating customer count
    mockSegments[index].customer_count = Math.floor(Math.random() * 100) + 1;
    mockSegments[index].updated_at = new Date().toISOString();
    
    return mockSegments[index];
  },
};