const mongoose = require("mongoose");

const PremiumCodeSchema = new mongoose.Schema(
  {
    // Unique redemption code sent to the customer
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },

    // Whether the code has already been redeemed
    used: {
      type: Boolean,
      default: false
    },

    // Guild that redeemed the code
    usedByGuildId: {
      type: String,
      default: null
    },

    // User who redeemed the code
    usedByUserId: {
      type: String,
      default: null
    },

    // When the code was redeemed
    usedAt: {
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

    // Subscription status (active, canceled, past_due, etc.)
    subscriptionStatus: {
      type: String,
      default: "active"
    },

    // End of the current paid billing period
    // Premium should remain active until this date,
    // even if the subscription has been canceled.
    currentPeriodEnd: {
      type: Date,
      default: null
    },

    // When Premium should expire
    // Usually matches currentPeriodEnd after cancellation.
    expiresAt: {
      type: Date,
      default: null
    },

    // Whether the subscription has been canceled
    cancelled: {
      type: Boolean,
      default: false
    },

    // Optional notes for support/debugging
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
  "PremiumCode",
  PremiumCodeSchema
);
