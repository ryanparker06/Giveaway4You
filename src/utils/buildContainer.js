const config = require("../config");

/**
 * Builds a Components V2 container with:
 * - Text content
 * - Optional buttons
 * - Large separator
 * - Configurable image from config.giveaway.imageUrl
 */
module.exports = function buildContainer(
  content,
  buttons = null
) {
  const components = [
    {
      type: 10, // Text Display
      content
    }
  ];

  // Add buttons if provided
  if (buttons && buttons.length > 0) {
    components.push({
      type: 1, // Action Row
      components: buttons
    });
  }

  // Large separator
  components.push({
    type: 14, // Separator
    divider: true,
    spacing: 2
  });

  // Add image from config
  if (
    config.giveaway &&
    config.giveaway.imageUrl &&
    config.giveaway.imageUrl.trim() !== ""
  ) {
    components.push({
      type: 12, // Media Gallery
      items: [
        {
          media: {
            url: config.giveaway.imageUrl
          }
        }
      ]
    });
  }

  return [
    {
      type: 17, // Container
      components
    }
  ];
};