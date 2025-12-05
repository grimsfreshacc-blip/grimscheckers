import { createCanvas, loadImage } from "@napi-rs/canvas";
import { getCosmeticImage } from "./fetchCosmeticImage.js";

export async function renderLockerCard(locker) {
  const W = 1400;
  const H = 750;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, W, H);

  ctx.font = "40px Sans";
  ctx.fillStyle = "white";
  ctx.fillText("Locker Overview", 40, 60);

  async function draw(label, id, x, y) {
    ctx.font = "28px Sans";
    ctx.fillText(label, x, y);

    if (!id) return;

    try {
      const img = await loadImage(getCosmeticImage(id));
      ctx.drawImage(img, x, y + 10, 200, 200);
    } catch {}
  }

  await draw("Skin", locker.skin, 40, 100);
  await draw("Backbling", locker.backbling, 260, 100);
  await draw("Pickaxe", locker.pickaxe, 480, 100);
  await draw("Glider", locker.glider, 700, 100);
  await draw("Emote", locker.emote, 920, 100);

  return canvas.toBuffer("image/png");
}
