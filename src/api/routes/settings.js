const express = require("express");
const GuildSettings = require("../../models/GuildSettings");

module.exports = function(client) {
  const router = express.Router();

  router.get("/:guildId/settings", async (req, res) => {
    const settings = await GuildSettings.findOne({
      guildId: req.params.guildId
    });

    res.json({
      success: true,
      settings
    });
  });

  router.put("/:guildId/settings", async (req, res) => {
    const settings = await GuildSettings.findOneAndUpdate(
      { guildId: req.params.guildId },
      { guildId: req.params.guildId, ...req.body },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      settings
    });
  });

  return router;
};
