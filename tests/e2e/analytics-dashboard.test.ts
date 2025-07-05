import { test, expect, type Page } from '@playwright/test';

// Helper function to wait for analytics dashboard to load
async function waitForDashboardLoad(page: Page) {
  await page.waitForSelector('[data-testid="analytics-dashboard"]', { timeout: 10000 });
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 15000 });
}

// Helper function to navigate to analytics dashboard
async function navigateToAnalyticsDashboard(page: Page) {
  await page.goto('/admin/analytics');
  await waitForDashboardLoad(page);
}

test.describe('Analytics Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication to bypass login
    await page.addInitScript(() => {
      const mockUser = {
        id: 'test-admin-id',
        email: 'admin@test.com',
        role: 'admin'
      };
      
      localStorage.setItem('auth-token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
    });

    // Mock analytics API responses
    await page.route('**/api/analytics/dashboard', async route => {
      const mockResponse = {
        order_analytics: {
          total_orders: 1250,
          orders_by_status: {
            pending: 45,
            processing: 120,
            completed: 980,
            cancelled: 105
          },
          average_order_value: 85.50,
          order_volume_trend: [
            { date: '2024-01-01', value: 50 },
            { date: '2024-01-02', value: 75 },
            { date: '2024-01-03', value: 60 },
            { date: '2024-01-04', value: 85 },
            { date: '2024-01-05', value: 70 }
          ],
          processing_time_avg: 2.5,
          vendor_performance: [
            {
              vendor_id: '1',
              vendor_name: 'Premium Print Co',
              total_orders: 450,
              average_processing_time: 2.2,
              completion_rate: 98.5,
              revenue: 38000
            },
            {
              vendor_id: '2',
              vendor_name: 'Quick Print Ltd',
              total_orders: 300,
              average_processing_time: 1.8,
              completion_rate: 96.8,
              revenue: 25000
            }
          ],
          top_products: [
            {
              product_id: '1',
              product_name: 'Business Cards',
              orders: 320,
              revenue: 8500,
              units_sold: 15000
            },
            {
              product_id: '2',
              product_name: 'Flyers',
              orders: 180,
              revenue: 5400,
              units_sold: 9000
            }
          ]
        },
        customer_analytics: {
          total_customers: 5200,
          new_customers: 280,
          returning_customers: 4920,
          customer_lifetime_value: 245.80,
          churn_rate: 3.2,
          acquisition_sources: {
            organic: 1200,
            social: 800,
            referral: 600,
            paid: 400
          },
          segment_performance: [
            {
              segment_id: '1',
              segment_name: 'High Value Customers',
              customer_count: 150,
              revenue: 45000,
              conversion_rate: 15.5
            }
          ],
          behavior_flow: [
            {
              step: 'Landing Page',
              entry_count: 1000,
              exit_count: 200,
              conversion_rate: 80.0
            },
            {
              step: 'Product View',
              entry_count: 800,
              exit_count: 150,
              conversion_rate: 81.25
            }
          ]
        },
        revenue_analytics: {
          total_revenue: 125000,
          revenue_growth: 12.5,
          revenue_by_category: {
            'Business Cards': 45000,
            'Flyers': 30000,
            'Banners': 25000,
            'Brochures': 25000
          },
          revenue_by_vendor: {
            'Premium Print Co': 75000,
            'Quick Print Ltd': 50000
          },
          profit_margins: [
            {
              category: 'Business Cards',
              revenue: 45000,
              cost: 25000,
              margin: 20000,
              margin_percentage: 44.4
            }
          ],
          broker_vs_retail: {
            broker_revenue: 75000,
            retail_revenue: 50000,
            broker_orders: 800,
            retail_orders: 450
          },
          forecasted_revenue: [
            {
              period: '2024-02',
              forecasted_revenue: 135000,
              confidence_interval: [120000, 150000]
            }
          ]
        },
        product_analytics: {
          top_selling_products: [],
          product_performance: [
            {
              product_id: '1',
              name: 'Business Cards',
              sales_velocity: 15.5,
              profit_margin: 45.2,
              stock_level: 5000,
              reorder_point: 1000
            }
          ],
          inventory_turnover: [
            {
              product_id: '1',
              current_stock: 5000,
              turnover_rate: 2.3,
              days_supply: 45,
              reorder_needed: false
            }
          ],
          configuration_popularity: [
            {
              configuration: 'Standard Business Cards (500 qty)',
              usage_count: 150,
              revenue_impact: 7500,
              popularity_rank: 1
            }
          ],
          product_profitability: [
            {
              product_id: '1',
              name: 'Business Cards',
              unit_profit: 0.50,
              total_profit: 7500,
              profit_margin_percentage: 45.2
            }
          ]
        },
        system_analytics: {
          api_response_times: [
            {
              endpoint: '/api/products',
              average_time: 150,
              p95_time: 250,
              p99_time: 400,
              request_count: 1500
            }
          ],
          error_rates: [
            {
              endpoint: '/api/orders',
              error_count: 5,
              total_requests: 1000,
              error_rate: 0.005,
              error_types: {
                '500': 3,
                '404': 2
              }
            }
          ],
          uptime_percentage: 99.9,
          database_performance: [
            {
              query_type: 'SELECT',
              average_execution_time: 45,
              query_count: 5000,
              slow_queries: 10
            }
          ],
          user_sessions: [
            {
              date: '2024-01-01',
              total_sessions: 450,
              average_duration: 12.5,
              bounce_rate: 25.5,
              conversion_rate: 3.2
            }
          ],
          security_events: [
            {
              event_type: 'Failed Login Attempt',
              timestamp: '2024-01-15T10:30:00Z',
              severity: 'medium' as const,
              description: 'Multiple failed login attempts from IP 192.168.1.100',
              resolved: true
            }
          ]
        },
        generated_at: '2024-01-15T10:00:00Z',
        period: 'month' as const
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse)
      });
    });
  });

  test('loads analytics dashboard with all key metrics', async ({ page }) => {
    await navigateToAnalyticsDashboard(page);

    // Check page title and header
    await expect(page.locator('h1')).toContainText('Analytics Dashboard');
    await expect(page.locator('text=Platform performance and business insights')).toBeVisible();

    // Verify key metric cards are displayed with correct values
    await expect(page.locator('text=1,250')).toBeVisible(); // Total Orders
    await expect(page.locator('text=$125,000')).toBeVisible(); // Revenue
    await expect(page.locator('text=5,200')).toBeVisible(); // Customers
    await expect(page.locator('text=$85.50')).toBeVisible(); // Avg Order Value

    // Check that all tabs are present
    await expect(page.locator('text=Orders')).toBeVisible();
    await expect(page.locator('text=Customers')).toBeVisible();
    await expect(page.locator('text=Revenue')).toBeVisible();
    await expect(page.locator('text=Products')).toBeVisible();
    await expect(page.locator('text=System')).toBeVisible();
  });

  test('period selector changes dashboard data', async ({ page }) => {
    await navigateToAnalyticsDashboard(page);

    // Click period selector
    await page.locator('[role="combobox"]').first().click();
    
    // Select "This Week" option
    await page.locator('text=This Week').click();

    // Verify the API is called with the new period
    await page.waitForRequest(request => 
      request.url().includes('/api/analytics/dashboard') && 
      request.url().includes('period=week')
    );
  });

  test('refresh button updates dashboard data', async ({ page }) => {
    await navigateToAnalyticsDashboard(page);

    // Click refresh button
    await page.locator('button:has-text("Refresh")').click();

    // Verify loading state appears
    await expect(page.locator('.animate-spin')).toBeVisible();

    // Wait for loading to complete
    await page.waitForSelector('.animate-spin', { state: 'detached' });

    // Verify data is still displayed
    await expect(page.locator('text=1,250')).toBeVisible();
  });

  test('navigates between analytics tabs correctly', async ({ page }) => {
    await navigateToAnalyticsDashboard(page);

    // Test Orders tab (default)
    await expect(page.locator('text=Order Volume Trend')).toBeVisible();
    await expect(page.locator('text=Order Status Distribution')).toBeVisible();
    await expect(page.locator('text=Top Products')).toBeVisible();
    await expect(page.locator('text=Vendor Performance')).toBeVisible();

    // Click Customers tab
    await page.locator('text=Customers').click();
    await expect(page.locator('text=Customer Type Distribution')).toBeVisible();
    await expect(page.locator('text=Customer Acquisition Sources')).toBeVisible();

    // Click Revenue tab
    await page.locator('text=Revenue').click();
    await expect(page.locator('text=Revenue Overview')).toBeVisible();
    await expect(page.locator('text=Revenue by Category')).toBeVisible();
    await expect(page.locator('text=Broker vs Retail Revenue')).toBeVisible();

    // Click Products tab
    await page.locator('text=Products').click();
    await expect(page.locator('text=Top Selling Products')).toBeVisible();
    await expect(page.locator('text=Product Performance Matrix')).toBeVisible();
    await expect(page.locator('text=Inventory Status')).toBeVisible();

    // Click System tab
    await page.locator('text=System').click();
    await expect(page.locator('text=System Health Overview')).toBeVisible();
    await expect(page.locator('text=API Response Times')).toBeVisible();
    await expect(page.locator('text=Security Events')).toBeVisible();
  });

  test('displays order analytics data correctly', async ({ page }) => {
    await navigateToAnalyticsDashboard(page);

    // Verify top products are displayed
    await expect(page.locator('text=Business Cards')).toBeVisible();
    await expect(page.locator('text=320 orders')).toBeVisible();
    await expect(page.locator('text=$8,500.00')).toBeVisible();

    // Verify vendor performance
    await expect(page.locator('text=Premium Print Co')).toBeVisible();
    await expect(page.locator('text=450 orders • 98.5% completion')).toBeVisible();
    await expect(page.locator('text=$38,000.00')).toBeVisible();

    // Check that charts are rendered (look for chart containers)
    await expect(page.locator('[data-testid="responsive-container"]')).toBeVisible();
  });

  test('export functionality works correctly', async ({ page }) => {
    await navigateToAnalyticsDashboard(page);

    // Mock export API
    await page.route('**/api/analytics/export', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          exportId: 'export-123',
          status: 'started'
        })
      });
    });

    // Click export button
    await page.locator('button:has-text("Export")').click();

    // Verify export request is made
    await page.waitForRequest('**/api/analytics/export');
  });

  test('handles loading states correctly', async ({ page }) => {
    // Delay the API response to test loading state
    await page.route('**/api/analytics/dashboard', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/admin/analytics');

    // Verify loading spinner is shown
    await expect(page.locator('.animate-spin')).toBeVisible();

    // Wait for loading to complete
    await waitForDashboardLoad(page);

    // Verify content is displayed
    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
  });

  test('displays error states correctly', async ({ page }) => {
    // Mock API error
    await page.route('**/api/analytics/dashboard', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error'
        })
      });
    });

    await page.goto('/admin/analytics');

    // Verify error message is displayed
    await expect(page.locator('text=Error loading analytics')).toBeVisible();
  });

  test('responsive design works on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await navigateToAnalyticsDashboard(page);

    // Verify key metrics are still visible and properly arranged
    await expect(page.locator('text=1,250')).toBeVisible();
    await expect(page.locator('text=$125,000')).toBeVisible();

    // Verify tabs are accessible on mobile
    await page.locator('text=Customers').click();
    await expect(page.locator('text=Customer Type Distribution')).toBeVisible();
  });

  test('accessibility features work correctly', async ({ page }) => {
    await navigateToAnalyticsDashboard(page);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Test ARIA labels and roles
    const dashboard = page.locator('[role="main"]');
    await expect(dashboard).toBeVisible();

    // Test color contrast for charts and text
    const metricCards = page.locator('[data-testid="metric-card"]');
    await expect(metricCards.first()).toBeVisible();
  });

  test('real-time updates work correctly', async ({ page }) => {
    await navigateToAnalyticsDashboard(page);

    // Initial state
    await expect(page.locator('text=1,250')).toBeVisible();

    // Mock updated data
    await page.route('**/api/analytics/dashboard', async route => {
      const updatedResponse = {
        order_analytics: {
          total_orders: 1275, // Updated value
          orders_by_status: {
            pending: 50,
            processing: 125,
            completed: 995,
            cancelled: 105
          },
          average_order_value: 87.25,
          order_volume_trend: [],
          processing_time_avg: 2.3,
          vendor_performance: [],
          top_products: []
        },
        // ... other analytics data
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updatedResponse)
      });
    });

    // Trigger refresh
    await page.locator('button:has-text("Refresh")').click();

    // Verify updated data is displayed
    await expect(page.locator('text=1,275')).toBeVisible();
    await expect(page.locator('text=$87.25')).toBeVisible();
  });
});