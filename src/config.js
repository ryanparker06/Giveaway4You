module.exports = {
  giveaway: {
    // Titles
    title: "🎉 Giveaway Started",
    endedTitle: "🎉 Giveaway Ended",
    cancelledTitle: "❌ Giveaway Cancelled",

    // Buttons
    enterButtonLabel: "Enter Giveaway",
    exitButtonLabel: "Exit Giveaway",
    enterButtonEmoji: "🎉",
    exitButtonEmoji: "❌",

    // Footer / hosted by text
    hostedByText: "Hosted by {tag}",

    // Banner image shown under the separator in ALL containers
    // Set to "" to disable the image
    imageUrl: "https://res.cloudinary.com/dbtjqh5j3/image/upload/v1778807365/Giveaway4You_Footer_1_uyagxg.png",

    // Announcement messages
    winnerAnnouncement:
      "🎉 Congratulations {winners}! You won **{prize}**!",

    noEntriesAnnouncement:
      "No one entered the giveaway, so no winner was selected for **{prize}**."
  },

  premium: {
    freeMaxDurationMs: 24 * 60 * 60 * 1000,
    freeMaxWinners: 1,
    freeMaxActiveGiveaways: 1
  },

  owners: [
    "1149643617149931572",
    "526782947123134465"
  ]
};