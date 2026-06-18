/**
 * Recursively replace `null` / `undefined` with "" for JSON API responses.
 * Numbers, booleans, and non-empty strings are unchanged.
 */
function nullToEmpty(value) {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value !== "object") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(nullToEmpty);
  }
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    out[key] = nullToEmpty(child);
  }
  return out;
}

module.exports = { nullToEmpty };
