const mongoose = require("mongoose");

const GuildPremiumSchema = new mongoose.Schema(
  {
    // Guild that has Premium enabled
    guildId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // User who redeemed the premium code
    activatedBy: {
      type: String,
      default: null
    },

    // Premium code that was redeemed
    code: {
      type: String,
      default: null
    },

    // Whether Premium is currently active
    active: {
      type: Boolean,
      default: true
    },

    // When Premium was first activated
    activatedAt: {
      type: Date,
      default: Date.now
    },

    // When Premium should expire
    // If null, Premium remains active until manually disabled
    expiresAt: {
      type: Date,
      default: null
    },

    // Stripe customer ID
    stripeCustomerId: {
      type: String,
      default: null
    },

    // Stripe subscription ID
    stripeSubscriptionId: {
      type: String,
      default: null
    },

    // End of the current paid billing period
    currentPeriodEnd: {
      type: Date,
      default: null
    },

    // Whether the subscription has been cancelled
    cancelled: {
      type: Boolean,
      default: false
    },

    // Optional notes for debugging/support
    notes: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "GuildPremium",
  GuildPremiumSchema
);