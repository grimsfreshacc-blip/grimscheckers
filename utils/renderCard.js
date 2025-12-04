const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const fs = require('fs');

const cosmeticsFolder = path.join(__dirname, "../data/images/");

// Checks if we have an image for the cosmetic
function getCosmeticImage(cosmetic) {
    const file = path.join(cosmeticsFolder, `${cosmetic.id}.png`);
    if (fs.existsSync(file)) return file;

    // Fallback image
    return path.join(__dirname, "../data/default.png");
}

async function renderCategory(ctx, title, items, x, y) {
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(title, x, y);

    let offsetY = y + 20;
    let offsetX = x;

    const size = 80;

    for (const item of items.slice(0, 12)) {
        try {
            const img = await loadImage(getCosmeticImage(item));
            ctx.drawImage(img, offsetX, offsetY, size, size);
        } catch {
            // ignore missing images
        }

        offsetX += size + 10;
        if (offsetX + size > 1200) {
            offsetX = x;
            offsetY += size + 10;
        }
    }
}

/**
 * Creates the Rift-style card image
 */
async function renderLockerCard(locker) {
    const width = 1280;
    const height = 720;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#0D0D0D";
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.font = "bold 44px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Fortnite Locker", 40, 70);

    await renderCategory(ctx, "Skins", locker.skins, 40, 120);
    await renderCategory(ctx, "Backblings", locker.backblings, 40, 300);
    await renderCategory(ctx, "Pickaxes", locker.pickaxes, 40, 480);

    // Export as PNG buffer
    const buffer = canvas.toBuffer("image/png");

    // Save locally (Railway temporary)
    const outputPath = path.join(__dirname, "../data/output.png");
    fs.writeFileSync(outputPath, buffer);

    // Railway will let us serve this file through Express
    return process.env.BASE_URL + "/locker-image";
}

module.exports = { renderLockerCard };
