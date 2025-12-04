import axios from "axios";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("login")
    .setDescription("Login to Epic Games to link your Fortnite account."),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Step 1 — Request a new device auth session
      const createRes = await axios.post(
        `${process.env.SERVER_URL}/auth/create`,
        { code: "REQUEST-DIRECT-AUTH-CODE-IN-FRONTEND" }
      );

      const device = createRes.data.deviceAuth;

      // This is where the user MUST open the Epic login page:
      const verificationUrl = device.verification_uri_complete;

      const embed = new EmbedBuilder()
        .setTitle("🔐 Epic Games Login")
        .setDescription(
          "Click the button below to log in to your Epic Games account.\n\n" +
          "This will authorize the bot to access your **locker cosmetics** only.\n\n"
        )
        .setColor("#5865F2")
        .addFields(
          {
            name: "Login Link",
            value: `[Click to Login](${verificationUrl})`
          },
          {
            name: "Device Code",
            value: `\`${device.user_code}\``
          }
        )
        .setFooter({ text: "Once you confirm, use /locker" });

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error(err.response?.data || err);
      return interaction.editReply({
        content: "❌ Login failed. Try again.",
        ephemeral: true
      });
    }
  }
};
