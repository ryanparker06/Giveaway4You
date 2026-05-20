const GuildPremium = require("../models/GuildPremium");

/**
 * Returns true if the guild has premium enabled.
 *
 * Premium is considered active only if:
 * 1. A GuildPremium document exists
 * 2. active === true
 * 3. expiresAt is either not set OR is in the future
 *
 * This allows Stripe cancellations to keep Premium active
 * until the current billing period ends.
 */
module.exports = async function isPremium(guildId) {
  if (!guildId) return false;

  try {
    const premium = await GuildPremium.findOne({
      guildId: String(guildId),
      active: true
    });

    // No premium record found
    if (!premium) {
      return false;
    }

    // If an expiration date exists and has passed,
    // automatically disable premium.
    if (
      premium.expiresAt &&
      new Date(premium.expiresAt) <= new Date()
    ) {
      premium.active = false;
      await premium.save();
      return false;
    }

    // Premium is active
    return true;
  } catch (error) {
    console.error(
      "Error checking premium status:",
      error
    );
    return false;
  }
};