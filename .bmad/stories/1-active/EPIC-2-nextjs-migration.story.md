# Epic 2: Next.js 14+ Migration with Pricing Preservation

**Created:** December 15, 2024
**Status:** Active
**Epic Owner:** BMad Orchestrator
**Priority:** Critical
**Risk Level:** High (Complex pricing system preservation)

## Epic Overview

Migrate Gang Run Printing from Vite/React to Next.js 14+ while preserving all completed Epic 1 functionality, especially the complex pricing engine and broker system.

## Critical Preservation Requirements

### 1. Complex Pricing Engine 🎯
- **Documentation-Compliant Engine** (`/src/utils/pricing/documentation-calculations.ts`)
  - 5-step pricing formula: Base → Adjusted → Exact Size → Turnaround → Add-ons
  - 13 complex add-ons with sub-options
  - Broker discount system
  - "Our Tagline" discount (5% off, hidden for brokers)

- **Advanced Broker Pricing Engine** (`/src/utils/pricing/calculations.ts`)
  - 4-tier broker system (Bronze/Silver/Gold/Platinum)
  - 8 volume breakpoints with multipliers
  - Annual volume tracking
  - Discount stacking rules

### 2. Database Schema Integrity 🗄️
- 35+ migrations must be preserved
- All table relationships maintained
- JSONB configurations for add-ons
- RLS policies preserved

### 3. Business Logic Components 📊
- Paper stock pricing (price_per_sq_inch, second_side_markup)
- Add-on dependencies (EDDM → mandatory banding)
- Size validation rules
- File upload associations
- Order job tracking

## Migration Strategy: Incremental Hybrid Approach

### Phase 1: Foundation Setup (Week 1)
**Story 2.1: Next.js Project Initialization**
- Create Next.js 14+ project in `/nextjs` subfolder
- Configure for self-hosting (standalone output)
- Set up TypeScript strict mode
- Configure Tailwind CSS
- Install Prisma ORM

**Story 2.2: Shared Utilities Architecture**
```
shared/
├── pricing/
│   ├── documentation-calculations.ts (PRESERVE AS-IS)
│   ├── calculations.ts (PRESERVE AS-IS)
│   ├── volume.ts
│   └── broker.ts
├── database/
│   ├── supabase.ts (current)
│   └── prisma.ts (new abstraction)
└── utils/
    ├── validation.ts
    └── formatting.ts
```

**Story 2.3: Database Abstraction Layer**
- Create repository pattern interfaces
- Implement Supabase repositories (current)
- Prepare Prisma repositories (future)
- Ensure zero breaking changes

### Phase 2: Critical Path Migration (Week 2)
**Story 2.4: Homepage Server Component**
- Migrate to Next.js App Router
- Server-side product fetching
- Preserve all animations (Framer Motion)
- Maintain exact pricing display logic

**Story 2.5: Product Catalog Migration**
- Server Components for product listing
- Dynamic routes with generateStaticParams
- Preserve filtering and search
- Maintain pricing calculations

**Story 2.6: Product Detail Page**
- Server-side initial render
- Client components for configuration
- Preserve real-time pricing updates
- Maintain add-on dependencies

### Phase 3: Integration Bridge (Week 3)
**Story 2.7: Authentication Bridge**
- Share Supabase auth between apps
- Session synchronization
- Preserve broker permissions
- Maintain admin access

**Story 2.8: Shared Cart State**
- Database-backed cart storage
- Real-time sync between apps
- Preserve multi-job functionality
- Maintain pricing integrity

**Story 2.9: API Compatibility Layer**
```javascript
// next.config.js
async rewrites() {
  return [
    {
      source: '/api/legacy/:path*',
      destination: 'http://localhost:5173/api/:path*',
    },
  ];
}
```

### Phase 4: Complete Migration (Week 4)
**Story 2.10: Admin Dashboard Migration**
- Preserve all CRUD operations
- Maintain complex forms
- Keep broker management
- Preserve pricing configuration

**Story 2.11: Checkout Flow Migration**
- Careful migration with extensive testing
- Preserve payment integrations
- Maintain order creation logic
- Keep PDF generation

**Story 2.12: Decommission & Deploy**
- Blue-green deployment setup
- Performance validation
- Rollback procedures
- Complete migration

## Acceptance Criteria

### Must Maintain:
- [ ] Pricing calculations accurate to the penny
- [ ] All 13 add-ons with exact configurations
- [ ] Broker tier system with discounts
- [ ] Volume breakpoints and multipliers
- [ ] Database relationships intact
- [ ] Admin functionality preserved
- [ ] File upload system working
- [ ] Order processing unchanged

### Performance Targets:
- [ ] Homepage loads 50% faster (SSR)
- [ ] Product pages SEO optimized
- [ ] Core Web Vitals improved
- [ ] Bundle size reduced by 30%

### Quality Gates:
- [ ] All Epic 1 tests still passing
- [ ] Pricing engine unit tests 100% pass
- [ ] E2E tests for critical paths
- [ ] Load testing validated
- [ ] Rollback tested

## Risk Mitigation

### High-Risk Areas:
1. **Pricing Engine** - Use shared module, extensive testing
2. **Database Migration** - Abstraction layer, dual support
3. **Authentication** - Bridge pattern, gradual migration
4. **Payment Processing** - Keep in Vite initially
5. **File Uploads** - Proxy through Next.js

### Rollback Strategy:
- Blue-green deployment
- Feature flags for gradual rollout
- Database abstraction for quick switch
- Keep Vite app running as fallback

## Technical Decisions

### Architecture Choices:
- **Incremental Migration**: Lower risk than full rewrite
- **Shared Utilities**: Preserve working code
- **Repository Pattern**: Database flexibility
- **Server Components**: Better performance
- **Standalone Output**: Self-hosting ready

### Technology Stack:
- Next.js 14+ with App Router
- TypeScript (strict mode)
- Tailwind CSS
- Prisma ORM (with Supabase compatibility)
- React Query for mutations
- Framer Motion for animations

## Documentation Requirements

Each story must document:
1. Files migrated
2. Tests written
3. Performance metrics
4. Breaking changes (should be none)
5. Rollback procedures

## Success Metrics

- Zero loss of functionality
- No increase in bugs
- Improved performance metrics
- Successful deployment
- Business continuity maintained

---

**Next Action**: Begin Story 2.1 - Next.js Project Initialization