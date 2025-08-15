# Next.js Migration Architecture Design

**Architect:** Sarah (BMad Architecture Agent)  
**Date:** December 15, 2024  
**Status:** Implementation Ready

## Executive Summary

This architecture enables incremental migration from Vite to Next.js 14+ while maintaining 100% functionality and preserving the critical pricing engine. The design prioritizes zero downtime, business continuity, and preservation of complex business logic.

## System Architecture

### Current State (Vite + React)
```
┌─────────────────────────────────────────┐
│           Vite React App                 │
│  ┌─────────────┐  ┌──────────────────┐ │
│  │   React     │  │  Pricing Engine   │ │
│  │  Components │  │  (Complex Logic)  │ │
│  └─────────────┘  └──────────────────┘ │
│  ┌─────────────┐  ┌──────────────────┐ │
│  │  React      │  │    Supabase      │ │
│  │   Router    │  │   Integration    │ │
│  └─────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
```

### Target State (Next.js 14+)
```
┌─────────────────────────────────────────┐
│          Next.js 14+ App                 │
│  ┌─────────────┐  ┌──────────────────┐ │
│  │   Server    │  │  Shared Pricing  │ │
│  │ Components  │  │   Engine Module  │ │
│  └─────────────┘  └──────────────────┘ │
│  ┌─────────────┐  ┌──────────────────┐ │
│  │  App Router │  │  Prisma + Supa   │ │
│  │   (RSC)     │  │   Abstraction    │ │
│  └─────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
```

### Migration Architecture (Hybrid)
```
┌──────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                    │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
    ┌────────▼────────┐      ┌───────▼────────┐
    │   Next.js App   │      │   Vite App     │
    │   (Port 3101)   │      │  (Port 3100)   │
    └────────┬────────┘      └───────┬────────┘
             │                        │
    ┌────────▼────────────────────────▼────────┐
    │         Shared Pricing Module             │
    │  ┌─────────────────────────────────────┐ │
    │  │  documentation-calculations.ts      │ │
    │  │  calculations.ts (broker logic)     │ │
    │  │  volume.ts, broker.ts              │ │
    │  └─────────────────────────────────────┘ │
    └────────────────┬──────────────────────────┘
                     │
    ┌────────────────▼──────────────────────────┐
    │         Database Abstraction Layer         │
    │  ┌──────────────┐  ┌──────────────────┐  │
    │  │  Supabase    │  │     Prisma       │  │
    │  │  Repository  │  │   Repository     │  │
    │  └──────────────┘  └──────────────────┘  │
    └────────────────┬──────────────────────────┘
                     │
    ┌────────────────▼──────────────────────────┐
    │            PostgreSQL Database             │
    │         (Existing Supabase Schema)         │
    └────────────────────────────────────────────┘
```

## Technical Implementation

### 1. Project Structure
```
gangrunprinting-2025/
├── src/                    # Existing Vite app
├── nextjs/                 # New Next.js app
│   ├── app/               # App Router
│   ├── components/        # React components
│   └── lib/              # Utilities
├── shared/                # Shared modules
│   ├── pricing/          # CRITICAL - Pricing engine
│   ├── database/         # DB abstraction
│   └── types/           # Shared TypeScript types
└── scripts/              # Migration scripts
```

### 2. Shared Pricing Module
```typescript
// shared/pricing/index.ts
export class PricingService {
  private docCalculator: DocumentationPricingCalculator;
  private brokerCalculator: AdvancedPricingCalculator;
  
  constructor() {
    // Initialize with existing logic
    this.docCalculator = new DocumentationPricingCalculator();
    this.brokerCalculator = new AdvancedPricingCalculator();
  }
  
  async calculatePrice(context: PricingContext): Promise<PriceCalculation> {
    // Preserve exact calculation logic
    const basePrice = await this.docCalculator.calculate(context);
    const finalPrice = await this.brokerCalculator.applyDiscounts(basePrice, context);
    return finalPrice;
  }
}
```

### 3. Database Abstraction Pattern
```typescript
// shared/database/repository.interface.ts
interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// shared/database/product.repository.ts
export class ProductRepository implements Repository<Product> {
  private supabase: SupabaseProductRepo;
  private prisma?: PrismaProductRepo;
  
  async findAll(): Promise<Product[]> {
    // Use Supabase for now, Prisma later
    return this.supabase.findAll();
  }
}
```

### 4. Next.js Configuration
```javascript
// nextjs/next.config.js
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  
  // Proxy to Vite during migration
  async rewrites() {
    return {
      beforeFiles: [
        // Next.js handles these routes
        { source: '/', destination: '/' },
        { source: '/products', destination: '/products' },
      ],
      afterFiles: [
        // Fallback to Vite for unmigrated routes
        { source: '/api/:path*', destination: 'http://localhost:3100/api/:path*' },
        { source: '/checkout/:path*', destination: 'http://localhost:3100/checkout/:path*' },
      ],
    };
  },
};
```

### 5. Server Component Example
```typescript
// nextjs/app/products/page.tsx
import { PricingService } from '@/shared/pricing';
import { ProductRepository } from '@/shared/database';

export default async function ProductsPage() {
  const repo = new ProductRepository();
  const products = await repo.findAll();
  const pricing = new PricingService();
  
  // Calculate prices server-side
  const productsWithPrices = await Promise.all(
    products.map(async (product) => ({
      ...product,
      price: await pricing.calculatePrice({ product, quantity: 1 })
    }))
  );
  
  return <ProductGrid products={productsWithPrices} />;
}
```

## Deployment Strategy

### Blue-Green Deployment
```nginx
# /etc/nginx/sites-available/gangrunprinting
upstream app_blue {
    server localhost:3100;  # Vite (current)
}

upstream app_green {
    server localhost:3101;  # Next.js (new)
}

server {
    listen 80;
    server_name gangrunprinting.com;
    
    # Route based on header for testing
    set $upstream app_blue;
    if ($http_x_use_nextjs = "true") {
        set $upstream app_green;
    }
    
    location / {
        proxy_pass http://$upstream;
    }
}
```

### Migration Phases

#### Phase 1: Parallel Setup (Day 1-3)
- Set up Next.js project
- Configure shared modules
- Deploy both apps

#### Phase 2: Progressive Migration (Week 1-2)
- Migrate static pages (Homepage, About)
- Migrate product catalog
- Test with feature flags

#### Phase 3: Critical Path (Week 3)
- Migrate authentication
- Migrate cart functionality
- Extensive testing

#### Phase 4: Completion (Week 4)
- Migrate admin dashboard
- Migrate checkout
- Performance validation

## Performance Optimizations

### Server Components Benefits
- Reduced JavaScript bundle (−40%)
- Faster initial page load
- Better SEO indexing
- Server-side pricing calculations

### Caching Strategy
```typescript
// Pricing cache with Redis
const cacheKey = `price:${productId}:${quantity}:${brokerId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const price = await pricingService.calculate(context);
await redis.setex(cacheKey, 3600, JSON.stringify(price));
return price;
```

## Risk Mitigation

### Testing Strategy
1. **Unit Tests**: 100% coverage for pricing
2. **Integration Tests**: API compatibility
3. **E2E Tests**: Critical user journeys
4. **Load Tests**: Performance validation
5. **Regression Tests**: Price accuracy

### Rollback Plan
```bash
# Quick rollback script
#!/bin/bash
# Switch Nginx upstream back to Vite
sed -i 's/app_green/app_blue/g' /etc/nginx/sites-available/gangrunprinting
nginx -s reload
```

## Monitoring & Observability

### Key Metrics
- Response times (p50, p95, p99)
- Pricing calculation accuracy
- Error rates by endpoint
- Database query performance
- Bundle size changes

### Alerting
- Price variance > $0.01
- Response time > 2s
- Error rate > 1%
- Memory usage > 80%

## Success Criteria

### Technical Metrics
- [ ] Core Web Vitals improved
- [ ] Bundle size reduced 30%+
- [ ] Server response < 200ms
- [ ] 100% pricing accuracy

### Business Metrics
- [ ] Zero downtime during migration
- [ ] No customer complaints
- [ ] Improved conversion rate
- [ ] Reduced infrastructure costs

---

**Next Steps**: Begin Story 2.1 - Initialize Next.js project with this architecture