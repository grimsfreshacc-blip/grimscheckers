import axios from "axios";
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("locker")
    .setDescription("View your full Fortnite locker (skins, pickaxes, emotes, gliders, etc)."),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const userId = interaction.user.id;

      // Request full locker from your backend
      const lockerRes = await axios.get(
        `${process.env.SERVER_URL}/locker/fetch`,
        { params: { userId } }
      );

      const { accountLevel, items } = lockerRes.data;

      // Format categories
      const skins = items.skins?.length || 0;
      const pickaxes = items.pickaxes?.length || 0;
      const emotes = items.emotes?.length || 0;
      const gliders = items.gliders?.length || 0;
      const backblings = items.backblings?.length || 0;
      const exclusives = items.exclusives?.length || 0;

      const embed = new EmbedBuilder()
        .setTitle("🎒 Your Fortnite Locker")
        .setColor("#00A2FF")
        .setDescription("Here’s everything linked to your account.")
        .addFields(
          { name: "🎭 Skins", value: `${skins}`, inline: true },
          { name: "🪓 Pickaxes", value: `${pickaxes}`, inline: true },
          { name: "💃 Emotes", value: `${emotes}`, inline: true },
          { name: "🪂 Gliders", value: `${gliders}`, inline: true },
          { name: "🎒 Backblings", value: `${backblings}`, inline: true },
          { name: "🌟 Exclusives", value: `${exclusives}`, inline: true }
        )
        .addFields({
          name: "🏆 Account Level",
          value: `${accountLevel}`,
          inline: false
        })
        .setFooter({ text: "Use /logout to remove your login." });

      // Generate preview images for the embed
      const imgRequest = await axios.get(
        `${process.env.SERVER_URL}/renderLocker`,
        {
          params: {
            items: items.skins.slice(0, 9).join(",") // first 9 for preview
          }
        }
      );

      const previewImages = imgRequest.data.images;

      if (previewImages.length > 0) {
        embed.setImage(previewImages[0]);
      }

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error(err?.response?.data || err);
      return interaction.editReply({
        content: "❌ Could not fetch your locker. Did you run `/login` first?",
      });
    }
  }
};
