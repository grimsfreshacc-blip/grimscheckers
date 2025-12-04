import { createCanvas, loadImage } from "@napi-rs/canvas";
import path from "path";
import { getCosmeticImage } from "./fetchCosmeticImage.js";

/**
 * Generates a locker card PNG showing the user's equipped items.
 */
export async function renderLockerCard(locker) {
  const WIDTH = 1200;
  const HEIGHT = 675;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0e0e0e";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "40px Sans";
  ctx.fillText("Fortnite Locker Preview", 40, 60);

  // Draw a cosmetic block helper
  async function drawCosmetic(label, id, x, y) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "28px Sans";
    ctx.fillText(label, x, y);

    // Actual PNG file path or URL
    const imgPath = getCosmeticImage(id);

    try {
      const image = await loadImage(imgPath);
      ctx.drawImage(image, x, y + 10, 200, 200);
    } catch (err) {
      console.error(`Failed loading image for ${id}:`, err);
    }
  }

  // Equipped items
  if (locker.skin)
    await drawCosmetic("Skin", locker.skin, 40, 100);

  if (locker.backbling)
    await drawCosmetic("Backbling", locker.backbling, 260, 100);

  if (locker.pickaxe)
    await drawCosmetic("Pickaxe", locker.pickaxe, 480, 100);

  if (locker.glider)
    await drawCosmetic("Glider", locker.glider, 700, 100);

  if (locker.emote)
    await drawCosmetic("Emote", locker.emote, 920, 100);

  // Exclusives row
  if (locker.exclusive && locker.exclusive.length > 0) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "30px Sans";
    ctx.fillText("Exclusives", 40, 360);

    let x = 40;
    let y = 380;

    for (const id of locker.exclusive) {
      const imgPath = getCosmeticImage(id);

      try {
        const image = await loadImage(imgPath);
        ctx.drawImage(image, x, y, 160, 160);
      } catch (err) {
        console.error(`Failed loading exclusive image for ${id}:`, err);
      }

      x += 180;
    }
  }

  return canvas.toBuffer("image/png");
}
