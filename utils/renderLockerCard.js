import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import path from "path";

/**
 * Rift-style locker card renderer.
 * Accepts either:
 *  - { items: ["cid_028","bid_123", ...], username, level }
 *  - { username, level, skins:[], backblings:[], emotes:[], pickaxes:[], gliders:[], exclusives:[] }
 *
 * Returns: PNG Buffer
 */
export async function renderLockerCard(data = {}) {
  // load cosmetics DB (optional, used to infer types & names)
  const cosmeticsPath = path.join(process.cwd(), "data", "cosmetics.json");
  let cosmetics = {};
  try {
    if (fs.existsSync(cosmeticsPath)) {
      cosmetics = JSON.parse(fs.readFileSync(cosmeticsPath, "utf8"));
    }
  } catch (e) { cosmetics = {}; }

  // Helper to normalize incoming data into categories
  const categories = {
    skins: [],
    backblings: [],
    emotes: [],
    pickaxes: [],
    gliders: [],
    exclusives: []
  };

  // If user passed a single array of items, try to categorize via cosmetics DB entries
  if (Array.isArray(data.items)) {
    for (const idRaw of data.items) {
      const id = String(idRaw).toLowerCase();
      const meta = cosmetics[id] || cosmetics[idRaw] || null;
      const type = (meta && (meta.type || meta.backend || "") || "").toLowerCase();

      if (type.includes("outfit") || type.includes("character") || id.startsWith("cid")) categories.skins.push({ id, name: meta?.name || id });
      else if (type.includes("backpack") || type.includes("backbling")) categories.backblings.push({ id, name: meta?.name || id });
      else if (type.includes("dance") || type.includes("emote")) categories.emotes.push({ id, name: meta?.name || id });
      else if (type.includes("pickaxe") || type.includes("harvesting")) categories.pickaxes.push({ id, name: meta?.name || id });
      else if (type.includes("glider") || type.includes("contrail")) categories.gliders.push({ id, name: meta?.name || id });
      else {
        // fallback: treat legendary-like names as exclusives heuristically
        const nameLow = (meta?.name || id).toLowerCase();
        if (["galaxy","ikonik","renegade","aerial","honor","promo","travis","founder","preorder"].some(k => nameLow.includes(k) || id.includes(k))) {
          categories.exclusives.push({ id, name: meta?.name || id });
        } else {
          categories.skins.push({ id, name: meta?.name || id });
        }
      }
    }
  } else {
    // If structured categories were provided, copy them over (expect arrays of ids or objects)
    for (const k of Object.keys(categories)) {
      if (Array.isArray(data[k])) {
        categories[k] = data[k].map(x => (typeof x === "string" ? { id: String(x).toLowerCase(), name: (cosmetics[String(x).toLowerCase()]?.name || x) } : x));
      }
    }
  }

  // If username/level provided, use them
  const username = data.username || data.user || "Player";
  const level = typeof data.level !== "undefined" ? data.level : (data.accountLevel || "");

  // Canvas layout params
  const width = 1400;
  const sectionHeight = 160; // each category block height
  const headerHeight = 140;
  const sectionsToRender = ["skins", "backblings", "emotes", "pickaxes", "gliders", "exclusives"];
  const height = headerHeight + sectionHeight * sectionsToRender.length + 60;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#0b1220");
  grad.addColorStop(1, "#07101a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Header area
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px Sans";
  ctx.fillText(`${username}'s Locker`, 40, 60);

  ctx.font = "24px Sans";
  if (level !== "") ctx.fillText(`Account Level: ${level}`, 40, 96);

  // small watermark / credit
  ctx.font = "16px Sans";
  ctx.fillStyle = "#9aa7b2";
  ctx.fillText("Fortnite Locker • Safe Viewer", width - 320, 36);

  // Draw each section
  const iconSize = 110;
  const paddingX = 40;
  const paddingY = 20;
  const gap = 12;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let baseY = headerHeight - 20;

  for (const sectionKey of sectionsToRender) {
    const items = categories[sectionKey] || [];
    baseY += paddingY;

    // Section title
    ctx.fillStyle = "#cfe9ff";
    ctx.font = "700 26px Sans";
    const titlePretty = sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
    ctx.fillText(titlePretty, paddingX, baseY);

    // Draw small count on right
    ctx.fillStyle = "#9aa7b2";
    ctx.font = "600 18px Sans";
    ctx.fillText(`${items.length} items`, width - 160, baseY);

    // Icons start position
    let x = paddingX;
    let y = baseY + 36;

    // draw up to 18 per section
    const drawList = items.slice(0, 18);

    for (const it of drawList) {
      const id = (it && it.id) ? it.id : String(it).toLowerCase();
      const iconFile = path.join(process.cwd(), "data", "images", `${id}.png`);
      const fallback = path.join(process.cwd(), "data", "default.png");

      let imgPath = fallback;
      if (fs.existsSync(iconFile)) imgPath = iconFile;
      else {
        // try cosmetics DB for an image URL (not used here) — fallback remains default
        // we only draw local files to avoid remote fetch cost
      }

      try {
        // draw icon with slight rounded background box
        ctx.fillStyle = "rgba(255,255,255,0.04)";
        ctx.fillRect(x - 6, y - 6, iconSize + 12, iconSize + 12);

        const img = await loadImage(imgPath);
        ctx.drawImage(img, x, y, iconSize, iconSize);

        // small label under icon (shortened)
        ctx.font = "12px Sans";
        ctx.fillStyle = "#cbd5e1";
        const name = (it && it.name) ? String(it.name) : id;
        const short = name.length > 18 ? (name.slice(0, 15) + "...") : name;
        ctx.fillText(short, x, y + iconSize + 6);

      } catch (e) {
        // ignore single image errors
      }

      x += iconSize + gap;
      if (x + iconSize > width - paddingX) {
        x = paddingX;
        y += iconSize + 36; // move to next row
      }
    }

    // move baseY to next section start (estimate)
    baseY = y + iconSize + 20;
  }

  return canvas.toBuffer("image/png");
}
