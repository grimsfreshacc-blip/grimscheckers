const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("login").setDescription("Start the locker setup flow (in-channel)."),
  async execute(interaction, { client }) {
    const embed = new EmbedBuilder()
      .setTitle("🔐 Locker Setup")
      .setDescription("Follow the prompts to mark which cosmetics you own. We'll create cards for each category when finished.")
      .setColor(0x00A8FF)
      .setFooter({ text: "Only you can modify your saved locker." });

    await interaction.reply({ embeds: [embed] });

    try {
      const lockerCmd = require("./locker");
      await lockerCmd.execute(interaction, { fromLogin: true, client });
    } catch (err) {
      console.error("Error starting locker flow from /login:", err);
      try { await interaction.followUp({ content: "❌ Failed to start locker flow.", ephemeral: true }); } catch (e) {}
    }
  }
};
