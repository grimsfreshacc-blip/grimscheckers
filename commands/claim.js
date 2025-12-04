const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { loadCosmetics } = require("../utils/cosmetics");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("claim")
    .setDescription("Mark a cosmetic as owned by you (use a backend id or cosmetic id).")
    .addStringOption(o => o.setName("id").setDescription("Backend id or cosmetic id (e.g. CID_028 or br_renegade_raider)").setRequired(true)),

  async execute(interaction) {
    const idRaw = interaction.options.getString("id");
    const id = idRaw.toLowerCase().trim();
    const cosmetics = await loadCosmetics();

    // resolve name for friendly message
    const meta = cosmetics[id] || (Object.values(cosmetics).find(v => v.name && v.name.toLowerCase().includes(id))) || null;
    const displayName = meta ? (meta.name || idRaw) : idRaw;

    const userFile = path.join(__dirname, "..", "data", `${interaction.user.id}.json`);
    let store = { owned: {} };
    if (fs.existsSync(userFile)) store = JSON.parse(fs.readFileSync(userFile));
    store.owned = store.owned || {};
    store.owned[id] = { id, name: displayName, addedAt: Date.now() };
    fs.writeFileSync(userFile, JSON.stringify(store, null, 2));

    await interaction.reply({ content: `✅ Marked **${displayName}** as owned. Use /lockerfull to see cards.`, ephemeral: true });
  }
};
