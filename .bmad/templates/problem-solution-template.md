# [PROBLEM TITLE] - Problem & Solution Documentation

**Date:** [YYYY-MM-DD]
**Time:** [HH:MM AM/PM] CST
**Author:** [Your Name / System]
**Status:** [INVESTIGATING | IN_PROGRESS | RESOLVED | MONITORING]
**Severity:** [LOW | MEDIUM | HIGH | CRITICAL]
**Category:** [Deployment | Build | Database | UI/UX | Performance | Security | Integration]

---

## EXECUTIVE SUMMARY
[One paragraph summary of the problem and its impact]

---

## PROBLEM STATEMENT

### Description
[Detailed description of what went wrong]

### Impact
- **Users Affected:** [Number/Percentage]
- **Services Affected:** [List services]
- **Duration:** [How long the issue persisted]
- **Business Impact:** [Revenue loss, user complaints, etc.]

### Error Messages/Logs
```
[Paste relevant error messages or logs]
```

### Screenshot/Evidence
[Include screenshots if applicable]

---

## ROOT CAUSE ANALYSIS

### Investigation Steps
1. [Step 1 - What was checked]
2. [Step 2 - What was discovered]
3. [Step 3 - What led to the root cause]

### Root Cause
[Detailed explanation of why the problem occurred]

### Contributing Factors
- [Factor 1]
- [Factor 2]
- [Factor 3]

---

## SOLUTION IMPLEMENTED

### Immediate Fix
```bash
# Commands or code used for immediate resolution
[Insert commands/code]
```

### Permanent Solution
[Detailed explanation of the long-term fix]

### Implementation Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Verification
```bash
# Commands to verify the fix works
[Insert verification commands]
```

---

## PREVENTION STRATEGY

### Process Changes
- [ ] [Change 1 to prevent recurrence]
- [ ] [Change 2 to prevent recurrence]
- [ ] [Change 3 to prevent recurrence]

### Automated Checks
```bash
# Script or commands to detect this issue early
[Insert detection script]
```

### Monitoring/Alerts
- **Metric to Monitor:** [What to watch]
- **Alert Threshold:** [When to alert]
- **Alert Recipients:** [Who gets notified]

---

## LESSONS LEARNED

### What Went Well
- [Positive aspect 1]
- [Positive aspect 2]

### What Could Be Improved
- [Improvement area 1]
- [Improvement area 2]

### Knowledge Gaps Identified
- [Gap 1 that needs documentation/training]
- [Gap 2 that needs documentation/training]

---

## ACTION ITEMS

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action 1] | [Name] | [Date] | [ ] |
| [Action 2] | [Name] | [Date] | [ ] |
| [Action 3] | [Name] | [Date] | [ ] |

---

## RELATED DOCUMENTS
- [Link to related documentation]
- [Link to runbook]
- [Link to architecture diagram]
- [Link to previous similar issues]

---

## FOLLOW-UP

### Next Review Date
[Date to review if the solution is still effective]

### Success Metrics
- [Metric 1 to measure success]
- [Metric 2 to measure success]

### Rollback Plan
[If the solution causes issues, how to rollback]

---

## APPENDIX

### Additional Resources
- [Resource 1]
- [Resource 2]

### Commands Reference
```bash
# Useful commands related to this issue
[Command 1]
[Command 2]
```

### Configuration Changes
```yaml
# Any configuration that was changed
[Config before]
[Config after]
```

---

**Document Version:** 1.0
**Last Updated:** [Date]
**Next Review:** [Date]
**Classification:** [Public | Internal | Confidential]

---

## APPROVAL

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Technical Lead | | | |
| DevOps Lead | | | |
| Product Owner | | | |

---

### Notes for Using This Template:

1. **ALWAYS fill in all sections** - If not applicable, write "N/A" with explanation
2. **Be specific** - Include exact commands, file paths, and timestamps
3. **Include evidence** - Screenshots, logs, metrics graphs
4. **Focus on prevention** - The goal is to never have this problem again
5. **Make it searchable** - Use keywords others might search for
6. **Update status** - Keep the status current as you work through the issue
7. **Link everything** - Connect to related issues, documentation, and systems

### File Naming Convention:
`[YYYY-MM-DD]-[category]-[brief-description].md`
Example: `2025-08-14-deployment-package-size-issue.md`

### Categories to Use:
- `deployment` - Deployment and CI/CD issues
- `build` - Build and compilation problems
- `database` - Database and data issues
- `ui-ux` - Frontend and user interface problems
- `performance` - Speed and optimization issues
- `security` - Security vulnerabilities and fixes
- `integration` - Third-party service issues
- `infrastructure` - Server, network, and hosting issues