module.exports = function parseDuration(input) {
  const match = String(input).trim().toLowerCase().match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return n * { s:1000, m:60000, h:3600000, d:86400000 }[match[2]];
};
