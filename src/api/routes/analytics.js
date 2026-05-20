const express = require("express");
const Giveaway = require("../../models/Giveaway");

module.exports = function(client) {
  const router = express.Router();

  router.get("/:guildId/analytics", async (req, res) => {
    const giveaways = await Giveaway.find({
      guildId: req.params.guildId
    });

    const totalGiveaways = giveaways.length;
    const totalEntries = giveaways.reduce(
      (sum, g) => sum + (Array.isArray(g.entries) ? g.entries.length : 0),
      0
    );
    const totalWinners = giveaways.reduce(
      (sum, g) => sum + (Array.isArray(g.winnerIds) ? g.winnerIds.length : 0),
      0
    );

    res.json({
      success: true,
      totalGiveaways,
      totalEntries,
      totalWinners,
      averageEntriesPerGiveaway:
        totalGiveaways > 0 ? totalEntries / totalGiveaways : 0
    });
  });

  return router;
};
