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

      bot: true,
      botInstalled: true,
      installed: true,
      isInstalled: true,
      configured: true,
      hasBot: true,

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

  const guild = await client.guilds.fetch(String(guildId));

  if (!guild) {
    return res.status(404).json({
      success: false,
      error: "Guild not found or bot is not in this server",
    });
  }

  await guild.channels.fetch();

  const botMember = await guild.members.fetch(client.user.id);

  const channels = guild.channels.cache
    .filter((channel) => {
      if (!channel) return false;

      const validType =
        channel.type === 0 || channel.type === 5;

      if (!validType) return false;

      const permissions =
        channel.permissionsFor(botMember);

      return (
        permissions &&
        permissions.has("SendMessages") &&
        permissions.has("EmbedLinks")
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
  console.error("CHANNELS ERROR:", error);

  return res.status(500).json({
    success: false,
    error: error.message || "Failed to fetch channels",
  });
}

});

// ==========================================
// GET /api/guilds/:guildId/roles
// ==========================================
router.get("/:guildId/roles", async (req, res) => {
  try {
    const { guildId } = req.params;

    const guild = await client.guilds.fetch(
      String(guildId)
    );

    if (!guild) {
      return res.status(404).json({
        success: false,
        error: "Guild not found",
      });
    }

    await guild.roles.fetch();

    const roles = guild.roles.cache
      .filter((role) => !role.managed)
      .sort((a, b) => b.position - a.position)
      .map((role) => ({
        id: String(role.id),
        name: role.name,
      }));

    return res.json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error(
      "Fetch roles error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Failed to fetch roles",
    });
  }
});

// ==========================================
// GET /api/guilds/:guildId/giveaways
// REQUIRED FOR DASHBOARD
// ==========================================
router.get("/:guildId/giveaways", async (req, res) => {
try {
const { guildId } = req.params;
const { status } = req.query;


  let query = {
    guildId: String(guildId),
  };

  if (status === "active") {
    query.ended = false;
  }

  if (status === "completed") {
    query.ended = true;
  }

  const giveaways = await Giveaway.find(query)
    .sort({ createdAt: -1 });

  return res.json({
    success: true,
    giveaways,
  });
} catch (error) {
  console.error(
    "Fetch giveaways error:",
    error
  );

  return res.status(500).json({
    success: false,
    error:
      error.message ||
      "Failed to fetch giveaways",
  });
}

});

// ==========================================
// POST /api/guilds/:guildId/giveaways/:giveawayId/end
// END GIVEAWAY EARLY
// ==========================================
router.post("/:guildId/giveaways/:giveawayId/end", async (req, res) => {
try {
const { guildId, giveawayId } = req.params;

  const giveaway = await Giveaway.findOne({
    _id: giveawayId,
    guildId,
  });

  if (!giveaway) {
    return res.status(404).json({
      success: false,
      error: "Giveaway not found",
    });
  }

  if (giveaway.ended) {
    return res.status(400).json({
      success: false,
      error: "Giveaway already ended",
    });
  }

  const endGiveaway = require("../../utils/endGiveaway");

  await endGiveaway(client, giveaway, false);

  return res.json({
    success: true,
    giveaway,
  });
} catch (error) {
  console.error("End giveaway error:", error);

  return res.status(500).json({
    success: false,
    error: "Failed to end giveaway",
  });
}

});

// ==========================================
// POST /api/guilds/:guildId/giveaways/:giveawayId/cancel
// CANCEL GIVEAWAY
// ==========================================
router.post("/:guildId/giveaways/:giveawayId/cancel", async (req, res) => {
try {
const { guildId, giveawayId } = req.params;

  const giveaway = await Giveaway.findOne({
    _id: giveawayId,
    guildId,
  });

  if (!giveaway) {
    return res.status(404).json({
      success: false,
      error: "Giveaway not found",
    });
  }

  if (giveaway.ended) {
    return res.status(400).json({
      success: false,
      error: "Giveaway already ended",
    });
  }

  const endGiveaway = require("../../utils/endGiveaway");

  await endGiveaway(client, giveaway, true);

  return res.json({
    success: true,
    giveaway,
  });
} catch (error) {
  console.error("Cancel giveaway error:", error);

  return res.status(500).json({
    success: false,
    error: "Failed to cancel giveaway",
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
