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
const buildContainer = require("../utils/buildContainer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway-start")
    .setDescription("Start a new giveaway")

    // IMPORTANT:
    // This makes the command visible to everyone in the server.
    // Your custom permission check below will decide who can actually use it.
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
    ),

  async execute(interaction) {
    // ==========================================
    // GIVEAWAY ACCESS CHECK
    // ==========================================
    const member = interaction.member;

    // Administrators can always host giveaways
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

      // No permission
      if (!hasAccess) {
        return interaction.reply({
          flags: MessageFlags.Ephemeral,
          content:
            "❌ Only server administrators or users granted giveaway access can host giveaways."
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

    const durationMs = ms(duration);

    if (!durationMs) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "❌ Invalid duration. Use values like `1m`, `1h`, `1d`, or `7d`."
      });
    }

    // ==========================================
    // PREMIUM RESTRICTIONS
    // ==========================================
    const premium =
      await isPremium(
        interaction.guild.id
      );

    // Giveaways longer than 24 hours
    if (
      !premium &&
      durationMs >
        24 * 60 * 60 * 1000
    ) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "⭐ Premium is required to create giveaways longer than 24 hours."
      });
    }

    // Multiple winners
    if (
      !premium &&
      winnerCount > 1
    ) {
      return interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "⭐ Premium is required to select multiple winners."
      });
    }

    // Only one active giveaway on free servers
    if (!premium) {
      const activeGiveaways =
        await Giveaway.countDocuments({
          guildId:
            interaction.guild.id,
          ended: false
        });

      if (
        activeGiveaways >= 1
      ) {
        return interaction.reply({
          flags: MessageFlags.Ephemeral,
          content:
            "⭐ Non-premium servers can only host one active giveaway at a time."
        });
      }
    }

    // ==========================================
    // CREATE GIVEAWAY
    // ==========================================
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content:
        "🎉 Creating giveaway..."
    });

    const endsAt = new Date(
      Date.now() + durationMs
    );

    const endTimestamp =
      Math.floor(
        endsAt.getTime() / 1000
      );

    // Build a blank container first
    const container =
      await buildContainer(
        "",
        null,
        interaction.guild.id
      );

    // Title
    container[0].components[0] = {
      type: 10, // Text Display
      content:
        "# 🎉 Giveaway Started"
    };

    // Separator below title
    container[0].components.splice(
      1,
      0,
      {
        type: 14, // Separator
        divider: true,
        spacing: 2 // Large
      }
    );

    // Giveaway information
    container[0].components.splice(
      2,
      0,
      {
        type: 10, // Text Display
        content:
          `**Prize:** ${prize}\n` +
          `**Participants:** 0\n` +
          `**Winners:** ${winnerCount}\n` +
          `**Ends:** <t:${endTimestamp}:R>\n` +
          `**Hosted By:** <@${interaction.user.id}>`
      }
    );

    // Section with text and button
    container[0].components.splice(
      3,
      0,
      {
        type: 9, // Section
        components: [
          {
            type: 10,
            content:
              "Click the button to enter/exit the giveaway!"
          }
        ],
        accessory: {
          type: 2,
          style: 1,
          custom_id:
            "giveaway_enter",
          label:
            "🎉 Enter Giveaway"
        }
      }
    );

    // Send giveaway message
    const message =
      await channel.send({
        flags:
          MessageFlags.IsComponentsV2,
        components:
          container
      });

    // Save giveaway
    await Giveaway.create({
      guildId:
        interaction.guild.id,
      channelId:
        channel.id,
      messageId: String(
        message.id
      ),
      prize,
      winnerCount,
      hostedBy:
        interaction.user.id,
      entries: [],
      endsAt,
      ended: false
    });

    // Confirm creation
    await interaction.editReply({
      content:
        `✅ Giveaway created successfully in ${channel}!`
    });
  }
};
