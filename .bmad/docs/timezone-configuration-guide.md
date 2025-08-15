# Timezone Configuration Guide for AGI Staffers

## Overview
While the AGI Staffers infrastructure operates on Chicago time (America/Chicago), client websites can be configured with their own specific timezones. This guide explains how to implement timezone flexibility.

## System vs Client Timezones

### System Timezone (Chicago)
- VPS system time: America/Chicago
- Admin dashboard: Chicago time
- Backup schedules: Chicago time
- Monitoring alerts: Chicago time
- System logs: Chicago time

### Client Timezone Configuration
Each client website can have its own timezone setting independent of the system timezone.

## Implementation Strategies

### 1. Environment Variable Approach
```yaml
# docker-compose.yml for client site
services:
  client-website:
    image: client-site:latest
    environment:
      - TZ=America/New_York  # Client's timezone
      - DISPLAY_TIMEZONE=America/New_York
      - SYSTEM_TZ=America/Chicago  # System reference
```

### 2. Database Storage Approach
```sql
-- Client configuration table
CREATE TABLE client_config (
    client_id UUID PRIMARY KEY,
    domain VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'America/Chicago',
    display_timezone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example entries
INSERT INTO client_config (client_id, domain, timezone, display_timezone) VALUES
('uuid-1', 'gangrunprinting.com', 'America/Los_Angeles', 'Pacific Time'),
('uuid-2', 'vaina.com.do', 'America/Santo_Domingo', 'Atlantic Standard Time'),
('uuid-3', 'elarmario.com.do', 'America/Santo_Domingo', 'Atlantic Standard Time');
```

### 3. Application-Level Configuration
```javascript
// config/timezones.js
const clientTimezones = {
  'gangrunprinting.com': {
    timezone: 'America/Los_Angeles',
    display: 'PST/PDT',
    offset: -8  // or -7 during DST
  },
  'vaina.com.do': {
    timezone: 'America/Santo_Domingo',
    display: 'AST',
    offset: -4
  },
  'elarmario.com.do': {
    timezone: 'America/Santo_Domingo',
    display: 'AST',
    offset: -4
  },
  'default': {
    timezone: 'America/Chicago',
    display: 'CST/CDT',
    offset: -6  // or -5 during DST
  }
};

// Helper function
function getClientTimezone(domain) {
  return clientTimezones[domain] || clientTimezones.default;
}
```

### 4. Next.js Implementation
```typescript
// lib/timezone.ts
import { format, utcToZonedTime } from 'date-fns-tz';

export function formatClientTime(date: Date, clientDomain: string): string {
  const config = getClientTimezone(clientDomain);
  const zonedDate = utcToZonedTime(date, config.timezone);
  return format(zonedDate, 'yyyy-MM-dd HH:mm:ss zzz', { timeZone: config.timezone });
}

// In component
export default function ClientDashboard({ domain }: { domain: string }) {
  const clientTime = formatClientTime(new Date(), domain);
  return <div>Local Time: {clientTime}</div>;
}
```

### 5. Docker Compose Template
```yaml
# template-docker-compose.yml
version: '3.8'
services:
  ${CLIENT_NAME}-website:
    image: agistaffers/website-template:latest
    container_name: ${CLIENT_NAME}-site
    environment:
      - TZ=${CLIENT_TIMEZONE:-America/Chicago}
      - CLIENT_DOMAIN=${CLIENT_DOMAIN}
      - CLIENT_TIMEZONE=${CLIENT_TIMEZONE}
      - DATABASE_URL=postgresql://...
    ports:
      - "${CLIENT_PORT}:3000"
    networks:
      - agi-network
    labels:
      - "client=${CLIENT_NAME}"
      - "timezone=${CLIENT_TIMEZONE}"
```

## Configuration Examples

### Example 1: Los Angeles Client
```bash
# .env.gangrunprinting
CLIENT_NAME=gangrunprinting
CLIENT_DOMAIN=gangrunprinting.com
CLIENT_TIMEZONE=America/Los_Angeles
CLIENT_PORT=3003
```

### Example 2: Dominican Republic Client
```bash
# .env.vaina
CLIENT_NAME=vaina
CLIENT_DOMAIN=vaina.com.do
CLIENT_TIMEZONE=America/Santo_Domingo
CLIENT_PORT=3005
```

### Example 3: European Client
```bash
# .env.euroclient
CLIENT_NAME=euroclient
CLIENT_DOMAIN=euroclient.com
CLIENT_TIMEZONE=Europe/Berlin
CLIENT_PORT=3007
```

## Best Practices

### 1. Always Store UTC
- Store all timestamps in UTC in the database
- Convert to client timezone only for display
- Use `TIMESTAMP WITH TIME ZONE` in PostgreSQL

### 2. User Preferences
```javascript
// Allow users to override timezone
const userPreferredTimezone = user.preferences?.timezone || clientConfig.timezone;
```

### 3. Timezone Detection
```javascript
// Detect browser timezone
const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Use as fallback or suggestion
```

### 4. Clear Display
- Always show timezone abbreviation (PST, EST, etc.)
- Consider showing multiple timezones for global clients
- Use relative time for recent events ("2 hours ago")

## Implementation Checklist

- [ ] Determine client's preferred timezone
- [ ] Configure Docker container with client timezone
- [ ] Set up database timezone handling
- [ ] Implement timezone conversion in application
- [ ] Test datetime display across timezones
- [ ] Document timezone in client configuration
- [ ] Set up timezone-aware scheduling if needed

## Common Timezones Reference

### North America
- `America/New_York` (EST/EDT)
- `America/Chicago` (CST/CDT)
- `America/Denver` (MST/MDT)
- `America/Los_Angeles` (PST/PDT)
- `America/Phoenix` (MST - no DST)

### Caribbean/Latin America
- `America/Santo_Domingo` (AST)
- `America/Mexico_City` (CST)
- `America/Sao_Paulo` (BRT)
- `America/Buenos_Aires` (ART)

### Europe
- `Europe/London` (GMT/BST)
- `Europe/Paris` (CET/CEST)
- `Europe/Berlin` (CET/CEST)
- `Europe/Moscow` (MSK)

### Asia/Pacific
- `Asia/Tokyo` (JST)
- `Asia/Shanghai` (CST)
- `Asia/Kolkata` (IST)
- `Australia/Sydney` (AEDT/AEST)

## Testing Timezone Configuration

```bash
# Test client timezone setting
docker exec client-container date

# Test application timezone
curl https://client-domain.com/api/time

# Verify database timezone
docker exec postgres psql -U postgres -c "SHOW timezone;"
docker exec postgres psql -U postgres -c "SELECT now() AT TIME ZONE 'America/Santo_Domingo';"
```

## Notes
- System infrastructure remains on Chicago time
- Each client can have independent timezone
- Always validate timezone strings against IANA database
- Consider daylight saving time changes
- Test thoroughly before client deployment