import { createCanvas, loadImage } from "canvas";
import path from "path";
import fs from "fs";

export async function renderLockerCard(data) {
  const {
    username = "Unknown Player",
    level = 0,
    skins = [],
    backblings = [],
    pickaxes = [],
    gliders = [],
    emotes = []
  } = data;

  const width = 1400;
  const height = 900;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background (Rift-like dark gradient)
  ctx.fillStyle = "#121820";
  ctx.fillRect(0, 0, width, height);

  // Header
  ctx.fillStyle = "white";
  ctx.font = "bold 42px Arial";
  ctx.fillText(`${username}'s Locker`, 50, 60);

  ctx.font = "28px Arial";
  ctx.fillText(`Account Level: ${level}`, 50, 110);

  // Section labels
  ctx.font = "32px Arial Black";
  ctx.fillText("Skins", 50, 170);
  ctx.fillText("Backblings", 50, 400);
  ctx.fillText("Pickaxes", 50, 630);

  async function drawItems(list, startY) {
    const size = 90;
    const gap = 10;

    let x = 50;
    let y = startY;

    for (const item of list.slice(0, 12)) {
      const iconPath = path.join(process.cwd(), "data", "images", `${item.id}.png`);
      const fallback = path.join(process.cwd(), "data", "default.png");

      let img;

      try {
        img = await loadImage(fs.existsSync(iconPath) ? iconPath : fallback);
      } catch {
        img = await loadImage(fallback);
      }

      ctx.drawImage(img, x, y, size, size);

      x += size + gap;
      if (x + size > width - 50) {
        x = 50;
        y += size + gap;
      }
    }
  }

  await drawItems(skins, 190);
  await drawItems(backblings, 420);
  await drawItems(pickaxes, 650);

  return canvas.toBuffer("image/png");
}
