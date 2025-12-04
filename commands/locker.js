const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLocker } = require('../utils/fortniteAPI');
const { renderLockerCard } = require('../utils/renderCard');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('locker')
        .setDescription('View your Fortnite locker'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Fetch locker data from DB + Epic API
            const locker = await getLocker(interaction.user.id);

            if (!locker) {
                return interaction.editReply("❌ You are not logged in. Use **/login** first.");
            }

            // Render the Rift-style locker card URL
            const imageURL = await renderLockerCard(locker);

            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username}'s Locker`)
                .setColor('#2ECC71')
                .setDescription(
                    `**Skins:** ${locker.skins.length}\n` +
                    `**Backblings:** ${locker.backblings.length}\n` +
                    `**Pickaxes:** ${locker.pickaxes.length}\n` +
                    `**Gliders:** ${locker.gliders.length}\n` +
                    `**Emotes:** ${locker.emotes.length}\n` +
                    `**Wraps:** ${locker.wraps.length}`
                )
                .setImage(imageURL)
                .setFooter({ text: "Updated from your Epic Games account" });

            return interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return interaction.editReply("❌ Error loading locker.");
        }
    }
};
