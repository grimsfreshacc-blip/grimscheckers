require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, REST, Routes, Collection } = require("discord.js");
const express = require("express");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// Register slash commands to Discord
async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  const commands = client.commands.map(cmd => cmd.data.toJSON());

  try {
    if (process.env.GUILD_ID) {
      console.log("⏳ Registering guild commands...");
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log("✅ Registered commands to guild!");
    } else {
      console.log("⏳ Registering global commands...");
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log("🌍 Registered global commands!");
    }
  } catch (error) {
    console.error(error);
  }
}

client.on("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// Run commands
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "❌ Error running command", ephemeral: true });
  }
});

// Express server for Railway
const app = express();
app.get("/", (req, res) => res.send("Bot is alive"));
app.listen(process.env.PORT || 3000, () => {
  console.log("🌐 Express server running");
});

// Start bot
registerCommands().then(() => client.login(process.env.DISCORD_TOKEN));
