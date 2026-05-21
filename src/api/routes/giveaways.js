const express = require("express");

module.exports = function (client) {
  const router = express.Router();

  // ==========================================
  // POST /api/giveaways
  // Create giveaway
  // ==========================================
  router.post("/", async (req, res) => {
    try {
      const {
        guildId,
        channelId,
        prize,
        winnerCount,
        duration,
        description,
      } = req.body;

      console.log("🎉 CREATE GIVEAWAY REQUEST:");
      console.log(req.body);

      if (!guildId || !channelId || !prize) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      const guild = client.guilds.cache.get(String(guildId));

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found",
        });
      }

      await guild.channels.fetch();

      const channel = guild.channels.cache.get(String(channelId));

      if (!channel) {
        return res.status(404).json({
          success: false,
          error: "Channel not found",
        });
      }

      // TEST MESSAGE
      await channel.send({
        content: `🎉 Giveaway Created: ${prize}`,
      });

      return res.json({
        success: true,
        message: "Giveaway created successfully",
      });
    } catch (error) {
      console.error("Create giveaway error:", error);

      return res.status(500).json({
        success: false,
        error: error.message || "Failed to create giveaway",
      });
    }
  });

  return router;
};