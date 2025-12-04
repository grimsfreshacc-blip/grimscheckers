import fs from "fs";
import path from "path";
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("logout")
  .setDescription("Unlink your Fortnite account.");

export async function execute(interaction) {
  const file = path.join(process.cwd(), "data", "users", `${interaction.user.id}.json`);

  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    await interaction.reply({ content: "Your Fortnite account has been unlinked.", ephemeral: true });
  } else {
    await interaction.reply({ content: "You are not logged in.", ephemeral: true });
  }
}
