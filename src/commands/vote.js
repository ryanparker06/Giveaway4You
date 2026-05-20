const {
  SlashCommandBuilder,
  MessageFlags
} = require("discord.js");

const buildContainer = require("../utils/buildContainer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vote")
    .setDescription(
      "Vote for Giveaway4You and receive 24 hours of Premium."
    ),

  async execute(interaction) {
    const content =
      `# 🗳️ Vote for Giveaway4You\n\n` +
      `Support Giveaway4You by voting for us on top.gg and receive **24 hours of Premium** for your server completely free!\n\n` +

      `> **Reward:** 24 Hours of Premium\n` +
      `> **How to Claim:** Vote on top.gg, then run \`/claim-vote\`\n` +
      `> **Premium Includes:** Unlimited giveaway durations, unlimited winners, giveaway scheduling, and more.\n\n` +

      `## ⭐ Premium Features\n\n` +
      `> ⏰ Unlimited Giveaway Durations\n` +
      `> 👑 Unlimited Winners Per Giveaway\n` +
      `> ♾️ Unlimited Active Giveaways\n` +
      `> 🏆 Automatically Add Roles to Winners\n` +
      `> 📆 Giveaway Scheduler\n\n` +

      `## 🔗 Important Links\n\n` +
      `> **Vote for Giveaway4You:** https://top.gg/bot/1503692598395797575/vote\n` +
      `> **Invite Giveaway4You:** https://discord.com/oauth2/authorize?client_id=1503692598395797575\n` +
      `> **Support Server:** https://discord.gg/knakjfmdCn\n` +
      `> **Website:** https://v0-giveaway4you-website-design.vercel.app/#setup\n\n` +

      `Thank you for supporting **Giveaway4You**! 🎉`;

    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: buildContainer(content),
      ephemeral: true
    });
  }
};