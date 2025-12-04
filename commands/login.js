const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { generateLoginURL } = require('../utils/deviceAuth');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Login to your Epic Games account'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        try {
            const loginURL = generateLoginURL(interaction.user.id);

            const embed = new EmbedBuilder()
                .setTitle("🔐 Epic Games Login")
                .setDescription(
                    "**Click the button below to login to your Fortnite account.**\n" +
                    "No credentials are ever shared — the login is handled through Epic Games only."
                )
                .setColor("#5865F2");

            await interaction.editReply({
                embeds: [embed],
                components: [{
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 5,
                            label: "Login With Epic",
                            url: loginURL
                        }
                    ]
                }]
            });

        } catch (err) {
            console.error(err);
            return interaction.editReply("❌ Error creating login session.");
        }
    }
};
