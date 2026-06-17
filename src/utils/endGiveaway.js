
const {
  MessageFlags,
  PermissionFlagsBits
} = require("discord.js");
const buildContainer = require("./buildContainer");
const GuildSettings = require("../models/GuildSettings");

/**
 * Ends or cancels a giveaway and updates the original
 * Components V2 container message.
 *
 * Features:
 * - Determines winners
 * - Updates the original giveaway message
 * - Assigns the configured winner role
 * - Sends a winner announcement
 */
module.exports = async function endGiveaway(
  client,
  giveaway,
  cancelled = false
) {
  try {
    // Prevent duplicate processing for automatic endings
    if (giveaway.ended && !cancelled) {
      return;
    }

    // Normalize entries
    if (!Array.isArray(giveaway.entries)) {
      giveaway.entries = [];
    }

    // Normalize persistent fields
    if (!Array.isArray(giveaway.winnerIds)) {
      giveaway.winnerIds = [];
    }

    if (typeof giveaway.announcementSent !== "boolean") {
      giveaway.announcementSent = false;
    }

    /**
     * DETERMINE WINNERS
     */
    let winners = [];
    
    if (!cancelled) {
      if (giveaway.winnerIds.length > 0) {
        winners = [...giveaway.winnerIds];
      } else if (giveaway.entries.length > 0) {
        const guild =
          await client.guilds.fetch(
            giveaway.guildId
          );

        let ticketPool = [];

        for (const userId of giveaway.entries) {
          let tickets = 1;

          try {
            const member =
              await guild.members.fetch(
                userId
              );

            if (
              Array.isArray(
                giveaway.bonusEntries
              )
            ) {
              for (const bonus of giveaway.bonusEntries) {
                if (
                  bonus?.roleId &&
                  member.roles.cache.has(
                    bonus.roleId
                  )
                ) {
                  tickets +=
                    Number(
                      bonus.entries || 0
                    );
                }
              }
            }
          } catch (error) {
            console.error(
              `Failed to check roles for ${userId}:`,
              error
            );
          }

          for (
            let i = 0;
            i < tickets;
            i++
          ) {
            ticketPool.push(userId);
          }
        }

        const winnerCount =
          giveaway.winnerCount ||
          giveaway.winners ||
          1;

        const selected = new Set();

        while (
          selected.size < winnerCount &&
          ticketPool.length > 0
        ) {
          const index = Math.floor(
            Math.random() *
              ticketPool.length
          );

          const winner =
            ticketPool[index];

          selected.add(winner);

          ticketPool = ticketPool.filter(
            (id) => id !== winner
          );
        }

        winners = [...selected];
        giveaway.winnerIds = [...winners];
      }
    }

    /**
     * MARK GIVEAWAY AS ENDED
     */
    giveaway.endsAt = new Date();
    giveaway.endTime = giveaway.endsAt;
    giveaway.ended = true;

    await giveaway.save();

    /**
     * FETCH CHANNEL
     */
    const channel = await client.channels
      .fetch(giveaway.channelId)
      .catch(() => null);

    if (!channel) {
      console.log(
        `❌ Could not fetch channel ${giveaway.channelId}`
      );
      return;
    }

    /**
     * FETCH ORIGINAL GIVEAWAY MESSAGE
     */
    const message = await channel.messages
      .fetch(giveaway.messageId)
      .catch(() => null);

    if (!message) {
      console.log(
        `❌ Could not fetch giveaway message ${giveaway.messageId}`
      );
      return;
    }

    const participantCount =
      giveaway.entries.length;

    const winnersText = cancelled
      ? "Cancelled by staff."
      : winners.length > 0
      ? winners.map((id) => `<@${id}>`).join(", ")
      : "No valid entries";

    const title = cancelled
      ? "# ❌ Giveaway Cancelled"
      : "# 🏁 Giveaway Ended";

    const buttonLabel = cancelled
      ? "Giveaway Cancelled"
      : "Giveaway Ended";

    const endTimestamp = Math.floor(
      giveaway.endsAt.getTime() / 1000
    );

      /**
   * BUILD UPDATED GIVEAWAY CONTAINER
   */
  const container = await buildContainer(
    "",
    null,
    giveaway.guildId
  );

  // Title
  container[0].components[0] = {
    type: 10,
    content: title
  };

  // Separator
  container[0].components.splice(1, 0, {
    type: 14,
    divider: true,
    spacing: 2
  });

  // Bonus entry roles text
  const bonusRolesText =
    Array.isArray(
      giveaway.bonusEntries
    ) &&
    giveaway.bonusEntries.length > 0
      ? "\n\nBonus Entry Roles:\n" +
        giveaway.bonusEntries
          .map(
            (b) =>
              `<@&${b.roleId}> (+${b.entries})`
          )
          .join("\n")
      : "";

  // Giveaway information
  container[0].components.splice(2, 0, {
    type: 10,
    content:
      `<:rightarrow:1516933117120741519> Hosted By: <@${giveaway.hostedBy}>\n` +
      `<:rightarrow:1516933117120741519> Winner(s): ${winnersText}\n\n` +
      `<:rightarrow:1516933117120741519> Participants: ${participantCount}\n` +
      `<:rightarrow:1516933117120741519> Ended: <t:${endTimestamp}:R>` +
      bonusRolesText
  });

  // Disabled button section
  container[0].components.splice(3, 0, {
    type: 9,
    components: [
      {
        type: 10,
        content:
          "Click the button to enter/exit the giveaway!"
      }
    ],
    accessory: {
      type: 2,
      style: cancelled ? 4 : 2,
      custom_id: "giveaway_closed",
      label: buttonLabel,
      disabled: true
    }
  });

    /**
     * UPDATE ORIGINAL GIVEAWAY MESSAGE
     */
    await message.edit({
      flags: MessageFlags.IsComponentsV2,
      components: container
    });

    /**
     * GIVE WINNER ROLE TO ALL WINNERS
     */
    if (!cancelled && winners.length > 0) {
      try {
        const guild = channel.guild;

        // Load settings (optional fallback)
        const settings =
          await GuildSettings.findOne({
            guildId: giveaway.guildId
          }).catch(() => null);

        // Check all possible field names
        const winnerRoleId =
          giveaway.winnerRoleId ||
          giveaway.roleId ||
          giveaway.autoRoleId ||
          settings?.winnerRoleId ||
          null;

        console.log(
          "🎁 Winner Role ID:",
          winnerRoleId
        );

        if (!winnerRoleId) {
          console.log(
            "⚠️ No winner role ID was found in the giveaway or guild settings."
          );
        } else {
          // Fetch role
          const winnerRole = await guild.roles
            .fetch(winnerRoleId)
            .catch(() => null);

          if (!winnerRole) {
            console.log(
              `⚠️ Winner role ${winnerRoleId} does not exist.`
            );
          } else {
            // Fetch bot member
            const botMember =
              await guild.members.fetch(
                client.user.id
              );

            // Check permissions
            if (
              !botMember.permissions.has(
                PermissionFlagsBits.ManageRoles
              )
            ) {
              console.log(
                "❌ Bot is missing Manage Roles permission."
              );
            }
            // Check role hierarchy
            else if (
              winnerRole.position >=
              botMember.roles.highest.position
            ) {
              console.log(
                `❌ Cannot assign ${winnerRole.name}; it is above or equal to the bot's highest role (${botMember.roles.highest.name}).`
              );
            } else {
              // Assign role to all winners
              for (const winnerId of winners) {
                try {
                  const member =
                    await guild.members
                      .fetch(winnerId)
                      .catch(() => null);

                  if (!member) {
                    console.log(
                      `⚠️ Winner ${winnerId} is not in the server.`
                    );
                    continue;
                  }

                  if (
                    member.roles.cache.has(
                      winnerRole.id
                    )
                  ) {
                    console.log(
                      `ℹ️ ${member.user.tag} already has the winner role.`
                    );
                    continue;
                  }

                  await member.roles.add(
                    winnerRole.id,
                    `Won giveaway: ${giveaway.prize}`
                  );

                  console.log(
                    `✅ Successfully added ${winnerRole.name} to ${member.user.tag}`
                  );
                } catch (error) {
                  console.error(
                    `❌ Failed to add role to ${winnerId}:`,
                    error
                  );
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(
          "❌ Error assigning winner roles:",
          error
        );
      }
    }

    /**
     * SEND WINNER ANNOUNCEMENT
     */
    if (
      !cancelled &&
      !giveaway.announcementSent
    ) {
      const winnerMentions = winners
        .map((id) => `<@${id}>`)
        .join(", ");

      const winnerTitle =
        winners.length > 1
          ? "# 🎉 Giveaway Winners!"
          : "# 🎉 Giveaway Winner!";

      // Build winner container
      const winnerContainer =
        await buildContainer(
          "",
          null,
          giveaway.guildId
        );

      // Title
      winnerContainer[0].components[0] = {
        type: 10,
        content: winnerTitle
      };

      // Separator
      winnerContainer[0].components.splice(
        1,
        0,
        {
          type: 14,
          divider: true,
          spacing: 2
        }
      );

      // Winner information
      winnerContainer[0].components.splice(
        2,
        0,
        {
          type: 10,
          content:
            `> Winner(s): ${winnerMentions}\n\n` +
            `> Prize: ${giveaway.prize}\n` +
            `> Hosted By: <@${giveaway.hostedBy}>`
        }
      );

      // Send winner announcement
      await channel.send({
        flags: MessageFlags.IsComponentsV2,
        components: winnerContainer
      });

      giveaway.announcementSent = true;
      await giveaway.save();
    }
  } catch (error) {
    console.error(
      "Error ending giveaway:",
      error
    );

    throw error;
  }
};