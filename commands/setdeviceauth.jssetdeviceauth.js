const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setdeviceauth")
    .setDescription("Save your Fortnite device auth to use with locker commands")
    .addStringOption(opt =>
      opt.setName("accountid").setDescription("Your Fortnite account ID").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("deviceid").setDescription("Your device ID").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("secret").setDescription("Your secret").setRequired(true)
    ),

  async execute(interaction) {
    const accountId = interaction.options.getString("accountid");
    const deviceId = interaction.options.getString("deviceid");
    const secret = interaction.options.getString("secret");

    const dataPath = path.join("data", `${interaction.user.id}.json`);
    const payload = { accountId, deviceId, secret };

    fs.writeFileSync(dataPath, JSON.stringify(payload, null, 2));

    await interaction.reply({
      content: "✅ Device auth saved! You can now run `/lockerfull`",
      ephemeral: true
    });
  }
};
