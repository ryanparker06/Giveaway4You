const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");

const isPremium = require("../utils/isPremium");
const GuildSettings = require("../models/GuildSettings");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("winners-role")
    .setDescription(
      "Set a role to automatically give giveaway winners"
    )
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription(
          "The role to give to giveaway winners"
        )
        .setRequired(true)
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
          "⭐ Automatically assigning a winners role is a Premium feature."
      });
    }

    // Get selected role
    const role = interaction.options.getRole("role");

    /**
     * IMPORTANT FIX:
     * Save to `winnerRoleId` (singular), not `winnersRoleId`.
     *
     * Your endGiveaway.js looks for:
     * settings?.winnerRoleId
     */
    const settings =
      await GuildSettings.findOneAndUpdate(
        {
          guildId: interaction.guild.id
        },
        {
          guildId: interaction.guild.id,
          winnerRoleId: role.id
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

    // Debug log so you can verify it saved correctly
    console.log(
      `🏆 Saved winner role for guild ${interaction.guild.id}:`,
      settings.winnerRoleId
    );

    // Confirm to the command user
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content:
        `🏆 Winners role set to ${role}.\n\n` +
        `Future giveaway winners will automatically receive this role.`
    });
  }
};
