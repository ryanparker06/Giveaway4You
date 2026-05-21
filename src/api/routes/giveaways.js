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

      // ==========================================
      // VALIDATION
      // ==========================================
      if (!guildId || !channelId || !prize) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      // ==========================================
      // FETCH GUILD
      // FIXED:
      // Use fetch instead of cache
      // ==========================================
      const guild = await client.guilds.fetch(
        String(guildId)
      );

      if (!guild) {
        return res.status(404).json({
          success: false,
          error: "Guild not found",
        });
      }

      // ==========================================
      // FETCH CHANNELS
      // ==========================================
      await guild.channels.fetch();

      const channel = guild.channels.cache.get(
        String(channelId)
      );

      if (!channel) {
        return res.status(404).json({
          success: false,
          error: "Channel not found",
        });
      }

      // ==========================================
      // CHECK BOT PERMISSIONS
      // ==========================================
      const permissions = channel.permissionsFor(
        guild.members.me
      );

      if (
        !permissions ||
        !permissions.has("SendMessages")
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Bot does not have permission to send messages in this channel",
        });
      }

      // ==========================================
      // TEST GIVEAWAY MESSAGE
      // ==========================================
      const message = await channel.send({
        content:
          `🎉 **Giveaway Created!**\n\n` +
          `🏆 Prize: ${prize}\n` +
          `👑 Winners: ${winnerCount || 1}\n` +
          `⏰ Duration: ${duration || 0}\n\n` +
          `${
            description
              ? `📝 ${description}`
              : ""
          }`,
      });

      console.log(
        `✅ Giveaway message sent to #${channel.name}`
      );

      // ==========================================
      // SUCCESS RESPONSE
      // ==========================================
      return res.json({
        success: true,
        message: "Giveaway created successfully",

        giveaway: {
          guildId,
          channelId,
          messageId: message.id,
          prize,
          winnerCount: winnerCount || 1,
          duration,
          description: description || "",
        },
      });
    } catch (error) {
      console.error(
        "Create giveaway error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          error.message ||
          "Failed to create giveaway",
      });
    }
  });

  return router;
};