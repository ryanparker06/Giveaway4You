const {
  SlashCommandBuilder,
  MessageFlags
} = require("discord.js");

const buildContainer = require("../utils/buildContainer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Learn how to use Giveaway4You"),

  async execute(interaction) {
    const content =
      `# ❓ Giveaway4You Help\n\n` +

      `Giveaway4You is our newly released giveaway bot, designed to make hosting giveaways simple and effortless.\n\n` +

      `##  Host Your First Giveaway\n` +
      
      `> **1.** Use \`/giveaway-start\` to create a new giveaway.\n` +
      `> **2.** Enter the prize, duration, number of winners, and channel.\n` +
      `> **3.** Members join by clicking the giveaway button.\n` +
      `> **4.** Winner(s) are chosen automatically when the giveaway ends.\n` +

      `## Free Plan Features\n` +

      `> ⏰ Giveaways Up to 24 Hours\n` +
      `> 👑 One Winner Per Giveaway\n` +
      `> 🎁 One Active Giveaway Per Server\n` +
      `> 🏁 End Giveaways Early\n` +
      `> ❌ Cancel Giveaways\n` +
      `> 🔄 Reroll Winners\n` +
      `> 🔫 Start Giveaway\n` +

      `## Premium Features\n` +

      `> 🆓 Includes Free Features\n` +
      `> ⏰ Unlimited Giveaway Durations\n` +
      `> 👑 Unlimited Winners Per Giveaway\n` +
      `> ♾️ Unlimited Active Giveaways\n` +
      `> 🏆 Automatically Add Role to Winner\n` +
      `> 📆 Giveaway Scheduler\n` +

      `## Redeeming Premium\n` +

      `> Use \`/premium-redeem\` and enter your Premium code.\n` +
      `> Premium activates instantly for your server.\n` +

      `## Giveaway4You Commands\n` +

      `> \`/giveaway-start\`\n` +
      `> \`/giveaway-end\`\n` +
      `> \`/giveaway-cancel\`\n` +
      `> \`/giveaway-reroll\`\n` +
      `> \`/premium-redeem\`\n` +
      `> \`/giveaway-schedule\` ⭐ Premium\n` +
      `> \`/winners-role\` ⭐ Premium\n` +
      `> \`/access-add\` ⭐ Premium\n` +
      `> \`/access-remove\` ⭐ Premium\n` +
      `> \`/bot-info\`\n` +
      `> \`/help\`\n\n` +

      `Thank you for using **Giveaway4You**! 🎉`;

    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: buildContainer(content)
    });
  }
};