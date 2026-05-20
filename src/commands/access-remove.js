const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");

const isPremium = require("../utils/isPremium");
const GuildSettings = require("../models/GuildSettings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("access-remove")
    .setDescription(
      "Remove a role or user allowed to host giveaways"
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription(
          "Role to remove from giveaway access"
        )
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription(
          "User to remove from giveaway access"
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    // Premium-only command
    const premium = await isPremium(
      interaction.guild.id
    );

    if (!premium) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "⭐ Custom giveaway access is a Premium feature."
      });
    }

    const role =
      interaction.options.getRole("role");
    const user =
      interaction.options.getUser("user");

    if (!role && !user) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "❌ You must provide either a role or a user."
      });
    }

    const settings =
      await GuildSettings.findOne({
        guildId: interaction.guild.id
      });

    if (!settings) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "❌ No custom giveaway access has been set."
      });
    }

    const removed = [];

    // Remove role if it matches the currently stored role
    if (
      role &&
      settings.giveawayAccessRoleId === role.id
    ) {
      settings.giveawayAccessRoleId = null;
      removed.push(`${role}`);
    }

    // Remove user if it matches the currently stored user
    if (
      user &&
      settings.giveawayAccessUserId === user.id
    ) {
      settings.giveawayAccessUserId = null;
      removed.push(`${user}`);
    }

    // Nothing matched the stored access settings
    if (removed.length === 0) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "❌ The specified role or user does not currently have giveaway access."
      });
    }

    await settings.save();

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content:
        `✅ Giveaway access removed successfully.\n` +
        `Removed: ${removed.join(" and ")}`
    });
  }
};