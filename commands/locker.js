import fs from "fs";
import path from "path";
import axios from "axios";
import {
  SlashCommandBuilder,
  AttachmentBuilder
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("locker")
  .setDescription("View your Fortnite locker card.");

export async function execute(interaction) {
  await interaction.deferReply();

  const userFile = path.join(process.cwd(), "data", "users", `${interaction.user.id}.json`);

  if (!fs.existsSync(userFile)) {
    return interaction.editReply("❌ You are not logged in. Use `/login` first.");
  }

  const user = JSON.parse(fs.readFileSync(userFile));

  let locker;
  try {
    const res = await axios.get(`${process.env.SERVER_URL}/locker/fetch`, {
      params: { discordId: interaction.user.id }
    });
    locker = res.data.locker;
  } catch (err) {
    console.error(err);
    return interaction.editReply("❌ Failed to fetch your locker.");
  }

  // Create card
  const cardBody = {
    skin: locker.skin,
    backbling: locker.backbling,
    pickaxe: locker.pickaxe,
    glider: locker.glider,
    emote: locker.emote,
    exclusive: locker.exclusive || []
  };

  let png;
  try {
    const res = await axios.post(
      `${process.env.SERVER_URL}/locker/card`,
      cardBody,
      { responseType: "arraybuffer" }
    );
    png = res.data;
  } catch (err) {
    console.error(err);
    return interaction.editReply("❌ Failed generating your locker card.");
  }

  const attachment = new AttachmentBuilder(Buffer.from(png), {
    name: "locker.png"
  });

  return interaction.editReply({
    content: `🎒 **${interaction.user.username}'s Locker Card**`,
    files: [attachment]
  });
}
