const express = require("express");
const { MessageFlags } = require("discord.js");

const Giveaway = require("../../models/Giveaway");
const buildContainer = require("../../utils/buildContainer");

module.exports = function (client) {
  const router = express.Router();

  // ==========================================
  // POST /api/giveaways
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
      // FETCH CHANNEL
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
      // CHECK PERMISSIONS
      // ==========================================
      const permissions =
        channel.permissionsFor(
          guild.members.me
        );

      if (
        !permissions ||
        !permissions.has([
          "ViewChannel",
          "SendMessages",
          "EmbedLinks",
        ])
      ) {
        return res.status(403).json({
          success: false,
          error:
            "Bot does not have permission to send messages in this channel",
        });
      }

      // ==========================================
      // GIVEAWAY TIMING
      // ==========================================
      const durationMs =
        Number(duration) || 3600000;

      const endsAt = new Date(
        Date.now() + durationMs
      );

      const endTimestamp =
        Math.floor(
          endsAt.getTime() / 1000
        );

      // ==========================================
      // BUILD REAL GIVEAWAY CONTAINER
      // ==========================================
      const container =
        await buildContainer(
          "",
          null,
          guild.id
        );

      // Title
      container[0].components[0] = {
        type: 10,
        content:
          "# 🎉 Giveaway Started",
      };

      // Separator
      container[0].components.splice(
        1,
        0,
        {
          type: 14,
          divider: true,
          spacing: 2,
        }
      );

      // Giveaway information
      container[0].components.splice(
        2,
        0,
        {
          type: 10,
          content:
            `**Prize:** ${prize}\n` +
            `**Participants:** 0\n` +
            `**Winners:** ${
              winnerCount || 1
            }\n` +
            `**Ends:** <t:${endTimestamp}:R>\n` +
            `**Hosted By:** Dashboard`,
        }
      );

      // Button section
      container[0].components.splice(
        3,
        0,
        {
          type: 9,
          components: [
            {
              type: 10,
              content:
                "Click the button to enter/exit the giveaway!",
            },
          ],
          accessory: {
            type: 2,
            style: 1,
            custom_id:
              "giveaway_enter",
            label:
              "🎉 Enter Giveaway",
          },
        }
      );

      // ==========================================
      // SEND REAL GIVEAWAY MESSAGE
      // ==========================================
      const message =
        await channel.send({
          flags:
            MessageFlags.IsComponentsV2,
          components:
            container,
        });

      console.log(
        `✅ Giveaway sent to #${channel.name}`
      );

      // ==========================================
      // SAVE GIVEAWAY TO DATABASE
      // ==========================================
      const giveaway =
        await Giveaway.create({
          guildId: guild.id,

          channelId:
            channel.id,

          messageId:
            String(message.id),

          prize,

          winnerCount:
            Number(
              winnerCount || 1
            ),

          hostedBy:
            "Dashboard",

          entries: [],

          endsAt,

          ended: false,

          description:
            description || "",
        });

      console.log(
        `✅ Giveaway saved: ${giveaway._id}`
      );

      // ==========================================
      // SUCCESS RESPONSE
      // ==========================================
      return res.json({
        success: true,
        message:
          "Giveaway created successfully",

        giveaway: {
          id: giveaway._id,
          guildId:
            guild.id,
          channelId:
            channel.id,
          messageId:
            message.id,
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