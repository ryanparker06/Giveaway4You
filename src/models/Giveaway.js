const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true
  },

  channelId: {
    type: String,
    required: true
  },

  // For scheduled giveaways, this will be set to
  // "scheduled_<timestamp>" until the actual message
  // is posted and the real Discord message ID is saved.
  messageId: {
    type: String,
    required: true,
    unique: true
  },

  prize: {
    type: String,
    required: true
  },

  winnerCount: {
    type: Number,
    default: 1
  },

  hostedBy: {
    type: String,
    required: true
  },

  // User IDs of all giveaway participants
  entries: {
    type: [String],
    default: []
  },

  // Winner user IDs (used for rerolls and persistence)
  winnerIds: {
    type: [String],
    default: []
  },

  // When the giveaway is scheduled to end
  endsAt: {
    type: Date,
    required: true
  },

  // Optional duplicate field used elsewhere in the bot
  endTime: {
    type: Date
  },

  // Whether the giveaway has ended
  ended: {
    type: Boolean,
    default: false
  },

  // Prevents duplicate winner announcements
  announcementSent: {
    type: Boolean,
    default: false
  },

  // ==========================================
  // SCHEDULED GIVEAWAY FIELDS
  // ==========================================

  // True if created with /giveaway-schedule
  scheduled: {
    type: Boolean,
    default: false
  },

  // The date/time when the giveaway should be posted
  scheduledStart: {
    type: Date,
    default: null
  },

  // True once the scheduled giveaway has been posted
  started: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model(
  "Giveaway",
  giveawaySchema
);