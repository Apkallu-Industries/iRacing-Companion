/**
 * queryPlanner.js — Indexed Telemetry Query Engine Planner
 *
 * Intercepts, plans, and optimizes database queries. Prevents pathological database
 * scans by injecting mandatory index keys, capping limits, and shaping projections.
 */

class QueryPlanner {
  constructor() {
    this.defaultLimit = 100;
    this.maxLimit = 1000;
  }

  /**
   * Plans and optimizes a raw parsed query
   * @param {object} parsedQuery { filter, projection } from query-parser
   * @param {string} defaultSessionId fallback session ID to bind if missing
   * @returns {object} { filter, projection, limit, hint } planned parameters
   */
  plan(parsedQuery, defaultSessionId = null) {
    const filter = { ...parsedQuery.filter };
    let projection = { ...parsedQuery.projection };

    // 1. Enforce session_id index scope to prevent full-table scans
    if (!filter.session_id && defaultSessionId) {
      const { ObjectId } = require("mongodb");
      filter.session_id = ObjectId.isValid(defaultSessionId)
        ? new ObjectId(defaultSessionId)
        : defaultSessionId;
    }

    // 2. Automatically inject projection constraints if empty
    // Prevents sending massive raw JSON frame payloads when only summary info is required.
    if (Object.keys(projection).length === 0) {
      projection = {
        session_id: 1,
        timestamp: 1,
        lap_number: 1,
        "channels.speedKph": 1,
        "channels.rpm": 1,
        "channels.gear": 1,
        "channels.throttle": 1,
        "channels.brake": 1,
        severity: 1,
        classification: 1,
        label: 1,
        description: 1
      };
    }

    // 3. Prevent pathological unbounded scans by enforcing limits
    const limit = filter.limit ? Math.min(parseInt(filter.limit, 10), this.maxLimit) : this.defaultLimit;
    delete filter.limit; // Clean up limit parameter from mongo filter object

    // 4. Determine optimal Index Hint matching created indices
    let hint = null;
    if (filter.car_number && filter.timestamp) {
      hint = { car_number: 1, timestamp: 1 };
    } else if (filter.session_id && filter.lap_number) {
      hint = { session_id: 1, lap_number: 1 };
    } else if (filter.session_id) {
      hint = { session_id: 1 };
    }

    return {
      filter,
      projection,
      limit,
      hint
    };
  }
}

module.exports = new QueryPlanner();
