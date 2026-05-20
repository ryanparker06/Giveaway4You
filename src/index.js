const fs = require("fs");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});

const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  MessageFlags,
  ActivityType
} = require("discord.js");
const mongoose = require("mongoose");

const Giveaway = require("./models/Giveaway");
const startScheduler = require("./handlers/giveawayScheduler");
const buildContainer = require("./utils/buildContainer");
const startApi = require("./api/server");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.commands = new Map();

/**
 * Load slash commands
 */
function loadCommands() {
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  const commandData = [];

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    if (!command?.data?.name || typeof command.execute !== "function") {
      continue;
    }

    client.commands.set(command.data.name, command);
    commandData.push(
      command.data.toJSON
        ? command.data.toJSON()
        : command.data
    );

    console.log(
      `Loaded command: ${command.data.name}`
    );
  }

  return commandData;
}

/**
 * Register slash commands
 */
async function registerCommands() {
  const commandData = loadCommands();

  const rest = new REST({
    version: "10"
  }).setToken(process.env.DISCORD_TOKEN);

  await rest.put(
    Routes.applicationCommands(
      client.application.id
    ),
    { body: commandData }
  );

  console.log(
    "Global slash commands registered successfully."
  );
  console.log(
    "Global commands can take a few minutes to appear."
  );
}

client.once("clientReady", async () => {
  console.log(
    `Logged in as ${client.user.tag}`
  );

  // Set bot presence
  client.user.setPresence({
    activities: [
      {
        type: ActivityType.Playing,
        name: "Coming Soon!"
      }
    ],
    status: "online"
  });

  await registerCommands();

  startScheduler(client);
  console.log("Giveaway scheduler started.");

  startApi(client);
  console.log("Dashboard API started.");
});

/**
 * Build giveaway container components.
 *
 * Layout:
 * - Title
 * - Large Discord Separator
 * - Giveaway information
 * - Section with Enter/Exit button
 * - Optional bottom separator + banner image
 */
async function buildGiveawayComponents(
  giveaway,
  userId = null
) {
  const entries = Array.isArray(
    giveaway.entries
  )
    ? giveaway.entries
    : [];

  const isEntered =
    userId && entries.includes(userId);

  const endTimestamp = Math.floor(
    new Date(giveaway.endsAt).getTime() / 1000
  );

  // Build a blank container first
  const container = await buildContainer(
    "",
    null,
    giveaway.guildId
  );

  // Replace the first text display with title only
  container[0].components[0] = {
    type: 10, // Text Display
    content: "# 🎉 Giveaway Started"
  };

  // Insert separator directly below the title
  container[0].components.splice(1, 0, {
    type: 14, // Separator
    divider: true,
    spacing: 2 // Large
  });

  // Insert giveaway information below the separator
  container[0].components.splice(2, 0, {
    type: 10, // Text Display
    content:
      `**Prize:** ${giveaway.prize}\n` +
      `**Participants:** ${entries.length}\n` +
      `**Winners:** ${giveaway.winnerCount}\n` +
      `**Ends:** <t:${endTimestamp}:R>\n` +
      `**Hosted By:** <@${giveaway.hostedBy}>`
  });

  // Insert Section with text and button
  container[0].components.splice(3, 0, {
    type: 9, // Section
    components: [
      {
        type: 10, // Text Display
        content:
          "Click the button to enter/exit the giveaway!"
      }
    ],
    accessory: {
      type: 2, // Button
      style: isEntered ? 4 : 1,
      custom_id: isEntered
        ? "giveaway_exit"
        : "giveaway_enter",
      label: isEntered
        ? "❌ Exit Giveaway"
        : "🎉 Enter Giveaway"
    }
  });

  return container;
}
client.on("interactionCreate", async (interaction) => {
  try {
    // ==========================================
    // BUTTON INTERACTIONS
    // ==========================================
    if (interaction.isButton()) {
      if (
        interaction.customId !== "giveaway_enter" &&
        interaction.customId !== "giveaway_exit"
      ) {
        return;
      }

      const giveaway = await Giveaway.findOne({
        messageId: String(
          interaction.message.id
        )
      });

      if (!giveaway) {
        return interaction.reply({
          flags: MessageFlags.Ephemeral,
          content:
            "❌ This giveaway is no longer active."
        });
      }

      if (
        !Array.isArray(giveaway.entries)
      ) {
        giveaway.entries = [];
      }

      if (
        giveaway.ended ||
        Date.now() >=
          new Date(
            giveaway.endsAt
          ).getTime()
      ) {
        return interaction.reply({
          flags: MessageFlags.Ephemeral,
          content:
            "❌ This giveaway has already ended."
        });
      }

      const userId =
        interaction.user.id;

      const isEntered =
        giveaway.entries.includes(
          userId
        );

      // Acknowledge interaction immediately
      await interaction.deferUpdate();

      // ==========================================
      // EXIT GIVEAWAY
      // ==========================================
      if (
        interaction.customId ===
          "giveaway_exit" &&
        isEntered
      ) {
        giveaway.entries =
          giveaway.entries.filter(
            (id) => id !== userId
          );

        await giveaway.save();

        await interaction.message.edit({
          flags:
            MessageFlags.IsComponentsV2,
          components:
            await buildGiveawayComponents(
              giveaway,
              null
            )
        });

        await interaction.followUp({
          flags:
            MessageFlags.Ephemeral,
          content:
            "❌ You have left the giveaway."
        });

        return;
      }

      // ==========================================
      // ENTER GIVEAWAY
      // ==========================================
      if (!isEntered) {
        giveaway.entries.push(userId);

        await giveaway.save();

        await interaction.message.edit({
          flags:
            MessageFlags.IsComponentsV2,
          components:
            await buildGiveawayComponents(
              giveaway,
              userId
            )
        });

        await interaction.followUp({
          flags:
            MessageFlags.Ephemeral,
          content:
            "🎉 You have entered the giveaway!"
        });

        return;
      }

      // Already entered
      await interaction.followUp({
        flags:
          MessageFlags.Ephemeral,
        content:
          "⚠️ You are already entered in this giveaway."
      });

      return;
    }

    // ==========================================
    // SLASH COMMANDS
    // ==========================================
    if (
      !interaction.isChatInputCommand()
    ) {
      return;
    }

    const command =
      client.commands.get(
        interaction.commandName
      );

    if (!command) {
      return;
    }

    await command.execute(
      interaction
    );
  } catch (error) {
    console.error(
      "Interaction error:",
      error
    );

    if (
      interaction.isRepliable() &&
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction
        .reply({
          flags:
            MessageFlags.Ephemeral,
          content:
            "❌ An error occurred while processing this interaction."
        })
        .catch(() => {});
    } else if (
      interaction.isRepliable()
    ) {
      await interaction
        .followUp({
          flags:
            MessageFlags.Ephemeral,
          content:
            "❌ An error occurred while processing this interaction."
        })
        .catch(() => {});
    }
  }
});

async function start() {
  mongoose.set(
    "strictQuery",
    true
  );

  if (
    !process.env.DISCORD_TOKEN
  ) {
    throw new Error(
      "DISCORD_TOKEN missing"
    );
  }

  if (
    !process.env.MONGODB_URI
  ) {
    throw new Error(
      "MONGODB_URI missing"
    );
  }

  await mongoose.connect(
    process.env.MONGODB_URI
  );

  console.log(
    "MongoDB connected"
  );

  await client.login(
    process.env.DISCORD_TOKEN
  );
}

start().catch((err) => {
  console.error(
    "Failed to start bot:",
    err
  );
  process.exit(1);
});
