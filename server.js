require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);

const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
const commandsForReg = [];

for (const file of commandFiles) {
  const cmd = require(path.join(commandsPath, file));
  client.commands.set(cmd.data.name, cmd);
  commandsForReg.push(cmd.data.toJSON ? cmd.data.toJSON() : cmd.data);
}

async function registerCommands() {
  if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
    console.warn("Skipping registration: DISCORD_TOKEN or CLIENT_ID missing.");
    return;
  }
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    if (process.env.GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commandsForReg });
      console.log("Registered guild commands.");
    } else {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commandsForReg });
      console.log("Registered global commands.");
    }
  } catch (e) { console.error("Failed to register commands:", e); }
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction, { client });
  } catch (err) {
    console.error("Command error:", err);
    if (!interaction.replied) await interaction.reply({ content: "❌ Error occurred", ephemeral: true });
  }
});

// Express health endpoint (Render needs at least one web port)
const app = express();
app.get("/", (req, res) => res.send("Fortnite Safe Viewer is running."));
app.listen(process.env.PORT || 3000, () => console.log("Express listening."));

registerCommands().then(() => {
  if (!process.env.DISCORD_TOKEN) {
    console.error("Missing DISCORD_TOKEN in env. Exiting.");
    process.exit(1);
  }
  client.login(process.env.DISCORD_TOKEN);
});
