# Customer Onboarding & Website Builder Features

**Status:** In Progress  
**Created:** August 14, 2025  
**Agent:** James (dev)  
**Priority:** HIGH

---

## Story
As AGI STAFFERS, we need comprehensive onboarding and website builder features to provide a seamless customer experience for creating and managing websites.

## Acceptance Criteria
- [ ] Step-by-step onboarding wizard with progress tracking
- [ ] Template selection with live preview
- [ ] Domain connection assistant
- [ ] Auto-setup for common business types
- [ ] Welcome email sequence system
- [ ] Drag-and-drop page editor
- [ ] Live preview while editing
- [ ] Mobile responsive editing
- [ ] SEO optimization tools
- [ ] Custom CSS/JS injection
- [ ] Stripe subscription management
- [ ] Usage-based billing system
- [ ] Invoice generation & auto-payment
- [ ] Payment failure recovery
- [ ] Coupon/discount system

## Tasks

### Phase 1: Onboarding Wizard
- [x] Create onboarding service class
- [x] Build OnboardingWizard component
- [x] Create WelcomeStep component
- [x] Create BusinessTypeStep component
- [ ] Create TemplateSelectionStep with live preview
- [ ] Create BusinessInfoStep for collecting details
- [ ] Create DomainSetupStep with connection assistant
- [ ] Create CustomizationStep for branding
- [ ] Create LaunchStep final review
- [ ] Add API routes for onboarding progress
- [ ] Integrate with database for persistence

### Phase 2: Website Builder
- [ ] Create drag-drop page editor service
- [ ] Build DragDropEditor component
- [ ] Implement live preview system
- [ ] Add mobile responsive toggle
- [ ] Create SEO tools panel
- [ ] Add CSS/JS injection system
- [ ] Build template management
- [ ] Create component library
- [ ] Add image upload/management
- [ ] Implement auto-save functionality

### Phase 3: Payment & Billing
- [ ] Integrate Stripe SDK
- [ ] Create subscription management service
- [ ] Build usage tracking system
- [ ] Create invoice generation
- [ ] Add payment failure recovery
- [ ] Build coupon system
- [ ] Create billing dashboard
- [ ] Add payment methods management
- [ ] Implement webhook handlers
- [ ] Create billing notifications

## Dev Agent Record

### Tools Used
- firecrawl: Researching React DnD, Stripe docs
- shadcn_ui: Generating UI components
- postgres: Database schema updates
- ide_integration: Code diagnostics

### Debug Log
- Creating onboarding flow components
- Using Framer Motion for animations
- Implementing step-by-step wizard pattern

### Completion Notes
- [ ] All onboarding steps functional
- [ ] Website builder operational
- [ ] Payment system integrated
- [ ] Full test coverage

### File List
- `/lib/onboarding-service.ts` - Created
- `/components/onboarding/OnboardingWizard.tsx` - Created
- `/components/onboarding/steps/WelcomeStep.tsx` - Created
- `/components/onboarding/steps/BusinessTypeStep.tsx` - Created

### Change Log
- Created onboarding service with progress tracking
- Built main wizard component with navigation
- Added Welcome and BusinessType steps

---

## Testing
- [ ] Unit tests for all services
- [ ] Component tests for UI
- [ ] Integration tests for workflows
- [ ] E2E tests for full flows