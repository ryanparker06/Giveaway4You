const PremiumCode = require("../models/PremiumCode");
const GuildPremium = require("../models/GuildPremium");

module.exports = {
  data: {
    name: "premium-redeem",
    description: "Redeem a premium code",
    options: [
      {
        name: "code",
        description: "Premium code",
        type: 3, // STRING
        required: true
      }
    ]
  },

  async execute(interaction) {
    // Premium codes can only be redeemed in servers
    if (!interaction.guild) {
      return interaction.reply({
        content:
          "❌ Premium codes can only be redeemed in a server.",
        ephemeral: true
      });
    }

    // Normalize the code
    const code = interaction.options
      .getString("code")
      .trim()
      .toUpperCase();

    // Find the premium code
    const record =
      await PremiumCode.findOne({ code });

    // Code does not exist
    if (!record) {
      return interaction.reply({
        content:
          "❌ Invalid premium code.",
        ephemeral: true
      });
    }

    // Code has already been redeemed
    if (record.used) {
      return interaction.reply({
        content:
          "❌ This premium code has already been used.",
        ephemeral: true
      });
    }

    // Mark the code as redeemed
    record.used = true;
    record.usedByGuildId =
      interaction.guild.id;
    record.usedByUserId =
      interaction.user.id;
    record.usedAt = new Date();

    // Save the updated code record
    await record.save();

    // Activate Premium for this guild
    await GuildPremium.findOneAndUpdate(
      {
        guildId:
          interaction.guild.id
      },
      {
        guildId:
          interaction.guild.id,

        // Who redeemed the code
        activatedBy:
          interaction.user.id,

        // Which code was used
        code,

        // Premium status
        active: true,
        activatedAt: new Date(),

        // Subscription expiration data
        expiresAt:
          record.expiresAt ||
          null,
        currentPeriodEnd:
          record.currentPeriodEnd ||
          null,

        // Stripe metadata
        stripeCustomerId:
          record.stripeCustomerId ||
          null,
        stripeSubscriptionId:
          record.stripeSubscriptionId ||
          null,

        // Cancellation status
        cancelled:
          record.cancelled ||
          false
      },
      {
        upsert: true,
        new: true
      }
    );

    // Confirm success
    await interaction.reply({
      content:
        "✅ Premium activated successfully!\n" +
        "Your server now has access to all Premium features.",
      ephemeral: true
    });
  }
};