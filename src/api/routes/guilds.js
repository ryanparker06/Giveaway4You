const express = require("express");
const Giveaway = require("../../models/Giveaway");

module.exports = function(client) {
  const router = express.Router();

  router.get("/:guildId/overview", async (req, res) => {
    const { guildId } = req.params;

    const activeGiveaways = await Giveaway.countDocuments({
      guildId,
      ended: false,
      scheduled: { $ne: true }
    });

    const scheduledGiveaways = await Giveaway.countDocuments({
      guildId,
      scheduled: true,
      ended: false
    });

    res.json({
      success: true,
      guildId,
      activeGiveaways,
      scheduledGiveaways
    });
  });

  return router;
};
