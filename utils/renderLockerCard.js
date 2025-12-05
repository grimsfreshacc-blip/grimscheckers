import { createCanvas, loadImage } from "@napi-rs/canvas";
import path from "path";
import { fileURLToPath } from "url";
import { getCosmeticImage } from "./fetchCosmeticImage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function renderLockerCard(locker) {
  const WIDTH = 1200;
  const HEIGHT = 675;

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0e0e0e";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#fff";
  ctx.font = "40px Sans";
  ctx.fillText("Fortnite Locker Preview", 40, 60);

  async function drawCosmetic(label, id, x, y) {
    ctx.fillStyle = "#fff";
    ctx.font = "28px Sans";
    ctx.fillText(label, x, y);

    const imgPath = getCosmeticImage(id);

    try {
      const image = await loadImage(imgPath);
      ctx.drawImage(image, x, y + 10, 200, 200);
    } catch (e) {
      console.log(`Failed to load image for ${id}`, e);
    }
  }

  if (locker.skin) await drawCosmetic("Skin", locker.skin, 40, 100);
  if (locker.backbling) await drawCosmetic("Backbling", locker.backbling, 260, 100);
  if (locker.pickaxe) await drawCosmetic("Pickaxe", locker.pickaxe, 480, 100);
  if (locker.glider) await drawCosmetic("Glider", locker.glider, 700, 100);
  if (locker.emote) await drawCosmetic("Emote", locker.emote, 920, 100);

  return canvas.toBuffer("image/png");
}
