const Giveaway = require("../models/Giveaway");
const endGiveaway = require("../utils/endGiveaway");
const buildContainer = require("../utils/buildContainer");

/**
 * Giveaway Scheduler
 *
 * Handles two tasks:
 *
 * 1. Starts scheduled giveaways created with /giveaway-schedule
 * 2. Ends giveaways when their end time is reached
 */
module.exports = function startGiveawayScheduler(client) {
  // Check every 1 second
  setInterval(async () => {
    try {
      const now = new Date();

      // ==================================================
      // START SCHEDULED GIVEAWAYS
      // ==================================================
      const scheduledGiveaways =
        await Giveaway.find({
          scheduled: true,
          started: false,
          scheduledStart: { $lte: now }
        });

      for (const giveaway of scheduledGiveaways) {
        try {
          const channel = await client.channels
            .fetch(giveaway.channelId)
            .catch(() => null);

          if (!channel) {
            continue;
          }

          const endTimestamp = Math.floor(
            new Date(giveaway.endsAt).getTime() /
              1000
          );

          // Build a blank container
          const container =
            await buildContainer(
              "",
              null,
              giveaway.guildId
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
                `**Prize:** ${giveaway.prize}\n` +
                `**Participants:** 0\n` +
                `**Winners:** ${giveaway.winnerCount}\n` +
                `**Ends:** <t:${endTimestamp}:R>\n` +
                `**Hosted By:** <@${giveaway.hostedBy}>`
            }
          );

          // Section with Enter Giveaway button
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

          // Send the giveaway message
          const message =
            await channel.send({
              flags: 32768, // MessageFlags.IsComponentsV2
              components:
                container
            });

          // Update database
          giveaway.messageId =
            String(message.id);
          giveaway.scheduled = false;
          giveaway.started = true;

          await giveaway.save();

          console.log(
            `Started scheduled giveaway ${giveaway._id}`
          );
        } catch (error) {
          console.error(
            `Failed to start scheduled giveaway ${giveaway._id}:`,
            error
          );
        }
      }

      // ==================================================
      // END GIVEAWAYS
      // ==================================================
      const giveaways =
        await Giveaway.find({
          ended: false,
          started: true,
          endsAt: { $lte: now }
        });

      for (const giveaway of giveaways) {
        try {
          await endGiveaway(
            client,
            giveaway
          );
        } catch (error) {
          console.error(
            `Failed to end giveaway ${giveaway._id}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error(
        "Giveaway scheduler error:",
        error
      );
    }
  }, 1000); // Check every second
};
