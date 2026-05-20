const express = require("express");
const GuildPremium = require("../../models/GuildPremium");

module.exports = function (client) {
  const router = express.Router();

  const PREMIUM_FEATURES = [
    "custom_duration",
    "dm_winners",
    "bonus_entries",
    "required_roles",
    "scheduled_giveaways",
  ];

  // GET /api/guilds/:guildId/premium
  router.get("/:guildId/premium", async (req, res) => {
    try {
      const { guildId } = req.params;

      // Ensure bot is in the guild
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        return res.status(404).json({
          active: false,
          plan: "free",
          expiresAt: null,
          features: [],
          error: "Guild not found",
        });
      }

      // Find premium record
      const premium = await GuildPremium.findOne({ guildId });

      // No premium = free
      if (!premium) {
        return res.json({
          active: false,
          plan: "free",
          expiresAt: null,
          features: [],
        });
      }

      const now = new Date();

      // Lifetime premium
      if (
        premium.plan === "lifetime" ||
        premium.type === "lifetime"
      ) {
        return res.json({
          active: true,
          plan: "lifetime",
          expiresAt: null,
          features: PREMIUM_FEATURES,
        });
      }

      // Expiration date
      const expiresAt =
        premium.expiresAt ||
        premium.expires ||
        premium.endDate ||
        null;

      // Monthly premium active?
      const isActive =
        expiresAt && new Date(expiresAt) > now;

      if (!isActive) {
        return res.json({
          active: false,
          plan: "free",
          expiresAt: null,
          features: [],
        });
      }

      return res.json({
        active: true,
        plan: premium.plan || "monthly",
        expiresAt,
        features: PREMIUM_FEATURES,
      });
    } catch (error) {
      console.error("Premium API Error:", error);

      res.status(500).json({
        active: false,
        plan: "free",
        expiresAt: null,
        features: [],
        error: "Failed to fetch premium status",
      });
    }
  });

  return router;
};