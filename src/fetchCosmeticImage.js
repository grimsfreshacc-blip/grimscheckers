export async function getCosmeticImage(templateId) {
    const shortId = templateId.split(":")[1];

    return {
        id: shortId,
        icon: `https://fortnite-api.com/images/cosmetics/br/${shortId}/icon.png`
    };
}
