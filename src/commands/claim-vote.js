const { SlashCommandBuilder } = require("discord.js");
const { Api } = require("@top-gg/sdk");
const GuildPremium = require("../models/GuildPremium");

const topgg = new Api(process.env.TOPGG_TOKEN);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim-vote")
    .setDescription(
      "Claim 24 hours of Premium for this server after voting on top.gg."
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Check whether the user voted in the last 12 hours
      const hasVoted = await topgg.hasVoted(interaction.user.id);

      if (!hasVoted) {
        return interaction.editReply({
          content:
            `❌ You have not voted recently.\n\n` +
            `🗳️ Vote here to receive 24 hours of Premium:\n` +
            `https://top.gg/bot/1503692598395797575/vote`
        });
      }

      // Premium expiration: 24 hours from now
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );

      // Create or update premium for this guild
      await GuildPremium.findOneAndUpdate(
        {
          guildId: interaction.guild.id
        },
        {
          guildId: interaction.guild.id,
          activatedBy: interaction.user.id,
          active: true,
          activatedAt: new Date(),
          expiresAt,
          notes: "Granted via top.gg vote"
        },
        {
          upsert: true,
          new: true
        }
      );

      return interaction.editReply({
        content:
          `🎉 Thanks for voting!\n\n` +
          `⭐ This server now has **Premium for 24 hours**.\n` +
          `⏰ Premium expires: <t:${Math.floor(
            expiresAt.getTime() / 1000
          )}:F>`
      });
    } catch (error) {
      console.error("Error claiming vote reward:", error);

      return interaction.editReply({
        content:
          "❌ An error occurred while checking your vote."
      });
    }
  }
};