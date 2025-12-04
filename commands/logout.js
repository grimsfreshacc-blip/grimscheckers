const { SlashCommandBuilder } = require('discord.js');
const { deleteUserAuth } = require('../utils/deviceAuth');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logout')
        .setDescription('Unlink your Fortnite account'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const removed = await deleteUserAuth(interaction.user.id);

            if (!removed) {
                return interaction.editReply("❌ You were not logged in.");
            }

            return interaction.editReply("✅ You have been logged out and your Epic Games account is unlinked.");
        } catch (err) {
            console.error(err);
            return interaction.editReply("❌ Error while logging out.");
        }
    }
};
