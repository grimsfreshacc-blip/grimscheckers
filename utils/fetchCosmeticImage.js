import path from "path";
import fs from "fs";

/**
 * Returns a file path to a cosmetic PNG.
 * If the image does not exist, returns default.png
 */
export function getCosmeticImage(id) {
  const imgPath = path.join(process.cwd(), "data", "images", `${id}.png`);
  const defaultPath = path.join(process.cwd(), "data", "default.png`);

  if (fs.existsSync(imgPath)) {
    return imgPath;
  }

  return defaultPath;
}
