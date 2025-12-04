const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
const { loadCosmetics } = require("../utils/cosmetics");

module.exports = {
  data: new SlashCommandBuilder().setName("lockerfull").setDescription("Render PNG cards (skins, pickaxes, backblings, emotes, gliders) from your claimed cosmetics."),
  async execute(interaction) {
    await interaction.deferReply();
    const userFile = path.join(__dirname, "..", "data", `${interaction.user.id}.json`);
    if (!fs.existsSync(userFile)) {
      await interaction.editReply("You have no claimed items. Use /locker to add cosmetics you own.");
      return;
    }
    const store = JSON.parse(fs.readFileSync(userFile));
    const owned = store.owned || {};
    if (Object.keys(owned).length === 0) {
      await interaction.editReply("You have no claimed items. Use /locker to add cosmetics you own.");
      return;
    }

    const cosmetics = await loadCosmetics();
    const byType = { skins: [], backblings: [], pickaxes: [], emotes: [], gliders: [], exclusives: [] };

    for (const idKey of Object.keys(owned)) {
      const meta = cosmetics[idKey] || Object.values(cosmetics).find(v => v.name && v.name.toLowerCase() === (owned[idKey].name || "").toLowerCase()) || null;
      const t = (meta && meta.type || "").toLowerCase();
      if (t.includes("outfit") || t.includes("character") || idKey.startsWith("cid")) byType.skins.push({ id: idKey, meta });
      else if (t.includes("backpack") || idKey.includes("backpack")) byType.backblings.push({ id: idKey, meta });
      else if (t.includes("pickaxe") || idKey.includes("pickaxe")) byType.pickaxes.push({ id: idKey, meta });
      else if (t.includes("emote") || idKey.includes("dance")) byType.emotes.push({ id: idKey, meta });
      else if (t.includes("glider") || idKey.includes("glider")) byType.gliders.push({ id: idKey, meta });
      else byType.skins.push({ id: idKey, meta });
      // exclusives heuristic
      const nameLow = (meta && meta.name || "").toLowerCase();
      if (["galaxy","ikonik","renegade","aerial","honor","promo","travis"].some(k => nameLow.includes(k) || idKey.includes(k))) {
        byType.exclusives.push({ id: idKey, meta });
      }
    }

    async function generateCard(title, items) {
      if (!items || items.length === 0) return null;
      const icons = [];
      for (const it of items.slice(0, 30)) {
        const iconUrl = (it.meta && it.meta.icon) || null;
        if (!iconUrl) continue;
        try { const img = await Jimp.read(iconUrl); icons.push({ img, name: (it.meta && it.meta.name) || it.id }); } catch(e) {}
      }
      const thumb = 128; const cols = 6; const padding = 8;
      const rows = Math.max(1, Math.ceil(icons.length / cols));
      const width = cols * thumb + (cols + 1) * padding;
      const height = rows * thumb + (rows + 1) * padding + 60;
      const bg = new Jimp(width, height, 0x0f172aff);
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
      bg.print(font, 12, 8, `${title} • ${items.length}`);
      for (let i = 0; i < icons.length; i++) {
        const col = i % cols; const row = Math.floor(i / cols);
        const x = padding + col * (thumb + padding);
        const y = padding + 50 + row * (thumb + padding);
        const thumbImg = icons[i].img.clone();
        thumbImg.cover(thumb, thumb);
        bg.composite(thumbImg, x, y);
      }
      const outDir = path.join(__dirname, "..", "tmp");
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, `${interaction.user.id}_${title.replace(/[^\w]/g,'_')}_${Date.now()}.png`);
      await bg.quality(90).writeAsync(outPath);
      return outPath;
    }

    const skinsCard = await generateCard("Skins", byType.skins);
    const backblingsCard = await generateCard("Backblings", byType.backblings);
    const pickaxesCard = await generateCard("Pickaxes", byType.pickaxes);
    const emotesCard = await generateCard("Emotes", byType.emotes);
    const glidersCard = await generateCard("Gliders", byType.gliders);
    const exclusivesCard = await generateCard("Exclusives", byType.exclusives);

    const embeds = [];
    const files = [];
    embeds.push({ title: `${interaction.user.username}'s Locker (claimed)`, description: `Items: ${Object.keys(owned).length}`, color: 3447003 });

    function pushAttachment(title, localPath) {
      if (!localPath) { embeds.push({ title, description: "No items in this category", color: 10181046 }); return; }
      const name = path.basename(localPath);
      files.push({ attachment: fs.readFileSync(localPath), name });
      embeds.push({ title, image: { url: `attachment://${name}` }, color: 10181046 });
    }

    pushAttachment("👤 Skins", skinsCard);
    pushAttachment("🎒 Backblings", backblingsCard);
    pushAttachment("⛏ Pickaxes", pickaxesCard);
    pushAttachment("💃 Emotes", emotesCard);
    pushAttachment("🪂 Gliders", glidersCard);
    pushAttachment("⭐ Exclusives", exclusivesCard);

    await interaction.editReply({ embeds, files });

    setTimeout(() => {
      try { fs.readdirSync(path.join(__dirname,"..","tmp")).forEach(f => fs.unlinkSync(path.join(__dirname,"..","tmp",f))); } catch(e){}
    }, 30_000);
  }
};
