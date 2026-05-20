// src/events/guildCreate.js
// Sends a styled notification to your log channel whenever Giveaway4You joins a new server.

const {
  EmbedBuilder,
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require("discord.js");

// Replace with your Giveaway4You log channel ID
const LOG_CHANNEL_ID = "1506437997376311389";

// Optional footer/banner image
const BANNER_URL =
  "https://cdn.discordapp.com/attachments/1328771755367600240/1337077311383535833/Bump4You_Footer_Banner_1.png";

module.exports = {
  name: "guildCreate",

  async execute(guild, client) {
    try {
      const logChannel = await client.channels
        .fetch(LOG_CHANNEL_ID)
        .catch(() => null);

      if (!logChannel || !logChannel.isTextBased()) return;

      // Try to fetch owner
      let ownerText = "Unknown";
      try {
        const owner = await guild.fetchOwner();
        ownerText = `${owner.user.tag} (${owner.id})`;
      } catch {
        ownerText = `Unknown (${guild.ownerId || "N/A"})`;
      }

      // Get server icon or fallback to bot avatar
      const iconURL =
        guild.iconURL({ size: 512, extension: "png" }) ||
        client.user.displayAvatarURL({ size: 512 });

      // Build the container (same style as your /bot-info command)
      const header = new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 🎉 Giveaway4You Added to a New Server`
          )
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(iconURL)
        );

      const details = new TextDisplayBuilder().setContent(
        `## Server Information\n\n` +
        `> **Server Name:** ${guild.name}\n` +
        `> **Server ID:** ${guild.id}\n` +
        `> **Member Count:** ${guild.memberCount.toLocaleString()}\n` +
        `> **Owner:** ${ownerText}\n` +
        `> **Shard:** #${guild.shardId ?? 0}\n\n` +
        `📈 Giveaway4You is now available in **${client.guilds.cache.size.toLocaleString()} servers!**`
      );

      const container = new ContainerBuilder()
        .addSectionComponents(header)
        .addTextDisplayComponents(details)
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Large)
            .setDivider(true)
        )
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(BANNER_URL)
          )
        );

      await logChannel.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
      });
    } catch (error) {
      console.error("Error in guildCreate event:", error);
    }
  }
};