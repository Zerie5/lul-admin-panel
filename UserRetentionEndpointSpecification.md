# User Retention API Endpoint Specification

## Endpoint
```
GET /api/admin/reports/user-retention
```

## Description
Retrieves user retention analytics data with cohort-based analysis. This endpoint supports various retention cycles and activity definitions to provide meaningful insights for remittance business models.

## Authentication
- **Required**: Bearer token in Authorization header
- **Header**: `Authorization: Bearer {token}`

## Query Parameters

### Core Parameters (Required)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | string | Yes | Start date in YYYY-MM-DD format |
| `endDate` | string | Yes | End date in YYYY-MM-DD format |
| `timeFrame` | string | Yes | Time aggregation frame |

**timeFrame Options:**
- `daily` - Daily aggregation
- `weekly` - Weekly aggregation  
- `monthly` - Monthly aggregation
- `yearly` - Yearly aggregation

### Retention-Specific Parameters (Optional)

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `retentionType` | string | No | `monthly` | Defines the retention cycle analysis |
| `activityDefinition` | string | No | `transaction` | Defines what constitutes "active" behavior |
| `includeIncompleteCohorts` | boolean | No | `false` | Whether to include cohorts with incomplete data |

#### retentionType Options:
- `monthly` - 30, 60, 90, 180, 365 day retention cycles (suitable for remittance apps)
- `payday` - Bi-weekly and monthly cycles aligned with salary periods
- `quarterly` - 90, 180, 270, 365 day seasonal retention cycles

#### activityDefinition Options:
- `transaction` - User must complete at least one transaction
- `login` - User must log into the platform
- `any_activity` - Any platform interaction (login, transaction, profile update, etc.)

## Example Requests

### Basic Request
```
GET /api/admin/reports/user-retention?startDate=2024-01-01&endDate=2024-03-31&timeFrame=monthly
```

### Advanced Request with Retention Filters
```
GET /api/admin/reports/user-retention?startDate=2024-01-01&endDate=2024-03-31&timeFrame=monthly&retentionType=monthly&activityDefinition=transaction&includeIncompleteCohorts=false
```

### Payday Cycle Analysis
```
GET /api/admin/reports/user-retention?startDate=2024-01-01&endDate=2024-03-31&timeFrame=weekly&retentionType=payday&activityDefinition=transaction&includeIncompleteCohorts=true
```

### Seasonal Retention Analysis
```
GET /api/admin/reports/user-retention?startDate=2023-01-01&endDate=2024-03-31&timeFrame=quarterly&retentionType=quarterly&activityDefinition=any_activity&includeIncompleteCohorts=false
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "success": true,
    "data": [
      {
        "cohort": "Jan 2024",
        "week1": 42.5,
        "week2": 3.2,
        "week3": 1.1,
        "week4": 0.8
      },
      {
        "cohort": "Feb 2024", 
        "week1": 45.1,
        "week2": 2.9,
        "week3": 1.3,
        "week4": 0.6
      }
    ],
    "metadata": {
      "retentionType": "monthly",
      "activityDefinition": "transaction",
      "includeIncompleteCohorts": false,
      "totalCohorts": 2,
      "analysisType": "cohort_retention"
    }
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Invalid retentionType. Must be one of: monthly, payday, quarterly"
  }
}
```

## Business Context

### Why These Parameters Matter for Remittance Apps

1. **retentionType=monthly**: Most appropriate for remittance apps where users send money 1-2 times per month aligned with salary cycles.

2. **retentionType=payday**: Specifically designed for apps where user behavior follows bi-weekly or monthly payment schedules.

3. **retentionType=quarterly**: Useful for understanding seasonal patterns in remittance behavior (holidays, harvest seasons, etc.).

4. **activityDefinition=transaction**: Most meaningful for remittance apps where completed transactions indicate real engagement.

5. **includeIncompleteCohorts**: Helps analyze recent user behavior even when full retention cycles haven't completed.

## Implementation Notes

- Default values ensure backward compatibility with existing frontend implementations
- The `retentionType` parameter should override the standard weekly retention calculation
- When `retentionType=monthly`, the response should include 30-day, 60-day, 90-day, and 180-day retention rates instead of weekly rates
- The response format may need to be adjusted based on `retentionType` to return appropriate time periods

## Frontend Integration

The frontend Reports component includes these parameters in the filters object:
```typescript
const filters: ReportFilters = {
  startDate,
  endDate, 
  timeFrame,
  retentionType,           // 'monthly' | 'payday' | 'quarterly'
  activityDefinition,      // 'transaction' | 'login' | 'any_activity'
  includeIncompleteCohorts // boolean
};
``` 