const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");

const Giveaway = require("../models/Giveaway");
const GuildSettings = require("../models/GuildSettings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway-reroll")
    .setDescription("Reroll the winner(s) of an ended giveaway")

    // Make the command visible to everyone in the server.
    // Custom permission checks below decide who can use it.
    .setDMPermission(false)

    .addStringOption((option) =>
      option
        .setName("message_id")
        .setDescription(
          "The message ID of the giveaway to reroll"
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    // ==========================================
    // GIVEAWAY ACCESS CHECK
    // ==========================================
    const member = interaction.member;

    // Administrators can always manage giveaways
    const isAdministrator =
      member.permissions.has(
        PermissionFlagsBits.Administrator
      );

    if (!isAdministrator) {
      const settings =
        await GuildSettings.findOne({
          guildId: interaction.guild.id
        });

      let hasAccess = false;

      // Specific allowed user
      if (
        settings?.giveawayAccessUserId ===
        interaction.user.id
      ) {
        hasAccess = true;
      }

      // Allowed role
      if (
        settings?.giveawayAccessRoleId &&
        member.roles.cache.has(
          settings.giveawayAccessRoleId
        )
      ) {
        hasAccess = true;
      }

      // No permission
      if (!hasAccess) {
        return interaction.reply({
          flags: MessageFlags.Ephemeral,
          content:
            "❌ Only server administrators or users granted giveaway access can reroll giveaways."
        });
      }
    }

    // ==========================================
    // GET OPTIONS
    // ==========================================
    const messageId =
      interaction.options.getString(
        "message_id"
      );

    // ==========================================
    // FIND GIVEAWAY
    // ==========================================
    const giveaway =
      await Giveaway.findOne({
        messageId: String(messageId)
      });

    if (!giveaway) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: "❌ Giveaway not found."
      });
    }

    // Giveaway must already be ended
    if (!giveaway.ended) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "❌ This giveaway must be ended before it can be rerolled."
      });
    }

    // Normalize entries
    if (!Array.isArray(giveaway.entries)) {
      giveaway.entries = [];
    }

    if (giveaway.entries.length === 0) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "❌ There are no valid entries to reroll."
      });
    }

    // ==========================================
    // SELECT NEW WINNERS
    // ==========================================
    const shuffled =
      [...giveaway.entries].sort(
        () => Math.random() - 0.5
      );

    const winnerCount =
      giveaway.winnerCount ||
      giveaway.winners ||
      1;

    const winners =
      shuffled.slice(0, winnerCount);

    // Save rerolled winners
    giveaway.winnerIds = [...winners];

    // Allow a new announcement if rerolled
    giveaway.announcementSent = false;

    await giveaway.save();

    const winnerMentions =
      winners
        .map((id) => `<@${id}>`)
        .join(", ");

    // ==========================================
    // ANNOUNCE NEW WINNERS
    // ==========================================
    const channel =
      await interaction.client.channels
        .fetch(giveaway.channelId)
        .catch(() => null);

    if (channel) {
      await channel.send({
        content:
          `🔄 Giveaway rerolled!\n\n` +
          `🎉 New winner(s): ${winnerMentions}\n` +
          `Prize: **${giveaway.prize}**\n` +
          `Hosted by: <@${giveaway.hostedBy}>`
      });
    }

    // ==========================================
    // CONFIRM SUCCESS
    // ==========================================
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content:
        `🔄 Giveaway rerolled successfully.\n` +
        `New winner(s): ${winnerMentions}`
    });
  }
};
