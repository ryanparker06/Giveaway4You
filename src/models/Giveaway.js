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

entries: {
type: [String],
default: []
},

winnerIds: {
type: [String],
default: []
},

endsAt: {
type: Date,
required: true
},

endTime: {
type: Date
},

ended: {
type: Boolean,
default: false
},

announcementSent: {
type: Boolean,
default: false
},

// ==========================================
// BONUS ENTRIES
// ==========================================

bonusEntries: {
  type: [
    {
      roleId: String,
      entries: Number
    }
  ],
  default: []
},

// ==========================================
// REQUIRED ROLES
// ==========================================

requiredRoles: {
type: [String],
default: []
},

// ==========================================
// SCHEDULED GIVEAWAY FIELDS
// ==========================================

scheduled: {
type: Boolean,
default: false
},

scheduledStart: {
type: Date,
default: null
},

started: {
type: Boolean,
default: true
}
});

module.exports = mongoose.model(
"Giveaway",
giveawaySchema
);