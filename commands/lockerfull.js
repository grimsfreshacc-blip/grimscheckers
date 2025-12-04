const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lockerfull")
    .setDescription("Shows the full Fortnite locker from saved device auth"),

  async execute(interaction) {
    await interaction.deferReply();

    // Load device auth
    const authPath = path.join("data", `${interaction.user.id}.json`);
    if (!fs.existsSync(authPath))
      return interaction.editReply("❌ You have not set device auth. Use `/setdeviceauth` first.");

    const deviceAuth = JSON.parse(fs.readFileSync(authPath));

    // ---------------------------------------------
    // STEP 1 — Get an OAuth access token
    // ---------------------------------------------
    let accessToken;
    try {
      const tokenRes = await axios.post(
        "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token",
        new URLSearchParams({
          grant_type: "device_auth",
          account_id: deviceAuth.accountId,
          device_id: deviceAuth.deviceId,
          secret: deviceAuth.secret
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "basic " +
              Buffer.from(`${process.env.EPIC_CLIENT_ID}:${process.env.EPIC_CLIENT_SECRET}`).toString(
                "base64"
              )
          }
        }
      );

      accessToken = tokenRes.data.access_token;
    } catch (err) {
      console.log(err.response?.data);
      return interaction.editReply("❌ Device auth is invalid or expired. Please run `/setdeviceauth` again.");
    }

    // ---------------------------------------------
    // STEP 2 — Fetch Locker Items (safe public API)
    // ---------------------------------------------
    let locker;
    try {
      const res = await axios.get(
        `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile/${deviceAuth.accountId}/client/QueryProfile?profileId=athena&rvn=-1`,
        { headers: { Authorization: `bearer ${accessToken}` } }
      );
      locker = res.data.profileChanges[0].profile.items;
    } catch (err) {
      console.log(err.response?.data);
      return interaction.editReply("❌ Failed to fetch locker.");
    }

    // ---------------------------------------------
    // STEP 3 — Sort items by type
    // ---------------------------------------------
    const skins = [];
    const backblings = [];
    const pickaxes = [];
    const gliders = [];
    const emotes = [];
    const wraps = [];
    const exclusives = [];

    for (const itemId in locker) {
      const item = locker[itemId];
      const type = item.templateId;

      if (type.startsWith("AthenaCharacter")) skins.push(itemId);
      if (type.startsWith("AthenaBackpack")) backblings.push(itemId);
      if (type.startsWith("AthenaPickaxe")) pickaxes.push(itemId);
      if (type.startsWith("AthenaGlider")) gliders.push(itemId);
      if (type.startsWith("AthenaDance")) emotes.push(itemId);
      if (type.startsWith("AthenaItemWrap")) wraps.push(itemId);

      // Example exclusive filter
      if (item.attributes && item.attributes.rarity && item.attributes.rarity === "legendary") {
        exclusives.push(itemId);
      }
    }

    // ---------------------------------------------
    // STEP 4 — Build Embed
    // ---------------------------------------------
    const embed = new EmbedBuilder()
      .setTitle("🎒 Full Fortnite Locker")
      .setColor("#00A8FF")
      .setDescription("Here is everything found on this account:")
      .addFields(
        { name: "👕 Skins", value: `${skins.length} items`, inline: true },
        { name: "🎒 Backblings", value: `${backblings.length} items`, inline: true },
        { name: "⛏ Pickaxes", value: `${pickaxes.length} items`, inline: true },
        { name: "🪂 Gliders", value: `${gliders.length} items`, inline: true },
        { name: "🕺 Emotes", value: `${emotes.length} items`, inline: true },
        { name: "🎨 Wraps", value: `${wraps.length} items`, inline: true },
        { name: "💎 Exclusives", value: `${exclusives.length} items`, inline: true }
      )
      .setFooter({ text: "Fortnite Locker Checker" })
      .setTimestamp();

    // ---------------------------------------------
    // STEP 5 — Send to Discord
    // ---------------------------------------------
    return interaction.editReply({ embeds: [embed] });
  }
};
