const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");

const isPremium = require("../utils/isPremium");
const GuildSettings = require("../models/GuildSettings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("access-add")
    .setDescription(
      "Set a role or user allowed to host giveaways"
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription(
          "Role allowed to host giveaways"
        )
        .setRequired(false)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription(
          "User allowed to host giveaways"
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

    await GuildSettings.findOneAndUpdate(
      {
        guildId: interaction.guild.id
      },
      {
        guildId: interaction.guild.id,
        giveawayAccessRoleId: role
          ? role.id
          : null,
        giveawayAccessUserId: user
          ? user.id
          : null
      },
      {
        upsert: true,
        new: true
      }
    );

    const allowed = [];

    if (role) {
      allowed.push(`${role}`);
    }

    if (user) {
      allowed.push(`${user}`);
    }

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content:
        `✅ Giveaway access updated successfully.\n` +
        `Allowed to host giveaways: ${allowed.join(
          " and "
        )}`
    });
  }
};