const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");

const Giveaway = require("../models/Giveaway");
const GuildSettings = require("../models/GuildSettings");
const endGiveaway = require("../utils/endGiveaway");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway-end")
    .setDescription("End an active giveaway early")

    // Make the command visible to everyone in the server.
    // Custom permission checks below decide who can use it.
    .setDMPermission(false)

    .addStringOption((option) =>
      option
        .setName("message_id")
        .setDescription(
          "The message ID of the giveaway to end"
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
            "❌ Only server administrators or users granted giveaway access can end giveaways."
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

    // ==========================================
    // CHECK IF ALREADY ENDED
    // ==========================================
    if (giveaway.ended) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "⚠️ This giveaway has already ended."
      });
    }

    // ==========================================
    // END GIVEAWAY
    // ==========================================
    await endGiveaway(
      interaction.client,
      giveaway,
      false
    );

    // ==========================================
    // CONFIRM SUCCESS
    // ==========================================
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content:
        "🏁 Giveaway ended successfully."
    });
  }
};