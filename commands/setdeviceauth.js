const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setdeviceauth")
    .setDescription("Save your own Device Auth (optional). For your own account only.")
    .addStringOption(o => o.setName("accountid").setDescription("accountId").setRequired(true))
    .addStringOption(o => o.setName("deviceid").setDescription("deviceId").setRequired(true))
    .addStringOption(o => o.setName("secret").setDescription("secret").setRequired(true)),
  async execute(interaction) {
    const accountId = interaction.options.getString("accountid");
    const deviceId = interaction.options.getString("deviceid");
    const secret = interaction.options.getString("secret");
    const outDir = path.join(__dirname, "..", "data");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `${interaction.user.id}.auth.json`), JSON.stringify({ accountId, deviceId, secret, savedAt: Date.now() }, null, 2));
    await interaction.reply({ content: "✅ DeviceAuth saved locally for your account.", ephemeral: true });
  }
};
