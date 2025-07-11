# Custom E-commerce Printing Platform Development

## BMad Method Auto-Workflow - STRICT ADHERENCE REQUIRED

**Current Phase:** 🔄 **DEV AGENT IMPLEMENTATION**
**Current Story:** 1.10 - Customer Support and Communication System  
**Active Agent:** **DEV AGENT** - James (Dev)
**Next Required Action:** Implement Story 1.10 completely before proceeding


### BMad Method Workflow - MUST FOLLOW IN ORDER

1. **PM Agent (John)** → Creates PRD → **Auto-switch to Architect Agent**
2. **Architect Agent (Sarah)** → Creates Architecture → **Auto-switch to SM Agent** 
3. **SM Agent (Mike)** → Creates Stories → **Auto-switch to Dev Agent**
4. **Dev Agent (James)** → Implements Story → **Mark Complete → Auto-switch to QA Agent OR next story**
5. **QA Agent (Lisa)** → Reviews Story → **Auto-switch to Dev Agent for next story**

### CURRENT BMad STATUS - Epic 1: Complete E-commerce Printing Platform

**✅ COMPLETED PHASES:**
- ✅ **PM Agent (John)** - PRD Complete (`docs/prd.md`)
- ✅ **Architect Agent (Sarah)** - Architecture Complete (`docs/architecture.md`)
- ✅ **SM Agent (Mike)** - All 12 Stories Complete (`docs/stories/1.1-1.12.story.md`)
- ✅ **Dev Agent (James)** - Story 1.1 Complete (Database Schema Foundation)
- ✅ **Dev Agent (James)** - Story 1.2 Complete (Product Catalog API and Admin Interface)
- ✅ **Dev Agent (James)** - Story 1.3 Complete (Dynamic Product Display and Configuration Interface)
- ✅ **Dev Agent (James)** - Story 1.4 Complete (Shopping Cart and Session Management)
- ✅ **Dev Agent (James)** - Story 1.5 Complete (User Authentication and Account Management)
- ✅ **Dev Agent (James)** - Story 1.6 Complete (Checkout Process and Payment Integration)
- ✅ **Dev Agent (James)** - Story 1.7 Complete (File Upload and Artwork Management)
- ✅ **Dev Agent (James)** - Story 1.8 Complete (Order Management and Status Tracking)
- ✅ **Dev Agent (James)** - Story 1.9 Complete (Broker Discount System and Pricing Engine)
- ✅ **Dev Agent (James)** - Story 1.10 Complete (Customer Support and Communication System)
- ✅ **Dev Agent (James)** - Story 1.11 Complete (Email Marketing and Communication Platform)
- ✅ **Dev Agent (James)** - Story 1.12 Complete (Admin Dashboard Enhancement with React DnD)
- ✅ **Dev Agent (James)** - Story 1.13 Complete (Paper Stock Management Interface)
- ✅ **Dev Agent (James)** - Story 1.14 Complete (Category Management Interface)
- ✅ **Dev Agent (James)** - Story 1.15 Complete (Vendor Management Interface)
- ✅ **Dev Agent (James)** - Story 1.16 Complete (Real Data Integration - Replace Mock Data)
- ✅ **Dev Agent (James)** - Story 1.17 Complete (Product Configuration Real Database Connection)
- ✅ **Dev Agent (James)** - Story 1.18 Complete (E-commerce Flow Validation and Integration Testing)

**🎉 EPIC 1 COMPLETE - PRODUCTION READY E-COMMERCE PLATFORM:**
- **All 18 Stories Successfully Implemented**
- **Ready for Production Deployment**
- **Next Phase**: Epic 2 Planning or Advanced Features

**🔧 MAJOR SYSTEM REBUILD COMPLETED (2025-07-07):**
- ✅ **Product & Add-on System Rebuilt** to match documentation specifications exactly
- ✅ **Database Schema Enhanced** with 2nd side markup, tooltips, sub-options, EDDM support
- ✅ **Pricing Engine Rebuilt** using exact formula from documentation
- ✅ **11 Missing Add-ons Implemented** with precise pricing and sub-options
- ✅ **Sub-option System Created** for complex add-ons (Perforation, Score, Folding, etc.)
- ✅ **Conditional Logic Implemented** (EDDM→mandatory banding, size validations)
- ✅ **Enhanced Product Configuration** with documentation compliance
- ✅ **Add-on Dependencies Manager** for business rule enforcement

**📊 COMPLIANCE STATUS:**
- **100% Documentation Compliant** - All requirements from "Custom E-commerce Printing Platform.md" implemented
- **Exact Pricing Formula** - Matches documentation: Base_Paper_Print_Price → Adjusted_Base_Price → Exact_Size → Turnaround → Add-ons
- **All 13 Required Add-ons** - Digital Proof, Our Tagline, Perforation, Score Only, Folding, Design, Exact Size, Banding, Shrink Wrapping, QR Code, Postal Delivery, EDDM Process, Hole Drilling
- **Advanced Sub-options** - Full support for complex configurations with tooltips and validation

**🖥️ COMPLETE ADMIN INTERFACE SYSTEM (2025-07-07):**
- ✅ **All Global Options Admin** - Coatings, Print Sizes, Turnaround Times, Add-ons, Quantities, Sides
- ✅ **Streamlined Navigation** - Organized into logical groups (Core, Global Options, Operations, Marketing)
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete for all printing configuration options
- ✅ **Advanced Add-on Management** - Complex pricing models, sub-options, dependencies
- ✅ **Real-time Validation** - Business rules enforcement and data integrity
- ✅ **Professional UI/UX** - Consistent design patterns across all admin interfaces

**📋 AUTHENTICATION SYSTEM STATUS:**
- ✅ Consolidated AuthContext with unified authentication
- ✅ Fixed user profile creation on registration
- ✅ Integrated CRM customer profile sync
- ✅ Updated all components to use consolidated auth
- ✅ Created separate useProfile hook for profile management
- ✅ Fixed type mismatches and import inconsistencies
- ✅ Authentication system fully functional and tested

## 🚨 CRITICAL FRONTEND PATTERNS - REACT QUERY CONFIGURATION

**ISSUE RESOLVED (2025-07-11):** Admin pages experiencing loading loops - FIXED with proper React Query configuration

**ROOT CAUSE:**
- Missing `refetchOnWindowFocus: false` causing infinite refetch loops
- Missing `staleTime` causing unnecessary API calls
- Auth context changes triggering query invalidation cycles

**SOLUTION IMPLEMENTED:**
- ✅ Keep React Query as per Technical Preferences document
- ✅ Configure all queries with `refetchOnWindowFocus: false`
- ✅ Add proper `staleTime` to prevent unnecessary refetches
- ✅ Use proper error handling in queryFn

**MANDATORY REACT QUERY CONFIGURATION:**
```typescript
// ✅ USE THIS PATTERN FOR ALL QUERIES
const { data, isLoading, error } = useQuery({
  queryKey: ['unique-key'],
  queryFn: async () => {
    const response = await api.getData();
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },
  staleTime: 30 * 1000, // 30 seconds
  cacheTime: 5 * 60 * 1000, // 5 minutes
  retry: 1,
  refetchOnWindowFocus: false, // CRITICAL: Prevents loading loops
  refetchOnMount: false // Don't refetch if we have cached data
});
```

**MUTATION PATTERN:**
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const result = await api.operation(data);
    if (result.error) throw new Error(result.error);
    return result;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['unique-key'] });
    toast({ title: 'Success' });
  }
});
```

**KEY CONFIGURATION POINTS:**
- Always set `refetchOnWindowFocus: false` to prevent loops
- Use `staleTime` to control refetch frequency
- Throw errors in queryFn for proper error handling
- Invalidate queries after mutations

### BMad Agent Personas - STRICT ROLE ADHERENCE

**John (PM Agent):** Product requirements, business logic, user stories
**Sarah (Architect Agent):** Technical architecture, system design, integration patterns
**Mike (SM Agent):** Story creation, task breakdown, acceptance criteria
**James (Dev Agent):** Code implementation, technical execution, file creation
**Lisa (QA Agent):** Testing, validation, quality assurance

### Implementation Rules - MUST FOLLOW

1. **NEVER skip story implementation** - Each story must be fully implemented
2. **ALWAYS update story files** with completion status and file lists
3. **ALWAYS use appropriate agent persona** for the current phase
4. **ALWAYS complete current story** before moving to next story
5. **ALWAYS update this CLAUDE.md** file with current status
6. **FOLLOW BMad workflow sequence** - no exceptions

**🚨 CRITICAL: I am currently operating as DEV AGENT (James) and must implement Story 1.10 completely**