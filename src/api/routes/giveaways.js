const express = require("express");
const Giveaway = require("../../models/Giveaway");

module.exports = function (client) {
  const router = express.Router();

  // ==========================================
  // GET /api/guilds/:guildId/giveaways
  // Returns all giveaways for a guild
  // Supports ?status=active, ?status=scheduled, ?status=ended
  // ==========================================
  router.get("/:guildId/giveaways", async (req, res) => {
    try {
      const { guildId } = req.params;
      const { status } = req.query;

      // Ensure the bot is in the guild
      const guild = client.guilds.cache.get(guildId);

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found"
        });
      }

      // Build query
      const query = { guildId };

      if (status === "active") {
        query.ended = false;
        query.scheduled = { $ne: true };
      } else if (status === "scheduled") {
        query.scheduled = true;
        query.ended = false;
      } else if (status === "ended") {
        query.ended = true;
      }

      const giveaways = await Giveaway.find(query)
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        count: giveaways.length,
        giveaways
      });
    } catch (error) {
      console.error("Error fetching giveaways:", error);

      return res.status(500).json({
        success: false,
        error: "Failed to fetch giveaways"
      });
    }
  });

  // ==========================================
  // POST /api/guilds/:guildId/giveaways
  // Creates a new giveaway from the dashboard
  // ==========================================
  router.post("/:guildId/giveaways", async (req, res) => {
    try {
      const { guildId } = req.params;

      // Ensure the bot is in the guild
      const guild = client.guilds.cache.get(guildId);

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found"
        });
      }

      const {
        prize,
        channelId,
        winnerCount = 1,
        duration = 60,
        durationUnit = "minutes",
        hostedBy,
        requirements = {},
        description = "",
        image = null
      } = req.body;

      // Basic validation
      if (!prize || !channelId) {
        return res.status(400).json({
          success: false,
          error: "Prize and channelId are required"
        });
      }

      // Ensure the channel exists
      const channel = guild.channels.cache.get(channelId);

      if (!channel) {
        return res.status(404).json({
          success: false,
          error: "Channel not found"
        });
      }

      // Convert duration to milliseconds
      const multipliers = {
        minutes: 60 * 1000,
        hours: 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000
      };

      const ms =
        Number(duration) *
        (multipliers[durationUnit] || multipliers.minutes);

      const endsAt = new Date(Date.now() + ms);

      // Create giveaway document
      const giveaway = await Giveaway.create({
        // Core fields
        guildId,
        channelId,
        prize,
        messageId: "pending",

        // Giveaway settings
        winnerCount: Number(winnerCount) || 1,
        hostedBy: hostedBy || "Dashboard",

        // Timing
        startAt: new Date(),
        endsAt,

        // Status flags
        ended: false,
        scheduled: false,
        cancelled: false,
        paused: false,

        // Optional content
        description: description || "",
        image: image || null,
        requirements: requirements || {},

        // Collections
        entries: [],
        winners: [],
        winnerIds: [],
        participants: [],

        // Common counters
        entryCount: 0,

        // Message/embed placeholders
        embedData: {},
        reaction: "🎉",

        // Miscellaneous placeholders
        bonusEntries: [],
        exemptMembers: [],
        lastWinnerIds: []
      });

      return res.json({
        success: true,
        giveaway
      });
    } catch (error) {
      console.error("Create giveaway error:", error);

      return res.status(500).json({
        success: false,
        error: "Failed to create giveaway"
      });
    }
  });

  // ==========================================
  // POST /api/guilds/:guildId/giveaways/:id/end
  // Ends a giveaway early
  // ==========================================
  router.post("/:guildId/giveaways/:id/end", async (req, res) => {
    try {
      const { guildId, id } = req.params;

      const giveaway = await Giveaway.findOne({
        _id: id,
        guildId
      });

      if (!giveaway) {
        return res.status(404).json({
          success: false,
          error: "Giveaway not found"
        });
      }

      giveaway.ended = true;
      await giveaway.save();

      return res.json({
        success: true,
        giveaway
      });
    } catch (error) {
      console.error("End giveaway error:", error);

      return res.status(500).json({
        success: false,
        error: "Failed to end giveaway"
      });
    }
  });

  // ==========================================
  // POST /api/guilds/:guildId/giveaways/:id/reroll
  // Placeholder reroll endpoint
  // ==========================================
  router.post("/:guildId/giveaways/:id/reroll", async (req, res) => {
    try {
      const { guildId, id } = req.params;

      const giveaway = await Giveaway.findOne({
        _id: id,
        guildId
      });

      if (!giveaway) {
        return res.status(404).json({
          success: false,
          error: "Giveaway not found"
        });
      }

      return res.json({
        success: true,
        message: "Reroll endpoint is ready",
        giveaway
      });
    } catch (error) {
      console.error("Reroll giveaway error:", error);

      return res.status(500).json({
        success: false,
        error: "Failed to reroll giveaway"
      });
    }
  });

  // ==========================================
  // POST /api/guilds/:guildId/giveaways/:id/cancel
  // Cancels a giveaway
  // ==========================================
  router.post("/:guildId/giveaways/:id/cancel", async (req, res) => {
    try {
      const { guildId, id } = req.params;

      const giveaway = await Giveaway.findOne({
        _id: id,
        guildId
      });

      if (!giveaway) {
        return res.status(404).json({
          success: false,
          error: "Giveaway not found"
        });
      }

      giveaway.ended = true;
      giveaway.cancelled = true;
      await giveaway.save();

      return res.json({
        success: true,
        giveaway
      });
    } catch (error) {
      console.error("Cancel giveaway error:", error);

      return res.status(500).json({
        success: false,
        error: "Failed to cancel giveaway"
      });
    }
  });

  return router;
};