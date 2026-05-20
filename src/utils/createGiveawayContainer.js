const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder
} = require("discord.js");

const config = require("../config");
const CustomBot = require("../models/CustomBot");

/**
 * Creates a Components V2 container using Discord builders.
 *
 * Features:
 * - Title displayed as a Markdown H1 heading
 * - Real Discord Separator component directly under the title
 * - Content displayed below the separator
 * - Optional hosted-by text
 * - Supports custom server branding (/custom-bot)
 * - Falls back to config.giveaway.imageUrl
 * - No accent color strip
 *
 * Usage:
 *   await createContainer({
 *     title: "Giveaway Started",
 *     content: "Prize: Discord Nitro",
 *     hostTag: "@Ryan",
 *     guildId: interaction.guild.id
 *   });
 */
module.exports = async function createContainer({
  title,
  content,
  hostTag,
  guildId = null
}) {
  // Title shown at the top
  const titleText = `# ${title}`;

  // Main body content
  let bodyText = content;

  // Optional hosted-by text
  if (
    hostTag &&
    config.giveaway &&
    config.giveaway.hostedByText
  ) {
    bodyText += `\n\n*${config.giveaway.hostedByText.replace(
      "{tag}",
      hostTag
    )}*`;
  }

  // Create container and remove accent color strip
  const container = new ContainerBuilder()
    .setAccentColor(0x00000000);

  // Title
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(titleText)
  );

  // Large separator directly under the title
  container.addSeparatorComponents(
    new SeparatorBuilder()
      .setSpacing(
        SeparatorSpacingSize.Large
      )
      .setDivider(true)
  );

  // Main body content
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      bodyText
    )
  );

  // ==========================================
  // Determine banner image
  // Priority:
  // 1. Custom server banner
  // 2. Default config banner
  // ==========================================
  let imageUrl = null;

  // Try custom server branding first
  if (guildId) {
    try {
      const customBot =
        await CustomBot.findOne({
          guildId: String(guildId)
        });

      if (
        customBot &&
        customBot.customBanner &&
        customBot.customBanner.trim() !== ""
      ) {
        imageUrl =
          customBot.customBanner;
      }
    } catch (error) {
      console.error(
        "Failed to load custom bot branding:",
        error
      );
    }
  }

  // Fall back to default banner from config.js
  if (
    !imageUrl &&
    config.giveaway &&
    config.giveaway.imageUrl &&
    config.giveaway.imageUrl.trim() !== ""
  ) {
    imageUrl =
      config.giveaway.imageUrl;
  }

  // ==========================================
  // Add optional banner image
  // ==========================================
  if (imageUrl) {
    // Separator above banner image
    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(
          SeparatorSpacingSize.Large
        )
        .setDivider(true)
    );

    // Banner image
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(
          imageUrl
        )
      )
    );
  }

  return container;
};
