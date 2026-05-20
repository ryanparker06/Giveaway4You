const mongoose = require("mongoose");

module.exports = mongoose.model(
  "GuildSettings",
  new mongoose.Schema({
    guildId: {
      type: String,
      unique: true
    },

    // Role automatically given to giveaway winners
    winnerRoleId: {
      type: String,
      default: null
    },

    // Premium-only giveaway access settings
    giveawayAccessRoleId: {
      type: String,
      default: null
    },

    giveawayAccessUserId: {
      type: String,
      default: null
    },

    // Dashboard configurable premium settings
    bonusEntries: {
      type: Array,
      default: []
    },

    requiredRoleIds: {
      type: [String],
      default: []
    },

    blacklistedRoleIds: {
      type: [String],
      default: []
    },

    bannedUserIds: {
      type: [String],
      default: []
    },

    dmWinners: {
      type: Boolean,
      default: false
    },

    reminderNotifications: {
      type: Boolean,
      default: false
    },

    reminderIntervals: {
      type: [Number],
      default: [60, 30, 10]
    },

    customWinnerMessage: {
      type: String,
      default: null
    },

    defaultGiveawayChannelId: {
      type: String,
      default: null
    },

    logChannelId: {
      type: String,
      default: null
    },

    voteRequirement: {
      type: Boolean,
      default: false
    }
  })
);
