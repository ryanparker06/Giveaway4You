const express = require("express");
const Giveaway = require("../../models/Giveaway");

module.exports = function (client) {
  const router = express.Router();

  // ==========================================
  // GET /api/guilds
  // ==========================================
  router.get("/", async (req, res) => {
    try {
      const guilds = client.guilds.cache
        .map((guild) => ({
          id: String(guild.id),
          name: guild.name,
          icon: guild.icon,
          memberCount: guild.memberCount || 0,

          // Installation flags
          bot: true,
          botInstalled: true,
          installed: true,
          isInstalled: true,
          configured: true,
          hasBot: true,

          // Permission compatibility
          owner: true,
          admin: true,
          administrator: true,
          manageable: true,

          permissions: "8",
          permissions_new: "8",

          features: [],
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log("📡 Returning guilds:");
      console.log(guilds);

      // IMPORTANT:
      // Return RAW ARRAY ONLY
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
  // ==========================================
  router.get("/:guildId/channels", async (req, res) => {
    try {
      const { guildId } = req.params;

      console.log(`📡 CHANNELS ENDPOINT HIT FOR GUILD ${guildId}`);

      // Fetch directly from Discord
      const guild = await client.guilds.fetch(String(guildId));

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found or bot is not in this server",
        });
      }

      // Fetch all channels
      await guild.channels.fetch();

      const channels = guild.channels.cache
        .filter((channel) => {
          return (
            channel &&
            (channel.type === 0 || channel.type === 5) &&
            channel
              .permissionsFor(client.user.id)
              ?.has(["SendMessages", "EmbedLinks"])
          );
        })
        .map((channel) => ({
          id: String(channel.id),
          name: channel.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(
        `📡 Returning ${channels.length} channels for ${guild.name}`
      );

      return res.json({
        success: true,
        count: channels.length,
        channels,
      });
    } catch (error) {
      console.error("Error fetching guild channels:", error);

      return res.status(500).json({
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

          bot: true,
          botInstalled: true,
          installed: true,
          isInstalled: true,
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