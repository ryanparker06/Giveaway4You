const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const config = require("../config");

module.exports = function createGiveawayButton(isEntered = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(isEntered ? "giveaway_exit" : "giveaway_enter")
      .setLabel(
        isEntered
          ? config.giveaway.exitButtonLabel
          : config.giveaway.enterButtonLabel
      )
      .setEmoji(
        isEntered
          ? config.giveaway.exitButtonEmoji
          : config.giveaway.enterButtonEmoji
      )
      .setStyle(isEntered ? ButtonStyle.Danger : ButtonStyle.Success)
  );
};
