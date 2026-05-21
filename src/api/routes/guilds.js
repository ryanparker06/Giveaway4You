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

          // EVERYTHING frontend could check
          bot: true,
          botInstalled: true,
          isInstalled: true,
          installed: true,
          configured: true,
          hasBot: true,

          permissions: 8,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(`📡 Returning ${guilds.length} guilds`);

      // IMPORTANT:
      // Return raw array for dashboard compatibility
      res.json(guilds);
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
            channel.isTextBased()
          );
        })
        .map((channel) => ({
          id: String(channel.id),
          value: String(channel.id),

          name: channel.name,
          label: channel.name,

          type: "text",
          channelType: "text",

          botCanSend:
            channel
              .permissionsFor(guild.members.me)
              ?.has("SendMessages") || false,
        }))
        .filter((channel) => channel.botCanSend)
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(
        `📡 Returning ${channels.length} channels for ${guild.name}`
      );

      res.json({
        success: true,
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
  // ==========================================
  router.get("/:guildId/overview", async (req, res) => {
    try {
      const { guildId } = req.params;

      const guild = client.guilds.cache.get(String(guildId));

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found",
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

      res.json({
        success: true,

        guild: {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
        },

        stats: {
          totalGiveaways:
            activeGiveaways +
            scheduledGiveaways +
            completedGiveaways,

          activeGiveaways,
          scheduledGiveaways,
          completedGiveaways,
        },
      });
    } catch (error) {
      console.error("Overview error:", error);

      res.status(500).json({
        success: false,
        error: "Failed to fetch overview",
      });
    }
  });

  return router;
};
