import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../MetricCard';
import { DollarSign, Users } from 'lucide-react';

describe('MetricCard', () => {
  it('renders basic metric card with number format', () => {
    render(
      <MetricCard
        title="Total Orders"
        value={1250}
        format="number"
      />
    );
    
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
  });

  it('renders metric card with currency format', () => {
    render(
      <MetricCard
        title="Revenue"
        value={125000.50}
        format="currency"
      />
    );
    
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$125,000.50')).toBeInTheDocument();
  });

  it('renders metric card with percentage format', () => {
    render(
      <MetricCard
        title="Conversion Rate"
        value={12.5}
        format="percentage"
      />
    );
    
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
  });

  it('displays positive trend correctly', () => {
    render(
      <MetricCard
        title="Sales"
        value={1000}
        trend={15.2}
        format="number"
      />
    );
    
    expect(screen.getByText('15.2%')).toBeInTheDocument();
    expect(screen.getByText('vs last period')).toBeInTheDocument();
    
    // Check for trending up icon presence
    const trendElement = screen.getByText('15.2%').parentElement;
    expect(trendElement).toHaveClass('text-green-600');
  });

  it('displays negative trend correctly', () => {
    render(
      <MetricCard
        title="Sales"
        value={1000}
        trend={-8.5}
        format="number"
      />
    );
    
    expect(screen.getByText('8.5%')).toBeInTheDocument();
    expect(screen.getByText('vs last period')).toBeInTheDocument();
    
    // Check for trending down styling
    const trendElement = screen.getByText('8.5%').parentElement;
    expect(trendElement).toHaveClass('text-red-600');
  });

  it('renders with custom icon', () => {
    render(
      <MetricCard
        title="Revenue"
        value={50000}
        icon={<DollarSign data-testid="dollar-icon" />}
        format="currency"
      />
    );
    
    expect(screen.getByTestId('dollar-icon')).toBeInTheDocument();
  });

  it('displays description when provided', () => {
    render(
      <MetricCard
        title="Active Users"
        value={1200}
        description="Users who logged in this month"
        format="number"
      />
    );
    
    expect(screen.getByText('Users who logged in this month')).toBeInTheDocument();
  });

  it('handles zero trend gracefully', () => {
    render(
      <MetricCard
        title="Orders"
        value={100}
        trend={0}
        format="number"
      />
    );
    
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('handles undefined trend gracefully', () => {
    render(
      <MetricCard
        title="Orders"
        value={100}
        format="number"
      />
    );
    
    expect(screen.queryByText('vs last period')).not.toBeInTheDocument();
  });

  it('applies custom className correctly', () => {
    render(
      <MetricCard
        title="Test Metric"
        value={123}
        className="custom-class"
        format="number"
      />
    );
    
    // The card should have the custom class
    const cardElement = screen.getByText('Test Metric').closest('.custom-class');
    expect(cardElement).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    render(
      <MetricCard
        title="Big Number"
        value={1234567.89}
        format="currency"
      />
    );
    
    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
  });

  it('formats small decimal numbers correctly', () => {
    render(
      <MetricCard
        title="Small Percentage"
        value={0.123}
        format="percentage"
      />
    );
    
    expect(screen.getByText('0.1%')).toBeInTheDocument();
  });

  it('renders all elements in correct structure', () => {
    render(
      <MetricCard
        title="Complete Metric"
        value={5000}
        icon={<Users data-testid="users-icon" />}
        trend={12.5}
        description="Total registered users"
        format="number"
      />
    );
    
    // All elements should be present
    expect(screen.getByText('Complete Metric')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('Total registered users')).toBeInTheDocument();
    expect(screen.getByText('vs last period')).toBeInTheDocument();
  });
});