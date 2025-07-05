export interface TimeSeries {
  date: string;
  value: number;
}

export interface VendorMetrics {
  vendor_id: string;
  vendor_name: string;
  total_orders: number;
  average_processing_time: number;
  completion_rate: number;
  revenue: number;
}

export interface ProductMetric {
  product_id: string;
  product_name: string;
  orders: number;
  revenue: number;
  units_sold: number;
}

export interface SegmentMetric {
  segment_id: string;
  segment_name: string;
  customer_count: number;
  revenue: number;
  conversion_rate: number;
}

export interface BehaviorStep {
  step: string;
  entry_count: number;
  exit_count: number;
  conversion_rate: number;
}

export interface ProfitMargin {
  category: string;
  revenue: number;
  cost: number;
  margin: number;
  margin_percentage: number;
}

export interface BrokerRetailSplit {
  broker_revenue: number;
  retail_revenue: number;
  broker_orders: number;
  retail_orders: number;
}

export interface ForecastData {
  period: string;
  forecasted_revenue: number;
  confidence_interval: [number, number];
}

export interface ProductPerformance {
  product_id: string;
  name: string;
  sales_velocity: number;
  profit_margin: number;
  stock_level: number;
  reorder_point: number;
}

export interface InventoryMetric {
  product_id: string;
  current_stock: number;
  turnover_rate: number;
  days_supply: number;
  reorder_needed: boolean;
}

export interface ConfigurationMetric {
  configuration: string;
  usage_count: number;
  revenue_impact: number;
  popularity_rank: number;
}

export interface ProfitabilityMetric {
  product_id: string;
  name: string;
  unit_profit: number;
  total_profit: number;
  profit_margin_percentage: number;
}

export interface ResponseTimeMetric {
  endpoint: string;
  average_time: number;
  p95_time: number;
  p99_time: number;
  request_count: number;
}

export interface ErrorRateMetric {
  endpoint: string;
  error_count: number;
  total_requests: number;
  error_rate: number;
  error_types: Record<string, number>;
}

export interface DatabaseMetric {
  query_type: string;
  average_execution_time: number;
  query_count: number;
  slow_queries: number;
}

export interface SessionMetric {
  date: string;
  total_sessions: number;
  average_duration: number;
  bounce_rate: number;
  conversion_rate: number;
}

export interface SecurityEvent {
  event_type: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolved: boolean;
}

export interface OrderAnalytics {
  total_orders: number;
  orders_by_status: Record<string, number>;
  average_order_value: number;
  order_volume_trend: TimeSeries[];
  processing_time_avg: number;
  vendor_performance: VendorMetrics[];
  top_products: ProductMetric[];
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_lifetime_value: number;
  churn_rate: number;
  acquisition_sources: Record<string, number>;
  segment_performance: SegmentMetric[];
  behavior_flow: BehaviorStep[];
}

export interface RevenueAnalytics {
  total_revenue: number;
  revenue_growth: number;
  revenue_by_category: Record<string, number>;
  revenue_by_vendor: Record<string, number>;
  profit_margins: ProfitMargin[];
  broker_vs_retail: BrokerRetailSplit;
  forecasted_revenue: ForecastData[];
}

export interface ProductAnalytics {
  top_selling_products: ProductMetric[];
  product_performance: ProductPerformance[];
  inventory_turnover: InventoryMetric[];
  configuration_popularity: ConfigurationMetric[];
  product_profitability: ProfitabilityMetric[];
}

export interface SystemAnalytics {
  api_response_times: ResponseTimeMetric[];
  error_rates: ErrorRateMetric[];
  uptime_percentage: number;
  database_performance: DatabaseMetric[];
  user_sessions: SessionMetric[];
  security_events: SecurityEvent[];
}

export type AnalyticsPeriod = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface DashboardMetrics {
  order_analytics: OrderAnalytics;
  customer_analytics: CustomerAnalytics;
  revenue_analytics: RevenueAnalytics;
  product_analytics: ProductAnalytics;
  system_analytics: SystemAnalytics;
  generated_at: string;
  period: AnalyticsPeriod;
}

export interface DataSource {
  table: string;
  fields: string[];
  aggregations: Aggregation[];
  joins?: TableJoin[];
}

export interface Aggregation {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max';
  alias?: string;
}

export interface TableJoin {
  table: string;
  on: string;
  type: 'inner' | 'left' | 'right' | 'full';
}

export interface AnalyticsFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in';
  value: any;
}

export interface VisualizationConfig {
  title: string;
  chart_type?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  x_axis?: string;
  y_axis?: string;
  color_scheme?: string;
  show_legend?: boolean;
  show_grid?: boolean;
}

export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Visualization {
  type: 'chart' | 'table' | 'metric' | 'gauge';
  config: VisualizationConfig;
  data_query: string;
  position: GridPosition;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_week?: number;
  day_of_month?: number;
  time: string;
  timezone: string;
}

export type ExportFormat = 'pdf' | 'csv' | 'excel' | 'json';

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;
  report_type: 'dashboard' | 'scheduled' | 'custom';
  data_sources: DataSource[];
  filters: AnalyticsFilter[];
  visualizations: Visualization[];
  schedule?: ReportSchedule;
  export_formats: ExportFormat[];
  recipients?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}