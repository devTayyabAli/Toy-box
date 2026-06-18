/**
 * Display name for emails — prefers first + last, then name, then handle.
 */
function formatMemberDisplayName(member) {
  if (!member) return null;

  const first = String(member.firstName || "").trim();
  const last = String(member.lastName || "").trim();
  const full = [first, last].filter(Boolean).join(" ");
  if (full) return full;

  const name = String(member.name || "").trim();
  if (name && !/^string\d/i.test(name)) return name;

  const handle = String(member.displayHandle || "").trim();
  if (handle) return handle.replace(/^@/, "");

  return null;
}

module.exports = { formatMemberDisplayName };
