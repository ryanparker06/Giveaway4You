const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags
} = require("discord.js");

const ms = require("ms");
const Giveaway = require("../models/Giveaway");
const GuildSettings = require("../models/GuildSettings");
const isPremium = require("../utils/isPremium");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway-schedule")
    .setDescription(
      "Schedule a giveaway to start automatically (Premium)"
    )

    // Make the command visible to everyone in the server.
    // Custom permission checks below decide who can use it.
    .setDMPermission(false)

    .addStringOption((option) =>
      option
        .setName("prize")
        .setDescription("The prize for the giveaway")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("winners")
        .setDescription("Number of winners")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Examples: 1m, 1h, 1d, 7d")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(
          "Channel to post the giveaway in"
        )
        .addChannelTypes(
          ChannelType.GuildText
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("start_time")
        .setDescription(
          "When to start (format: YYYY-MM-DD HH:mm)"
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    // ==========================================
    // PREMIUM CHECK
    // ==========================================
    const premium = await isPremium(
      interaction.guild.id
    );

    if (!premium) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "⭐ Scheduling giveaways is a Premium feature."
      });
    }

    // ==========================================
    // GIVEAWAY ACCESS CHECK
    // ==========================================
    const member = interaction.member;

    // Administrators can always schedule giveaways
    const isAdministrator =
      member.permissions.has(
        PermissionFlagsBits.Administrator
      );

    if (!isAdministrator) {
      const settings =
        await GuildSettings.findOne({
          guildId: interaction.guild.id
        });

      let hasAccess = false;

      // Specific allowed user
      if (
        settings?.giveawayAccessUserId ===
        interaction.user.id
      ) {
        hasAccess = true;
      }

      // Allowed role
      if (
        settings?.giveawayAccessRoleId &&
        member.roles.cache.has(
          settings.giveawayAccessRoleId
        )
      ) {
        hasAccess = true;
      }

      if (!hasAccess) {
        return interaction.reply({
          flags: MessageFlags.Ephemeral,
          content:
            "❌ Only server administrators or users granted giveaway access can schedule giveaways."
        });
      }
    }

    // ==========================================
    // GET OPTIONS
    // ==========================================
    const prize =
      interaction.options.getString(
        "prize"
      );

    const winnerCount =
      interaction.options.getInteger(
        "winners"
      );

    const duration =
      interaction.options.getString(
        "duration"
      );

    const channel =
      interaction.options.getChannel(
        "channel"
      );

    const startTimeString =
      interaction.options.getString(
        "start_time"
      );

    // ==========================================
    // VALIDATE DURATION
    // ==========================================
    const durationMs = ms(duration);

    if (!durationMs) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "❌ Invalid duration. Use values like `1m`, `1h`, `1d`, or `7d`."
      });
    }

    // ==========================================
    // PARSE START TIME
    // Format: YYYY-MM-DD HH:mm
    // ==========================================
    const parsedDate = new Date(
      startTimeString.replace(" ", "T") + ":00"
    );

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "❌ Invalid start time format.\nUse: `YYYY-MM-DD HH:mm`\nExample: `2026-05-20 18:00`"
      });
    }

    if (
      parsedDate.getTime() <=
      Date.now()
    ) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "❌ The start time must be in the future."
      });
    }

    // ==========================================
    // CREATE SCHEDULED GIVEAWAY
    // ==========================================
    const endsAt = new Date(
      parsedDate.getTime() + durationMs
    );

    // Temporary unique message ID until
    // the giveaway is actually posted.
    const tempMessageId =
      `scheduled_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    await Giveaway.create({
      guildId:
        interaction.guild.id,
      channelId:
        channel.id,
      messageId:
        tempMessageId,
      prize,
      winnerCount,
      hostedBy:
        interaction.user.id,
      entries: [],
      endsAt,
      endTime: endsAt,
      ended: false,
      winnerIds: [],
      announcementSent: false,

      // Scheduled giveaway fields
      scheduled: true,
      scheduledStart:
        parsedDate,
      started: false
    });

    // ==========================================
    // FORMAT CONFIRMATION
    // ==========================================
    const startTimestamp =
      Math.floor(
        parsedDate.getTime() / 1000
      );

    const endTimestamp =
      Math.floor(
        endsAt.getTime() / 1000
      );

    // ==========================================
    // CONFIRM TO USER
    // ==========================================
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content:
        `✅ Giveaway scheduled successfully!\n\n` +
        `📅 **Starts:** <t:${startTimestamp}:F>\n` +
        `🏁 **Ends:** <t:${endTimestamp}:F>\n` +
        `🎁 **Prize:** ${prize}\n` +
        `🏆 **Winners:** ${winnerCount}\n` +
        `⏰ **Duration:** ${duration}\n` +
        `📢 **Channel:** ${channel}`
    });
  }
};