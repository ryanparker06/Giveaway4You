const {
  SlashCommandBuilder,
  MessageFlags
} = require("discord.js");

const buildContainer = require("../utils/buildContainer");
const isPremium = require("../utils/isPremium");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot-info")
    .setDescription("View information about Giveaway4You"),

  async execute(interaction) {
    const client = interaction.client;

    // Check whether this server has Premium
    const premium = await isPremium(
      interaction.guild.id
    );

    const premiumStatus = premium
      ? "Active"
      : "Not Active";

    // Statistics
    const totalServers = client.guilds.cache.size;

    const totalMembers = client.guilds.cache.reduce(
      (sum, guild) => sum + (guild.memberCount || 0),
      0
    );

    const latency = Math.round(client.ws.ping);

    // Format uptime
    const uptimeMs = client.uptime || 0;

    const days = Math.floor(
      uptimeMs / (1000 * 60 * 60 * 24)
    );
    const hours = Math.floor(
      (uptimeMs / (1000 * 60 * 60)) % 24
    );
    const minutes = Math.floor(
      (uptimeMs / (1000 * 60)) % 60
    );

    const uptimeParts = [];

    if (days > 0) uptimeParts.push(`${days}d`);
    if (hours > 0) uptimeParts.push(`${hours}h`);
    if (minutes > 0 || uptimeParts.length === 0) {
      uptimeParts.push(`${minutes}m`);
    }

    const uptime = uptimeParts.join(" ");

    const content =
      `# 📁 Giveaway4You's Information & Statistics\n\n` +
      `View information and live statistics for Giveaway4You, along with useful details about the bot and its premium features.\n\n` +

      `> **Name:** ${client.user.username}\n` +
      `> **ID:** ${client.user.id}\n` +
      `> **Latency:** ${latency}ms\n` +
      `> **Commands:** Slash Commands (/)\n` +
      `> **Developer:** Ryan & OMJO\n\n` +

      `> **Servers:** ${totalServers.toLocaleString()}\n` +
      `> **Members:** ${totalMembers.toLocaleString()}\n` +
      `> **Uptime:** ${uptime}\n` +
      `> **Premium:** ${premiumStatus}\n\n` +

      `Thank you for using **Giveaway4You**! 🎉`;

    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: buildContainer(content)
    });
  }
};