const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder().setName("unlink").setDescription("Remove your saved data."),
  async execute(interaction) {
    const base = path.join(__dirname, "..", "data");
    const auth = path.join(base, `${interaction.user.id}.auth.json`);
    const owned = path.join(base, `${interaction.user.id}.json`);
    try {
      if (fs.existsSync(auth)) fs.unlinkSync(auth);
      if (fs.existsSync(owned)) fs.unlinkSync(owned);
    } catch (e) {}
    await interaction.reply({ content: "✅ Your saved data has been removed.", ephemeral: true });
  }
};
