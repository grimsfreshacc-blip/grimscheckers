import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import axios from "axios";

export const data = new SlashCommandBuilder()
  .setName("login")
  .setDescription("Login to your Fortnite account to link your locker.");

export async function execute(interaction) {
  const loginUrl = `${process.env.SERVER_URL}/auth/start`;

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Login with Epic Games")
      .setStyle(ButtonStyle.Link)
      .setURL(
        `https://www.epicgames.com/id/authorize?client_id=${process.env.EPIC_CLIENT_ID}&response_type=code&redirect_uri=${process.env.EPIC_REDIRECT_URI}`
      )
  );

  await interaction.reply({
    content: "Click the button below to login to Epic Games:",
    components: [row],
    ephemeral: true
  });
}
