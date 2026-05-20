const createContainer = require("./createContainer");

module.exports = function createInfoContainer({
  title,
  content,
  hostTag
}) {
  return createContainer({
    title,
    content,
    hostTag
  });
};