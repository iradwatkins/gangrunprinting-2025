# ENT-004: Client Website Templates & Multi-Tenant Architecture

## Story Information
- **ID**: ENT-004
- **Title**: Client Website Templates and Multi-Tenant Architecture
- **Epic**: Phase 3 - Multi-Client Scaling
- **Priority**: P2 (Medium - Enterprise Foundation)
- **Estimate**: 8 hours
- **Owner**: dev-agent
- **Editors**: dev-agent, qa-agent

## Description

Create client website template system and multi-tenant architecture foundation for AGI Staffers hosting platform. This establishes the groundwork for customer onboarding and automated website deployment using existing container infrastructure.

**User Story**: As an AGI Staffers platform administrator, I want a templated website deployment system so I can quickly onboard new customers with professional, containerized websites that are automatically managed through our existing infrastructure.

## Acceptance Criteria

- [ ] **AC-001**: Multiple website templates available (business, portfolio, blog, e-commerce)
- [ ] **AC-002**: Template deployment creates isolated Docker containers per customer
- [ ] **AC-003**: Each customer site has unique subdomain routing (customer.agistaffers.com)
- [ ] **AC-004**: Customer sites integrate with existing portainer management
- [ ] **AC-005**: Automated SSL certificate provisioning for customer domains
- [ ] **AC-006**: Template customization system (colors, content, branding)
- [ ] **AC-007**: Customer isolation ensures no cross-tenant data access
- [ ] **AC-008**: Admin dashboard shows all customer sites with status monitoring

## Technical Requirements

### Technology Stack Compliance
- **Templates**: Next.js 14 + TypeScript + shadcn/ui for all client templates
- **Database**: PostgreSQL + Prisma for customer and site management
- **Containerization**: Docker containers with resource limits per customer
- **Network**: Isolated customer networks using existing Docker network architecture

### Multi-Tenant Architecture
```yaml
Customer_Isolation:
  Network_Separation:
    - Customer sites on isolated Docker networks
    - No inter-customer container communication
    - Firewall rules between customer environments

  Data_Separation:
    - Separate database schemas per customer
    - Customer-specific file storage directories
    - Isolated backup and recovery processes

  Resource_Management:
    - CPU and memory limits per customer container
    - Storage quotas and monitoring
    - Bandwidth usage tracking
```

### Database Schema Extension
```sql
-- Customer management tables
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255),
    plan VARCHAR(100) NOT NULL DEFAULT 'starter',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE customer_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    site_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    container_id VARCHAR(255),
    container_status VARCHAR(50) DEFAULT 'pending',
    ssl_enabled BOOLEAN DEFAULT false,
    customization_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE site_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(100) NOT NULL,
    description TEXT,
    template_config JSONB NOT NULL,
    docker_config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true
);
```

## Implementation Notes

### Website Templates to Create

#### 1. Business Template
- Clean corporate design using shadcn/ui components
- About, Services, Contact pages
- Customizable color schemes and branding
- Mobile-responsive design

#### 2. Portfolio Template  
- Creative showcase layout
- Gallery with image optimization
- Project case studies
- Contact form integration

#### 3. Blog Template
- Content management system
- Article listing and detail views
- SEO optimization
- Comment system (optional)

#### 4. E-commerce Template (Basic)
- Product catalog
- Shopping cart functionality
- Payment integration placeholder
- Order management

### Container Architecture
```yaml
Customer_Container_Structure:
  Base_Image: Node.js with Next.js 14
  Resource_Limits:
    - CPU: 0.5 cores per site
    - Memory: 512MB per site
    - Storage: 2GB per site
  
  Network_Configuration:
    - Isolated customer network per site
    - Reverse proxy through existing Nginx Proxy Manager
    - SSL termination at proxy level
  
  Health_Monitoring:
    - Container health checks
    - Application performance monitoring
    - Automatic restart on failure
```

### Key Files to Create

#### Template System
- `/templates/business/` - Business website template
- `/templates/portfolio/` - Portfolio website template  
- `/templates/blog/` - Blog website template
- `/templates/ecommerce/` - E-commerce website template

#### Management System
- `/agistaffers/app/api/customers/route.ts` - Customer CRUD operations
- `/agistaffers/app/api/sites/route.ts` - Site management API
- `/agistaffers/app/api/templates/route.ts` - Template management
- `/agistaffers/components/dashboard/CustomerSites.tsx` - Customer site management UI
- `/agistaffers/lib/container-service.ts` - Docker container management
- `/agistaffers/lib/template-service.ts` - Template deployment logic

## Existing Tool Integration

### Portainer Integration
- Register all customer containers with portainer
- Use portainer API for container lifecycle management
- Integrate with existing container monitoring

### Nginx Proxy Manager Integration
- Automatic domain routing setup
- SSL certificate provisioning
- Load balancing configuration

### PostgreSQL Integration
- Use existing database with new customer/site tables
- Maintain data consistency and referential integrity
- Backup customer data with existing backup systems

## Data Protection Measures

- **Customer Data Isolation**: Complete separation between customer environments
- **No SteppersLife Impact**: This enhancement only affects AGI Staffers platform
- **Backup Strategy**: Customer sites included in existing backup systems
- **Access Control**: Admin-only access to customer management features

## Testing Requirements

- [ ] Template deployment and customization testing
- [ ] Customer isolation verification (network and data)
- [ ] Container resource limit enforcement testing
- [ ] SSL certificate provisioning testing
- [ ] portainer integration testing
- [ ] Database schema migration testing
- [ ] Admin dashboard customer management testing

## Dependencies

- Existing portainer management must be operational
- Nginx Proxy Manager must be configured for dynamic routing
- PostgreSQL database must be available for schema extensions
- Existing monitoring infrastructure must accommodate customer sites

## Definition of Done

- [ ] All acceptance criteria met and verified
- [ ] Four website templates (business, portfolio, blog, e-commerce) functional
- [ ] Multi-tenant architecture properly isolates customer environments
- [ ] Customer site deployment fully automated through admin dashboard
- [ ] SSL certificates automatically provisioned for customer domains
- [ ] All customer containers visible and manageable through portainer
- [ ] Code follows TypeScript strict mode and architectural standards
- [ ] Database migrations tested and documented
- [ ] Customer isolation security tested and verified
- [ ] Performance impact on existing systems is minimal

## Notes

This story establishes the foundation for AGI Staffers as a competitive hosting platform. The multi-tenant architecture ensures scalability while the template system provides immediate value to potential customers. This aligns with PRD requirements for customer-ready hosting capabilities.