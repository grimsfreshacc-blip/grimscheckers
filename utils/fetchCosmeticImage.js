// utils/fetchCosmeticImage.js
import path from "path";
import { fileURLToPath } from "url";

// Make __dirname work in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Returns a file path or URL for a cosmetic image.
 * If the file/URL does not exist, fallback to default.png
 */
export function getCosmeticImage(id) {
  if (!id) {
    return path.join(__dirname, "..", "data", "default.png");
  }

  // Your Fortnite API image URL
  const apiUrl = `https://fortnite-api.com/images/cosmetics/br/${id}/icon.png`;

  return apiUrl;
}
