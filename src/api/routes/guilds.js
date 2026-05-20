const express = require("express");
const Giveaway = require("../../models/Giveaway");

module.exports = function (client) {
  const router = express.Router();

  // ==========================================
  // GET /api/guilds
  // Returns all guilds the bot is currently in
  // Used by the dashboard server selection page
  // ==========================================
  router.get("/", async (req, res) => {
    try {
      const guilds = client.guilds.cache
        .map((guild) => ({
          // Always return IDs as strings for reliable comparison
          id: String(guild.id),

          // Basic guild information
          name: guild.name,
          icon: guild.icon,
          memberCount: guild.memberCount || 0,

          // Compatibility fields for different frontend checks
          botInstalled: true,
          isInstalled: true,
          installed: true,

          // Extra metadata
          configured: true,
          hasBot: true,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(
        `📡 /api/guilds requested - returning ${guilds.length} guild(s)`
      );

      res.json({
        success: true,
        count: guilds.length,
        guilds,
      });
    } catch (error) {
      console.error("Error fetching guilds:", error);

      res.status(500).json({
        success: false,
        error: "Failed to fetch guilds",
      });
    }
  });

  // ==========================================
  // GET /api/guilds/:guildId/overview
  // Returns dashboard overview statistics
  // ==========================================
  router.get("/:guildId/overview", async (req, res) => {
    try {
      const { guildId } = req.params;

      // Verify the bot is in this guild
      const guild = client.guilds.cache.get(String(guildId));

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found or bot is not in this server",
        });
      }

      // Active giveaways
      const activeGiveaways = await Giveaway.countDocuments({
        guildId,
        ended: false,
        scheduled: { $ne: true },
      });

      // Scheduled giveaways
      const scheduledGiveaways = await Giveaway.countDocuments({
        guildId,
        scheduled: true,
        ended: false,
      });

      // Completed giveaways
      const completedGiveaways = await Giveaway.countDocuments({
        guildId,
        ended: true,
      });

      // Total giveaways
      const totalGiveaways =
        activeGiveaways +
        scheduledGiveaways +
        completedGiveaways;

      res.json({
        success: true,
        guildId: String(guildId),

        guild: {
          id: String(guild.id),
          name: guild.name,
          icon: guild.icon,
          memberCount: guild.memberCount || 0,

          // Compatibility fields
          botInstalled: true,
          isInstalled: true,
          installed: true,
        },

        stats: {
          totalGiveaways,
          activeGiveaways,
          scheduledGiveaways,
          completedGiveaways,
        },

        // Top-level fields for maximum frontend compatibility
        totalGiveaways,
        activeGiveaways,
        scheduledGiveaways,
        completedGiveaways,

        // Premium placeholder
        premium: {
          active: false,
          tier: "Free",
        },
      });
    } catch (error) {
      console.error("Error fetching guild overview:", error);

      res.status(500).json({
        success: false,
        error: "Failed to fetch guild overview",
      });
    }
  });

  return router;
};
