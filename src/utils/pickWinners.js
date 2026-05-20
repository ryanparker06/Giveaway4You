module.exports = function pickWinners(entries, count) {
  const unique = [...new Set(entries)];
  return unique.sort(() => Math.random() - 0.5).slice(0, Math.min(count, unique.length));
};
