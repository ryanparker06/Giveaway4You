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

      const guild = client.guilds.cache.get(String(guildId));

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found or bot is not in this server",
        });
      }

      await guild.channels.fetch();

      const channels = guild.channels.cache
        .filter((channel) => {
          return (
            channel &&
            typeof channel.isTextBased === "function" &&
            channel.isTextBased() &&
            channel.type === 0
          );
        })
        .map((channel) => ({
          id: String(channel.id),
          name: channel.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(
        `📡 Returning ${channels.length} text channels for ${guild.name}`
      );

      res.json({
        success: true,
        count: channels.length,
        channels,
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
