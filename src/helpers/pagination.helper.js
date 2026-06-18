/**
 * @param {number} page 1-based
 * @param {number} limit
 * @returns {{ offset: number, limit: number }}
 */
function getPagination(page = 1, limit = 20) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 20));
  return { offset: (p - 1) * l, limit: l, page: p };
}

module.exports = { getPagination };
