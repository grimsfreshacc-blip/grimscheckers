const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder().setName("listowned").setDescription("List cosmetic items you've marked as owned."),
  async execute(interaction) {
    const file = path.join(__dirname, "..", "data", `${interaction.user.id}.json`);
    if (!fs.existsSync(file)) return interaction.reply({ content: "You have no owned items recorded. Use /locker to add.", ephemeral: true });
    const data = JSON.parse(fs.readFileSync(file));
    const owned = data.owned || {};
    const lines = Object.values(owned).slice(0, 100).map(x => `• ${x.name} (${x.id})`);
    if (lines.length === 0) return interaction.reply({ content: "You have no owned items recorded. Use /locker to add.", ephemeral: true });
    await interaction.reply({ content: `📦 You own (${Object.keys(owned).length}):\n${lines.join("\n")}`, ephemeral: true });
  }
};
