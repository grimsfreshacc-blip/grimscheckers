import { createCanvas, loadImage } from "@napi-rs/canvas";
import { getCosmeticImage } from "./getCosmeticImage.js";

export async function renderLocker(locker) {
  const canvas = createCanvas(800, 450);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, 800, 450);

  ctx.fillStyle = "#fff";
  ctx.font = "32px Sans";
  ctx.fillText("Your Locker", 25, 50);

  async function draw(label, id, x) {
    if (!id) return;

    ctx.font = "20px Sans";
    ctx.fillText(label, x, 90);

    try {
      const img = await loadImage(getCosmeticImage(id));
      ctx.drawImage(img, x, 110, 150, 150);
    } catch (err) {
      console.log("Image error:", id);
    }
  }

  await draw("Skin", locker.skin, 25);
  await draw("Backbling", locker.backbling, 200);
  await draw("Pickaxe", locker.pickaxe, 375);
  await draw("Glider", locker.glider, 550);

  return canvas.toBuffer("image/png");
}
