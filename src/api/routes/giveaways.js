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
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          memberCount: guild.memberCount || 0,
          botInstalled: true
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      res.json({
        success: true,
        guilds
      });
    } catch (error) {
      console.error("Error fetching guilds:", error);

      res.status(500).json({
        success: false,
        error: "Failed to fetch guilds"
      });
    }
  });

  // ==========================================
  // GET /api/guilds/:guildId/channels
  // Returns all text channels the bot can use
  // Used for the Create Giveaway dropdown
  // ==========================================
  router.get("/:guildId/channels", async (req, res) => {
    try {
      const { guildId } = req.params;

      const guild = client.guilds.cache.get(guildId);

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found"
        });
      }

      // Fetch all channels from Discord to ensure cache is complete
      await guild.channels.fetch();

      const botMember = guild.members.me;

      const channels = guild.channels.cache
        .filter((channel) => {
          // Must be a text-based channel and not a thread
          if (
            !channel.isTextBased ||
            !channel.isTextBased() ||
            channel.isThread()
          ) {
            return false;
          }

          // Must have a name (skip system channels without names)
          if (!channel.name) {
            return false;
          }

          // If bot member exists, ensure it can send messages
          if (botMember) {
            const permissions = channel.permissionsFor(botMember);

            if (
              !permissions ||
              !permissions.has("ViewChannel") ||
              !permissions.has("SendMessages")
            ) {
              return false;
            }
          }

          return true;
        })
        .map((channel) => ({
          id: channel.id,
          name: channel.name
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      res.json({
        success: true,
        channels
      });
    } catch (error) {
      console.error("Error fetching channels:", error);

      res.status(500).json({
        success: false,
        error: "Failed to fetch channels"
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
      const guild = client.guilds.cache.get(guildId);

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found or bot is not in this server"
        });
      }

      // Active giveaways
      const activeGiveaways = await Giveaway.countDocuments({
        guildId,
        ended: false,
        scheduled: { $ne: true }
      });

      // Scheduled giveaways
      const scheduledGiveaways = await Giveaway.countDocuments({
        guildId,
        scheduled: true,
        ended: false
      });

      // Completed giveaways
      const completedGiveaways = await Giveaway.countDocuments({
        guildId,
        ended: true
      });

      // Total giveaways
      const totalGiveaways =
        activeGiveaways +
        scheduledGiveaways +
        completedGiveaways;

      res.json({
        success: true,
        guildId,
        guild: {
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
          memberCount: guild.memberCount || 0
        },
        stats: {
          totalGiveaways,
          activeGiveaways,
          scheduledGiveaways,
          completedGiveaways
        },

        // Compatibility fields
        totalGiveaways,
        activeGiveaways,
        scheduledGiveaways,
        completedGiveaways
      });
    } catch (error) {
      console.error("Error fetching guild overview:", error);

      res.status(500).json({
        success: false,
        error: "Failed to fetch guild overview"
      });
    }
  });

  return router;
};