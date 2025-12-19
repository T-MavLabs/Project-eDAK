# Prediction API Considerations for DAKSH Parcel Tracking

## Overview
This document outlines key considerations for building the API that generates/updates delivery delay predictions for the DAKSH Parcel Tracking system.

---

## 1. **API Endpoint Design**

### Endpoint Options:
- **POST `/api/v1/predictions/generate`** - Generate new prediction for a parcel
- **POST `/api/v1/predictions/update`** - Update existing prediction
- **GET `/api/v1/predictions/{tracking_id}`** - Get prediction for a parcel
- **POST `/api/v1/predictions/batch`** - Batch prediction generation

### Recommended Approach:
- **Primary**: `POST /api/v1/predictions/generate` (accepts `tracking_id` or `parcel_id`)
- **Secondary**: `GET /api/v1/predictions/{tracking_id}` (already partially covered by `parcel-track`)

---

## 2. **Input Parameters & Data Collection**

### Required Inputs:
```typescript
{
  tracking_id: string;  // or parcel_id
  // Optional: force_regenerate: boolean
}
```

### Data to Collect for Prediction Model:

#### A. **Parcel Context**
- `tracking_id` / `parcel_id`
- `origin_digipin` & `destination_digipin`
- `origin_region_code` & `destination_region_code`
- `current_hub_code` & `current_region_code`
- `status` (current parcel status)
- `expected_delivery_date`
- `created_at` (booking time)
- `current_time` (for calculating elapsed time)

#### B. **Historical Event Data**
- All `parcel_events` for this parcel:
  - Event timestamps
  - Hub transitions
  - Status changes
  - Time spent at each hub
  - Route progression
- Calculate:
  - Average transit time between hubs
  - Current delay vs. expected timeline
  - Number of hub transfers
  - Time since last event

#### C. **Hub & Route Analytics**
- Hub congestion metrics (from analytics):
  - Current parcel volume at `current_hub_code`
  - Average processing time at hub
  - Historical delay rates for this hub
- Route reliability:
  - Historical success rate for `origin_region_code` → `destination_region_code`
  - Average transit time for this route
  - Seasonal factors (festivals, weather patterns)

#### D. **External Factors** (to be stored in `risk_factors` JSONB)
- Weather conditions (if available):
  - Current weather at origin/destination/current hub
  - Forecasted weather for delivery window
- Regional factors:
  - Festival/holiday calendar
  - Known traffic patterns
  - Hub capacity constraints
- Historical patterns:
  - Similar parcel delivery times
  - Peak season indicators

---

## 3. **Prediction Model Output Structure**

### Database Schema (from `delivery_predictions` table):
```sql
{
  parcel_id: uuid,
  tracking_id: text,
  predicted_delay_hours: integer,      -- 0 or positive
  probability_score: numeric(5,4),    -- 0.0000 to 1.0000
  risk_factors: jsonb,                -- Structured risk data
  model_version: text,                 -- e.g., "v1.0", "v2.1"
  generated_at: timestamptz
}
```

### Frontend Expected Format (DelayPrediction):
```typescript
{
  estimatedDelayHours: number;        // Maps from predicted_delay_hours
  probabilityPercent: number;         // Maps from probability_score * 100
  etaWindow: string;                  // Calculated: "Dec 24 - Dec 26"
  riskFactors: DelayRiskFactor[];     // Parsed from risk_factors JSONB
  modelNote: string;                  // Generated summary text
}
```

### Risk Factors Structure (JSONB):
```json
{
  "factors": [
    {
      "label": "Weather" | "Hub Congestion" | "Route Diversion" | "Festival Load",
      "severity": "Low" | "Medium" | "High",
      "note": "Detailed explanation",
      "impact_hours": number,
      "confidence": number
    }
  ],
  "model_note": "System generated insight summary",
  "eta_window": "Dec 24 - Dec 26"
}
```

---

## 4. **Business Logic Considerations**

### A. **When to Generate Predictions**
- **On parcel creation** (initial prediction)
- **On status change** (re-evaluate when parcel moves)
- **On hub transfer** (update based on new hub context)
- **Scheduled refresh** (daily/hourly for active parcels)
- **Manual trigger** (admin/operator request)

### B. **Prediction Calculation Logic**
1. **Base Transit Time Calculation**:
   - Calculate expected time based on route distance
   - Factor in historical average for similar routes
   - Consider parcel type (Speed Post vs Regular)

2. **Delay Detection**:
   - Compare current progress vs. expected timeline
   - Calculate time spent at current hub vs. average
   - Identify bottlenecks in route

3. **Risk Factor Assessment**:
   - Hub congestion score (current volume / capacity)
   - Weather impact (if severe weather expected)
   - Route reliability (historical delay rate)
   - Seasonal factors (festival load, peak season)
   - Distance complexity (cross-region vs. intra-region)

4. **Probability Score**:
   - Weighted combination of risk factors
   - Historical accuracy of similar predictions
   - Confidence in data quality
   - Formula: `probability = f(risk_factors, historical_accuracy, data_quality)`

5. **ETA Window Calculation**:
   - Base delivery date + predicted delay
   - Add buffer based on probability score
   - Format: "Dec 24 - Dec 26" or "Dec 24 ± 1 day"

### C. **Model Versioning**
- Track `model_version` for:
  - A/B testing different algorithms
  - Rollback capability
  - Performance monitoring
  - Format: "v{major}.{minor}" (e.g., "v1.0", "v2.1")

---

## 5. **Performance & Scalability**

### A. **Caching Strategy**
- Cache predictions for a minimum TTL (e.g., 1 hour)
- Invalidate cache on:
  - Parcel status change
  - New event added
  - Hub transfer
- Use Redis/cache layer for frequently accessed predictions

### B. **Batch Processing**
- Support batch prediction generation for multiple parcels
- Use queue system (e.g., Bull, BullMQ) for async processing
- Prioritize:
  1. Active parcels (in_transit, at_hub, out_for_delivery)
  2. Parcels near delivery date
  3. Parcels with high customer engagement

### C. **Database Optimization**
- Indexes already exist on:
  - `tracking_id, generated_at DESC`
  - `parcel_id, generated_at DESC`
- Consider materialized views for hub analytics
- Use connection pooling for high concurrency

---

## 6. **Error Handling & Edge Cases**

### A. **Missing Data Scenarios**
- No historical events → Use route averages
- Missing hub analytics → Default to medium risk
- No weather data → Skip weather factor
- Parcel already delivered → Return null or final summary

### B. **Invalid States**
- Parcel not found → 404
- Parcel cancelled/returned → Skip prediction or mark as N/A
- Invalid tracking_id format → 400 Bad Request

### C. **Model Failures**
- If prediction generation fails → Return graceful error
- Log failures for model improvement
- Fallback to simple heuristic (e.g., average delay for route)

---

## 7. **Security & Access Control**

### A. **Authentication**
- Require JWT authentication
- Use existing auth context from `getAuthContext()`

### B. **Authorization**
- **Customers**: Can only generate/view predictions for their own parcels
- **Delivery Agents**: Can view predictions for parcels at their hub
- **Regional Admins**: Can view predictions for parcels in their region
- **Post Admins**: Full access to all predictions

### C. **Rate Limiting**
- Limit prediction generation requests per user/IP
- Prevent abuse of expensive model computations
- Suggested: 10 requests/minute per user

---

## 8. **Integration Points**

### A. **Existing APIs**
- **`parcel-track`**: Already fetches predictions (read-only)
- **`parcel-events`**: Should trigger prediction refresh on status change
- **Analytics APIs**: Need to query hub/route metrics

### B. **External Services** (if applicable)
- Weather API (optional)
- Traffic/route optimization services
- ML model service (if separate microservice)

### C. **Database Queries**
- Query `parcels` table for parcel context
- Query `parcel_events` for timeline
- Query `delivery_analytics` (if exists) for hub metrics
- Insert/update `delivery_predictions` table

---

## 9. **Response Format**

### Success Response:
```json
{
  "success": true,
  "prediction": {
    "id": "uuid",
    "parcel_id": "uuid",
    "tracking_id": "IP-XXXXXX",
    "predicted_delay_hours": 12,
    "probability_score": 0.75,
    "risk_factors": {
      "factors": [
        {
          "label": "Hub Congestion",
          "severity": "High",
          "note": "Current hub processing 150% of normal capacity",
          "impact_hours": 8,
          "confidence": 0.85
        },
        {
          "label": "Route Diversion",
          "severity": "Medium",
          "note": "Alternative route due to road closure",
          "impact_hours": 4,
          "confidence": 0.70
        }
      ],
      "model_note": "High congestion at current hub and route diversion expected to cause 12-hour delay with 75% confidence.",
      "eta_window": "Dec 25 - Dec 27"
    },
    "model_version": "v1.0",
    "generated_at": "2025-12-24T10:30:00Z"
  },
  "metadata": {
    "computation_time_ms": 245,
    "data_sources": ["parcel_events", "hub_analytics", "route_history"]
  }
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Parcel not found",
  "code": "PARCEL_NOT_FOUND",
  "tracking_id": "IP-XXXXXX"
}
```

---

## 10. **Testing Considerations**

### A. **Unit Tests**
- Test prediction calculation logic
- Test risk factor aggregation
- Test probability score calculation
- Test ETA window formatting

### B. **Integration Tests**
- Test API endpoint with real database
- Test authorization rules
- Test error handling
- Test batch processing

### C. **Edge Case Tests**
- Parcel with no events
- Parcel already delivered
- Parcel with missing hub data
- Very long routes (cross-country)
- Very short routes (same city)

---

## 11. **Monitoring & Observability**

### A. **Metrics to Track**
- Prediction generation latency
- Prediction accuracy (actual delay vs. predicted)
- API request rate
- Error rate
- Cache hit rate
- Model version performance

### B. **Logging**
- Log all prediction generations
- Log model inputs for debugging
- Log prediction accuracy for model improvement
- Log errors with context

### C. **Alerts**
- High error rate (> 5%)
- Slow response times (> 1 second)
- Model accuracy degradation
- Cache miss rate spikes

---

## 12. **Future Enhancements**

### A. **Model Improvements**
- Machine learning model integration
- Real-time weather data integration
- Traffic pattern analysis
- Customer behavior patterns

### B. **Features**
- Prediction confidence intervals
- Multiple prediction scenarios (best/worst case)
- Prediction history/versioning
- A/B testing framework for models

### C. **Optimization**
- Pre-compute predictions for active parcels
- Use ML model caching
- Optimize database queries
- Implement prediction streaming for real-time updates

---

## 13. **API Implementation Checklist**

- [ ] Define endpoint route and method
- [ ] Implement authentication/authorization
- [ ] Collect parcel context data
- [ ] Query historical events
- [ ] Fetch hub/route analytics
- [ ] Implement prediction calculation logic
- [ ] Format risk factors as JSONB
- [ ] Calculate probability score
- [ ] Generate ETA window string
- [ ] Create model note/summary
- [ ] Insert/update delivery_predictions table
- [ ] Return formatted response
- [ ] Add error handling
- [ ] Add rate limiting
- [ ] Add logging
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Add API documentation
- [ ] Set up monitoring

---

## Summary

The prediction API should:
1. **Collect comprehensive data** about the parcel, its journey, and contextual factors
2. **Calculate delays** based on current progress vs. expected timeline
3. **Assess risk factors** from multiple sources (hub congestion, weather, routes, etc.)
4. **Generate probability scores** with confidence levels
5. **Format output** to match frontend expectations
6. **Handle edge cases** gracefully
7. **Scale efficiently** with caching and batch processing
8. **Maintain security** with proper auth/authorization
9. **Monitor performance** for continuous improvement

The key is balancing **accuracy** (using rich data) with **performance** (caching, optimization) and **reliability** (error handling, fallbacks).
