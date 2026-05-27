/**
 * Upgraded Pit Wall Telemetry Query Language (PW-TQL) Parser
 * Converts YAML-style query blocks into MongoDB filter and projection parameters.
 */
function parseTelemetryQuery(qStr) {
  if (!qStr || typeof qStr !== "string") return { filter: {}, projection: {} };

  const lines = qStr.split("\n");
  const filter = {};
  const projection = {};
  const orFilters = [];
  
  let currentBlock = "find"; // "find" | "select" | "or"
  const severityOrder = ["info", "warning", "critical"];

  const parseLineFilter = (line, targetFilter) => {
    // Support operators: >=, <=, !=, =, >, <
    const match = line.match(/^([a-zA-Z_]+)\s*([>=<!]+|=)\s*(.+)$/);
    if (!match) return;

    const [, key, op, rawVal] = match;
    let val = rawVal.trim().replace(/^['"]|['"]$/g, ""); // strip quotes

    let queryKey = key;
    let queryVal = val;

    // Normalizations
    if (key === "corner") {
      queryKey = "cornerNumber";
      queryVal = parseInt(val.replace(/[tT]/g, ""), 10);
    } else if (key === "lap") {
      queryKey = "lapNumber";
      queryVal = parseInt(val, 10);
    }

    // Date parsing
    if (key === "timestamp" && !isNaN(Date.parse(queryVal))) {
      queryVal = new Date(queryVal);
    }

    const setOperatorValue = (target, k, opKey, v) => {
      if (typeof target[k] === "object" && target[k] !== null && !(target[k] instanceof Date) && !Array.isArray(target[k])) {
        target[k][opKey] = v;
      } else {
        target[k] = { [opKey]: v };
      }
    };

    if (op === "=") {
      targetFilter[queryKey] = isNaN(queryVal) || queryVal === "" || queryVal instanceof Date ? queryVal : Number(queryVal);
    } else if (op === "!=") {
      setOperatorValue(targetFilter, queryKey, "$ne", isNaN(queryVal) || queryVal === "" || queryVal instanceof Date ? queryVal : Number(queryVal));
    } else if (op === ">=") {
      if (queryKey === "severity") {
        const idx = severityOrder.indexOf(queryVal.toLowerCase());
        if (idx !== -1) targetFilter[queryKey] = { $in: severityOrder.slice(idx) };
      } else {
        setOperatorValue(targetFilter, queryKey, "$gte", queryKey === "timestamp" ? queryVal : Number(queryVal));
      }
    } else if (op === "<=") {
      if (queryKey === "severity") {
        const idx = severityOrder.indexOf(queryVal.toLowerCase());
        if (idx !== -1) targetFilter[queryKey] = { $in: severityOrder.slice(0, idx + 1) };
      } else {
        setOperatorValue(targetFilter, queryKey, "$lte", queryKey === "timestamp" ? queryVal : Number(queryVal));
      }
    } else if (op === ">") {
      setOperatorValue(targetFilter, queryKey, "$gt", queryKey === "timestamp" ? queryVal : Number(queryVal));
    } else if (op === "<") {
      setOperatorValue(targetFilter, queryKey, "$lt", queryKey === "timestamp" ? queryVal : Number(queryVal));
    }
  };

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;

    const lowerLine = line.toLowerCase();
    if (lowerLine === "find:") {
      currentBlock = "find";
      continue;
    } else if (lowerLine === "select:") {
      currentBlock = "select";
      continue;
    } else if (lowerLine === "or:") {
      currentBlock = "or";
      continue;
    }

    if (currentBlock === "select") {
      // Field selection list
      const field = line.replace(/^-?\s*/, "").trim();
      if (field) projection[field] = 1;
    } else if (currentBlock === "find") {
      parseLineFilter(line, filter);
    } else if (currentBlock === "or") {
      const orFilter = {};
      parseLineFilter(line, orFilter);
      if (Object.keys(orFilter).length > 0) {
        orFilters.push(orFilter);
      }
    }
  }

  if (orFilters.length > 0) {
    filter["$or"] = orFilters;
  }

  return { filter, projection };
}

module.exports = { parseTelemetryQuery };
