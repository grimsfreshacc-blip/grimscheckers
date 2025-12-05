// src/utils/renderLockerCard.js
/**
 * Render locker card buffer.
 * Tries @napi-rs/canvas first, falls back to canvas package.
 *
 * Exports: async function renderLockerCard(locker) -> Buffer (image/png)
 */

import path from "path";
import { fileURLToPath } from "url";
import { getCosmeticImage } from "./fetchCosmeticImage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadCanvasLib() {
  // Prefer @napi-rs/canvas, then canvas
  try {
    const mod = await import("@napi-rs/canvas");
    // @napi-rs/canvas exports createCanvas, loadImage
    return {
      createCanvas: mod.createCanvas,
      loadImage: mod.loadImage,
      lib: "@napi-rs/canvas",
    };
  } catch (e1) {
    try {
      // 'canvas' package
      const mod = await import("canvas");
      // canvas exports createCanvas and loadImage too
      return {
        createCanvas: mod.createCanvas,
        loadImage: mod.loadImage,
        lib: "canvas",
      };
    } catch (e2) {
      throw new Error(
        "No canvas library found. Install either '@napi-rs/canvas' or 'canvas' (see README). " +
          "On your machine/run: npm i @napi-rs/canvas  OR  npm i canvas"
      );
    }
  }
}

/**
 * Normalize image source returned by getCosmeticImage:
 * - If it looks like a URL (starts with http), return as-is;
 * - If a relative path, resolve to absolute using project root (__dirname);
 */
function normalizeImageSource(src) {
  if (!src) return null;
  if (typeof src !== "string") return null;
  const trimmed = src.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // If it's already absolute, use it
  if (path.isAbsolute(trimmed)) return trimmed;
  // else resolve relative to repo root (assumes `data/images/...` or similar)
  // If fetchCosmeticImage returns something like "data/images/file.png" this will point to project root
  return path.join(process.cwd(), trimmed);
}

export async function renderLockerCard(locker = {}) {
  const { createCanvas, loadImage } = await loadCanvasLib();

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

  async function drawCosmetic(label, id, x, y, w = 200, h = 200) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px Sans";
    ctx.fillText(label, x, y);

    const imgSrc = getCosmeticImage(id);
    const normalized = normalizeImageSource(imgSrc);
    if (!normalized) {
      // nothing available
      ctx.fillStyle = "#888";
      ctx.font = "14px Sans";
      ctx.fillText("No image", x, y + 30);
      return;
    }

    try {
      const image = await loadImage(normalized);
      ctx.drawImage(image, x, y + 10, w, h);
    } catch (err) {
      console.error(`renderLockerCard: failed loading image for ${id} -> ${normalized}:`, err);
      // draw placeholder box
      ctx.fillStyle = "#222";
      ctx.fillRect(x, y + 10, w, h);
      ctx.fillStyle = "#777";
      ctx.font = "14px Sans";
      ctx.fillText("Image load failed", x + 10, y + 10 + 20);
    }
  }

  // Draw primary equipped items (if provided)
  if (locker.skin) await drawCosmetic("Skin", locker.skin, 40, 100);
  if (locker.backbling) await drawCosmetic("Backbling", locker.backbling, 280, 100);
  if (locker.pickaxe) await drawCosmetic("Pickaxe", locker.pickaxe, 520, 100);
  if (locker.glider) await drawCosmetic("Glider", locker.glider, 760, 100);
  if (locker.emote) await drawCosmetic("Emote", locker.emote, 1000, 100, 160, 160);

  // Exclusives row if any
  if (Array.isArray(locker.exclusive) && locker.exclusive.length > 0) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "28px Sans";
    ctx.fillText("Exclusives", 40, 360);

    let x = 40;
    let y = 380;
    for (const id of locker.exclusive) {
      const normalized = normalizeImageSource(getCosmeticImage(id));
      try {
        if (normalized) {
          const img = await loadImage(normalized);
          ctx.drawImage(img, x, y, 140, 140);
        } else {
          ctx.fillStyle = "#222";
          ctx.fillRect(x, y, 140, 140);
        }
      } catch (err) {
        console.error(`renderLockerCard: failed loading exclusive ${id}:`, err);
        ctx.fillStyle = "#222";
        ctx.fillRect(x, y, 140, 140);
      }
      x += 160;
      // wrap if necessary
      if (x + 160 > WIDTH - 40) {
        x = 40;
        y += 160 + 20;
      }
    }
  }

  // Optionally add footer or metadata
  ctx.fillStyle = "#888";
  ctx.font = "14px Sans";
  ctx.fillText(
    `Generated at ${new Date().toLocaleString()}`,
    40,
    HEIGHT - 20
  );

  return canvas.toBuffer("image/png");
}
