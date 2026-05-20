const createGiveawayEmbed = require("./createGiveawayEmbed");
const createGiveawayButton = require("./createGiveawayButton");

module.exports = async function updateGiveawayMessage(message, giveaway, options = {}) {
  const embed = createGiveawayEmbed({
    title: options.title,
    prize: giveaway.prize,
    participantCount: giveaway.entries.length,
    winnerCount: giveaway.winnerCount,
    timestamp: options.timestamp || giveaway.endsAt.getTime(),
    timestampLabel: options.timestampLabel || "Ends",
    hostTag: message.embeds[0]?.footer?.text?.replace("Hosted by ", "") || undefined
  });

  const payload = {
    flags: MessageFlags.IsComponentsV2, components: [embed],
    components: options.removeButtons ? [] : [createGiveawayButton(options.isEntered || false)]
  };

  await message.edit(payload).catch(() => {});
};
