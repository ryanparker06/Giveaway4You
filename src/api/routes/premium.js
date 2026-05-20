const express = require("express");
const GuildPremium = require("../../models/GuildPremium");
const isPremium = require("../../utils/isPremium");

module.exports = function(client) {
  const router = express.Router();

  router.get("/:guildId/premium", async (req, res) => {
    const premium = await isPremium(req.params.guildId);
    const record = await GuildPremium.findOne({
      guildId: req.params.guildId
    });

    res.json({
      success: true,
      premium,
      record
    });
  });

  return router;
};
