const express = require("express");
const Giveaway = require("../../models/Giveaway");

module.exports = function (client) {
  const router = express.Router();

  // ==========================================
  // GET /api/guilds
  // Returns all guilds the bot is currently in
  // ==========================================
  router.get("/", async (req, res) => {
    try {
      const guilds = client.guilds.cache
        .map((guild) => ({
          id: String(guild.id),
          name: guild.name,
          icon: guild.icon,
          memberCount: guild.memberCount || 0,

          // Compatibility fields
          botInstalled: true,
          isInstalled: true,
          installed: true,
          configured: true,
          hasBot: true,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

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
  // GET /api/guilds/:guildId/channels
  // Returns all text channels for the guild
  // ==========================================
  router.get("/:guildId/channels", async (req, res) => {
    try {
      const { guildId } = req.params;

      console.log(`📡 CHANNELS ENDPOINT HIT FOR GUILD ${guildId}`);

      // Get the guild
      const guild = client.guilds.cache.get(String(guildId));

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found or bot is not in this server",
        });
      }

      // Fetch all channels from Discord
      await guild.channels.fetch();

      // Filter to standard text channels only
      const channels = guild.channels.cache
        .filter((channel) => {
          return (
            channel &&
            typeof channel.isTextBased === "function" &&
            channel.isTextBased() &&
            channel.type === 0 // GuildText in Discord.js v14
          );
        })
        .map((channel) => ({
          id: String(channel.id),
          name: channel.name,

          // Extra fields required for dashboard compatibility
          type: "text",
          isText: true,
          text: true,
          canSend: true,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(
        `📡 Returning ${channels.length} text channels for ${guild.name}`
      );

      // Debug output
      if (channels.length > 0) {
        console.log(
          "📡 First channel returned:",
          JSON.stringify(channels[0], null, 2)
        );
      }

      res.json({
        success: true,
        count: channels.length,
        channels,

        // Additional top-level compatibility fields
        data: channels,
        results: channels,
      });
    } catch (error) {
      console.error("Error fetching guild channels:", error);

      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch channels",
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

      const guild = client.guilds.cache.get(String(guildId));

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found or bot is not in this server",
        });
      }

      const activeGiveaways = await Giveaway.countDocuments({
        guildId,
        ended: false,
        scheduled: { $ne: true },
      });

      const scheduledGiveaways = await Giveaway.countDocuments({
        guildId,
        scheduled: true,
        ended: false,
      });

      const completedGiveaways = await Giveaway.countDocuments({
        guildId,
        ended: true,
      });

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

        // Top-level fields for frontend compatibility
        totalGiveaways,
        activeGiveaways,
        scheduledGiveaways,
        completedGiveaways,

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
