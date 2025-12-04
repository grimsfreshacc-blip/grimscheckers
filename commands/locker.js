import fs from "fs";
import path from "path";
import axios from "axios";
import {
  SlashCommandBuilder,
  AttachmentBuilder
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("locker")
  .setDescription("Generate your Fortnite locker card.");

export async function execute(interaction) {
  await interaction.deferReply();

  const userFile = path.join(process.cwd(), "data", "users", `${interaction.user.id}.json`);

  // Check if linked
  if (!fs.existsSync(userFile)) {
    return interaction.editReply("❌ You are not logged in. Use **/login** first.");
  }

  const userData = JSON.parse(fs.readFileSync(userFile));

  // ------------------------------
  // STEP 1 — Fetch locker items
  // ------------------------------
  let lockerRes;
  try {
    lockerRes = await axios.get(`${process.env.SERVER_URL}/locker/fetch`, {
      params: { discordId: interaction.user.id }
    });
  } catch (err) {
    console.error(err?.response?.data || err);
    return interaction.editReply("❌ Failed to fetch your locker from the server.");
  }

  if (!lockerRes.data.epicLinked) {
    return interaction.editReply("❌ You are not linked. Use **/login** first.");
  }

  const items = lockerRes.data.locker;

  if (!items.length) {
    return interaction.editReply("🧪 Your locker is empty. Add items first.");
  }

  // ------------------------------
  // STEP 2 — Generate locker card
  // ------------------------------
  let imageBuffer;
  try {
    const cardRes = await axios.post(
      `${process.env.SERVER_URL}/locker/card`,
      { items },               // <— Sends IDs to backend
      { responseType: "arraybuffer" }
    );

    imageBuffer = Buffer.from(cardRes.data);
  } catch (err) {
    console.error(err?.response?.data || err);
    return interaction.editReply("❌ Failed to render locker card.");
  }

  // ------------------------------
  // STEP 3 — Send final card
  // ------------------------------
  const attachment = new AttachmentBuilder(imageBuffer, { name: "locker.png" });

  return interaction.editReply({
    content: `🎒 **${interaction.user.username}'s Locker**`,
    files: [attachment]
  });
}
