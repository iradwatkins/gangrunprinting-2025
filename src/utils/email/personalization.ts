import { PersonalizationRule } from '../../types/email';

// Customer data interface for personalization
export interface CustomerPersonalizationData {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  company?: string;
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
  broker_id?: string;
  broker_name?: string;
  broker_discount?: number;
  tags?: string[];
  preferences?: {
    product_categories?: string[];
    communication_frequency?: string;
    language?: string;
  };
  order_history?: Array<{
    id: string;
    total: number;
    items: Array<{
      product_name: string;
      quantity: number;
      price: number;
    }>;
    date: string;
  }>;
}

// Product recommendation data
export interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category: string;
  description?: string;
  confidence_score: number;
}

// Personalization engine class
export class EmailPersonalizationEngine {
  private customerData: CustomerPersonalizationData;
  private rules: PersonalizationRule[];

  constructor(customerData: CustomerPersonalizationData, rules: PersonalizationRule[] = []) {
    this.customerData = customerData;
    this.rules = rules;
  }

  // Apply personalization to email content
  public personalizeContent(content: string): string {
    let personalizedContent = content;

    // Apply built-in personalization variables
    personalizedContent = this.applyBuiltInVariables(personalizedContent);

    // Apply custom personalization rules
    for (const rule of this.rules) {
      personalizedContent = this.applyRule(personalizedContent, rule);
    }

    return personalizedContent;
  }

  // Apply built-in personalization variables
  private applyBuiltInVariables(content: string): string {
    const variables: { [key: string]: string } = {
      '{{first_name}}': this.customerData.first_name || 'Friend',
      '{{last_name}}': this.customerData.last_name || '',
      '{{full_name}}': this.getFullName(),
      '{{email}}': this.customerData.email,
      '{{company}}': this.customerData.company || '',
      '{{total_orders}}': this.customerData.total_orders?.toString() || '0',
      '{{total_spent}}': this.formatCurrency(this.customerData.total_spent || 0),
      '{{last_order_date}}': this.formatDate(this.customerData.last_order_date),
      '{{broker_name}}': this.customerData.broker_name || '',
      '{{broker_discount}}': this.formatPercentage(this.customerData.broker_discount || 0),
      '{{customer_tier}}': this.getCustomerTier(),
      '{{greeting}}': this.getPersonalizedGreeting(),
    };

    let result = content;
    for (const [variable, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    }

    return result;
  }

  // Apply a custom personalization rule
  private applyRule(content: string, rule: PersonalizationRule): string {
    const placeholder = `{{${rule.field}}}`;
    const value = this.getFieldValue(rule.field) || rule.default_value || '';
    
    // Apply condition if specified
    if (rule.condition) {
      if (!this.evaluateCondition(rule.condition)) {
        return content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), rule.default_value || '');
      }
    }

    return content.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  }

  // Get value for a specific field
  private getFieldValue(field: string): string {
    const fieldPath = field.split('.');
    let value: any = this.customerData;

    for (const part of fieldPath) {
      value = value?.[part];
      if (value === undefined) break;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return value?.toString() || '';
  }

  // Evaluate a condition string
  private evaluateCondition(condition: string): boolean {
    try {
      // Simple condition evaluation (in production, use a proper expression parser)
      // Format: "field operator value" (e.g., "total_orders > 5")
      const parts = condition.split(' ');
      if (parts.length !== 3) return false;

      const [field, operator, expectedValue] = parts;
      const actualValue = this.getFieldValue(field);

      switch (operator) {
        case '>':
          return parseFloat(actualValue) > parseFloat(expectedValue);
        case '<':
          return parseFloat(actualValue) < parseFloat(expectedValue);
        case '>=':
          return parseFloat(actualValue) >= parseFloat(expectedValue);
        case '<=':
          return parseFloat(actualValue) <= parseFloat(expectedValue);
        case '==':
        case '=':
          return actualValue === expectedValue;
        case '!=':
          return actualValue !== expectedValue;
        case 'contains':
          return actualValue.toLowerCase().includes(expectedValue.toLowerCase());
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  // Get full name with fallback
  private getFullName(): string {
    const firstName = this.customerData.first_name || '';
    const lastName = this.customerData.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Friend';
  }

  // Get personalized greeting based on time and customer data
  private getPersonalizedGreeting(): string {
    const hour = new Date().getHours();
    const firstName = this.customerData.first_name;
    
    let timeGreeting = '';
    if (hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour < 17) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }

    return firstName ? `${timeGreeting}, ${firstName}` : timeGreeting;
  }

  // Determine customer tier based on spending
  private getCustomerTier(): string {
    const totalSpent = this.customerData.total_spent || 0;
    
    if (totalSpent >= 10000) return 'VIP';
    if (totalSpent >= 5000) return 'Gold';
    if (totalSpent >= 1000) return 'Silver';
    return 'Bronze';
  }

  // Format currency
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Format percentage
  private formatPercentage(value: number): string {
    return `${value}%`;
  }

  // Format date
  private formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// Product recommendation engine
export class ProductRecommendationEngine {
  private customerData: CustomerPersonalizationData;

  constructor(customerData: CustomerPersonalizationData) {
    this.customerData = customerData;
  }

  // Generate product recommendations based on customer data
  public async generateRecommendations(limit: number = 4): Promise<ProductRecommendation[]> {
    const recommendations: ProductRecommendation[] = [];

    // Based on order history
    const historyBasedRecs = this.getHistoryBasedRecommendations();
    recommendations.push(...historyBasedRecs);

    // Based on customer preferences
    const preferenceBasedRecs = this.getPreferenceBasedRecommendations();
    recommendations.push(...preferenceBasedRecs);

    // Based on customer tier
    const tierBasedRecs = this.getTierBasedRecommendations();
    recommendations.push(...tierBasedRecs);

    // Sort by confidence score and return top recommendations
    return recommendations
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, limit);
  }

  // Get recommendations based on order history
  private getHistoryBasedRecommendations(): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];
    
    if (!this.customerData.order_history?.length) {
      return recommendations;
    }

    // Analyze frequently ordered categories
    const categoryFrequency: { [key: string]: number } = {};
    
    this.customerData.order_history.forEach(order => {
      order.items.forEach(item => {
        // In a real implementation, you'd get the category from product data
        const category = this.extractCategoryFromProductName(item.product_name);
        categoryFrequency[category] = (categoryFrequency[category] || 0) + item.quantity;
      });
    });

    // Generate recommendations for top categories
    Object.entries(categoryFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .forEach(([category, frequency]) => {
        recommendations.push({
          id: `rec-${category}-${Date.now()}`,
          name: `Recommended ${category} Product`,
          price: this.getAveragePriceForCategory(category),
          category,
          confidence_score: Math.min(0.9, frequency / 10),
          description: `Based on your previous ${category} orders`
        });
      });

    return recommendations;
  }

  // Get recommendations based on customer preferences
  private getPreferenceBasedRecommendations(): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];
    
    if (!this.customerData.preferences?.product_categories?.length) {
      return recommendations;
    }

    this.customerData.preferences.product_categories.forEach(category => {
      recommendations.push({
        id: `pref-${category}-${Date.now()}`,
        name: `Popular ${category} Item`,
        price: this.getAveragePriceForCategory(category),
        category,
        confidence_score: 0.7,
        description: `Based on your interest in ${category}`
      });
    });

    return recommendations;
  }

  // Get recommendations based on customer tier
  private getTierBasedRecommendations(): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];
    const tier = this.getCustomerTier();

    if (tier === 'VIP' || tier === 'Gold') {
      recommendations.push({
        id: `tier-premium-${Date.now()}`,
        name: 'Premium Product Recommendation',
        price: 299.99,
        category: 'Premium',
        confidence_score: 0.8,
        description: `Exclusive product for ${tier} customers`
      });
    }

    return recommendations;
  }

  // Extract category from product name (simplified)
  private extractCategoryFromProductName(productName: string): string {
    const name = productName.toLowerCase();
    
    if (name.includes('business card')) return 'Business Cards';
    if (name.includes('brochure')) return 'Brochures';
    if (name.includes('poster')) return 'Posters';
    if (name.includes('flyer')) return 'Flyers';
    if (name.includes('banner')) return 'Banners';
    if (name.includes('sticker')) return 'Stickers';
    
    return 'General Printing';
  }

  // Get average price for category (mock implementation)
  private getAveragePriceForCategory(category: string): number {
    const prices: { [key: string]: number } = {
      'Business Cards': 29.99,
      'Brochures': 89.99,
      'Posters': 149.99,
      'Flyers': 39.99,
      'Banners': 199.99,
      'Stickers': 19.99,
      'Premium': 299.99,
      'General Printing': 59.99,
    };

    return prices[category] || 49.99;
  }

  // Get customer tier
  private getCustomerTier(): string {
    const totalSpent = this.customerData.total_spent || 0;
    
    if (totalSpent >= 10000) return 'VIP';
    if (totalSpent >= 5000) return 'Gold';
    if (totalSpent >= 1000) return 'Silver';
    return 'Bronze';
  }
}

// Email content personalization utility functions
export const emailPersonalizationUtils = {
  // Generate dynamic subject lines
  generateDynamicSubjectLine: (template: string, customerData: CustomerPersonalizationData): string => {
    const engine = new EmailPersonalizationEngine(customerData);
    return engine.personalizeContent(template);
  },

  // Generate personalized email content
  personalizeEmailContent: (
    content: string, 
    customerData: CustomerPersonalizationData, 
    rules: PersonalizationRule[] = []
  ): string => {
    const engine = new EmailPersonalizationEngine(customerData, rules);
    return engine.personalizeContent(content);
  },

  // Get product recommendations for email
  getProductRecommendations: async (
    customerData: CustomerPersonalizationData, 
    limit: number = 4
  ): Promise<ProductRecommendation[]> => {
    const engine = new ProductRecommendationEngine(customerData);
    return engine.generateRecommendations(limit);
  },

  // Generate personalized email preview text
  generatePreviewText: (customerData: CustomerPersonalizationData): string => {
    const firstName = customerData.first_name || 'Friend';
    const tier = customerData.total_spent && customerData.total_spent >= 1000 ? 'valued' : 'dear';
    
    return `Special offers for our ${tier} customer, ${firstName}`;
  },

  // Validate personalization variables in content
  validatePersonalizationVariables: (content: string): string[] => {
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variablePattern.exec(content)) !== null) {
      variables.push(match[1]);
    }

    return variables;
  },

  // Get available personalization variables
  getAvailableVariables: (): Array<{ variable: string; description: string; example: string }> => {
    return [
      { variable: 'first_name', description: 'Customer first name', example: 'John' },
      { variable: 'last_name', description: 'Customer last name', example: 'Doe' },
      { variable: 'full_name', description: 'Customer full name', example: 'John Doe' },
      { variable: 'email', description: 'Customer email address', example: 'john@example.com' },
      { variable: 'company', description: 'Customer company name', example: 'Acme Corp' },
      { variable: 'total_orders', description: 'Total number of orders', example: '15' },
      { variable: 'total_spent', description: 'Total amount spent', example: '$1,234.56' },
      { variable: 'last_order_date', description: 'Date of last order', example: 'January 15, 2024' },
      { variable: 'broker_name', description: 'Broker name if applicable', example: 'Jane Smith' },
      { variable: 'broker_discount', description: 'Broker discount percentage', example: '15%' },
      { variable: 'customer_tier', description: 'Customer tier (Bronze/Silver/Gold/VIP)', example: 'Gold' },
      { variable: 'greeting', description: 'Time-based personalized greeting', example: 'Good morning, John' },
    ];
  },
};