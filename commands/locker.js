const {
    SlashCommandBuilder,
    EmbedBuilder,
    AttachmentBuilder
} = require("discord.js");
const { getLocker } = require("../utils/fortniteAPI");
const { renderLockerCard } = require("../utils/renderCard");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("locker")
        .setDescription("Show your full Fortnite locker (skins, emotes, pickaxes, gliders, etc)."),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const userId = interaction.user.id;
        const users = interaction.client.users_db;

        if (!users[userId] || !users[userId].deviceLogin) {
            return interaction.editReply({
                content: "❌ You are not logged in. Use **/login** first."
            });
        }

        try {
            const accountData = await getLocker(users[userId].deviceLogin);

            if (!accountData) {
                return interaction.editReply("❌ Error fetching locker data.");
            }

            // Render locker card PNG
            const buffer = await renderLockerCard(accountData);
            const attachment = new AttachmentBuilder(buffer, { name: "locker.png" });

            // Embed with categorized sections
            const embed = new EmbedBuilder()
                .setTitle(`${accountData.account.name}'s Fortnite Locker`)
                .setDescription(`Account Level: **${accountData.account.level}**`)
                .setColor("#00A2FF")
                .setThumbnail("https://cdn2.unrealengine.com/Fortnite%2Fheader-logo%2Ffortnite-logo-white-1024x512-1024x512-877c39fa3f5c.png")
                .setImage("attachment://locker.png")
                .addFields(
                    {
                        name: "🎨 Skins",
                        value: accountData.skins.length
                            ? accountData.skins.slice(0, 20).map(s => `• ${s.name}`).join("\n")
                            : "None",
                        inline: true
                    },
                    {
                        name: "🎒 Backblings",
                        value: accountData.backblings.length
                            ? accountData.backblings.slice(0, 20).map(s => `• ${s.name}`).join("\n")
                            : "None",
                        inline: true
                    },
                    {
                        name: "⛏ Pickaxes",
                        value: accountData.pickaxes.length
                            ? accountData.pickaxes.slice(0, 20).map(s => `• ${s.name}`).join("\n")
                            : "None",
                        inline: true
                    },
                    {
                        name: "🪂 Gliders",
                        value: accountData.gliders.length
                            ? accountData.gliders.slice(0, 20).map(s => `• ${s.name}`).join("\n")
                            : "None",
                        inline: true
                    },
                    {
                        name: "🕺 Emotes",
                        value: accountData.emotes.length
                            ? accountData.emotes.slice(0, 20).map(s => `• ${s.name}`).join("\n")
                            : "None",
                        inline: true
                    },
                    {
                        name: "⭐ Exclusives",
                        value: accountData.exclusives.length
                            ? accountData.exclusives.map(x => `• ${x.name}`).join("\n")
                            : "No exclusives found.",
                        inline: false
                    }
                )
                .setFooter({
                    text: "Rift-style Locker • Powered by Epic Device Auth"
                });

            await interaction.editReply({
                embeds: [embed],
                files: [attachment]
            });

        } catch (err) {
            console.error(err);
            interaction.editReply("❌ Failed to load locker.");
        }
    }
};
