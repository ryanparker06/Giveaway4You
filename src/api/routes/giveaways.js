const express = require("express");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const Giveaway = require("../../models/Giveaway");

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
      // GIVEAWAY END TIME
      // ==========================================
      const endsAt =
        Date.now() + Number(duration || 3600000);

      // ==========================================
      // CREATE EMBED
      // ==========================================
      const embed = new EmbedBuilder()
        .setColor("#22c55e")
        .setTitle("🎉 Giveaway")
        .setDescription(
          `${
            description || "Click the button below to enter!"
          }`
        )
        .addFields(
          {
            name: "🏆 Prize",
            value: prize,
            inline: false,
          },
          {
            name: "👑 Winners",
            value: String(winnerCount || 1),
            inline: true,
          },
          {
            name: "⏰ Ends",
            value: `<t:${Math.floor(
              endsAt / 1000
            )}:R>`,
            inline: true,
          }
        )
        .setFooter({
          text: `Hosted in ${guild.name}`,
        })
        .setTimestamp();

      // ==========================================
      // ENTER BUTTON
      // ==========================================
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("giveaway_enter")
          .setLabel("Enter Giveaway")
          .setEmoji("🎉")
          .setStyle(ButtonStyle.Success)
      );

      // ==========================================
      // SEND GIVEAWAY MESSAGE
      // ==========================================
      const message = await channel.send({
        embeds: [embed],
        components: [row],
      });

      console.log(
        `✅ Giveaway message sent to #${channel.name}`
      );

      // ==========================================
      // SAVE TO DATABASE
      // ==========================================
      const giveaway = await Giveaway.create({
        guildId: String(guildId),
        channelId: String(channelId),
        messageId: String(message.id),

        prize,
        description: description || "",

        winnerCount: Number(winnerCount || 1),

        duration: Number(duration || 3600000),

        endsAt: new Date(endsAt),

        ended: false,
        participants: [],
      });

      console.log(
        `✅ Giveaway saved to database: ${giveaway._id}`
      );

      // ==========================================
      // SUCCESS RESPONSE
      // ==========================================
      return res.json({
        success: true,
        message: "Giveaway created successfully",

        giveaway: {
          id: giveaway._id,
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