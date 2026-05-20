const GuildPremium = require("../models/GuildPremium");
const config = require("../config");

module.exports = {
  data: {
    name: "premium-remove",
    description: "Remove premium for a server",
    options: [{
      name: "server_id",
      description: "Discord server ID",
      type: 3,
      required: true
    }]
  },

  async execute(interaction) {
    if (!config.owners.includes(interaction.user.id)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true
      });
    }

    const serverId = interaction.options.getString("server_id");

    if ("remove" === "add") {
      await GuildPremium.findOneAndUpdate(
        { guildId: serverId },
        {
          guildId: serverId,
          activatedBy: interaction.user.id,
          code: "MANUAL-GRANT",
          activatedAt: new Date()
        },
        { upsert: true }
      );
      return interaction.reply({
        content: `Premium added to server ID ${serverId}.`,
        ephemeral: true
      });
    }

    const existing = await GuildPremium.findOne({ guildId: serverId });
    if (!existing) {
      return interaction.reply({
        content: "That server does not currently have premium.",
        ephemeral: true
      });
    }

    await GuildPremium.deleteOne({ guildId: serverId });
    return interaction.reply({
      content: `Premium removed from server ID ${serverId}.`,
      ephemeral: true
    });
  }
};
