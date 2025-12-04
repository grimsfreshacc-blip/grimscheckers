const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CACHE_FILE = path.join(__dirname, "..", "data", "cosmetics_cache.json");

async function loadCosmetics() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, "utf8");
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {}

  try {
    const res = await axios.get("https://fortnite-api.com/v2/cosmetics/br");
    const lookup = {};
    if (res.data && res.data.data) {
      for (const entry of res.data.data) {
        if (!entry.id) continue;
        const idKey = entry.id.toLowerCase();
        lookup[idKey] = {
          name: entry.name,
          rarity: entry.rarity?.value || null,
          icon: entry.images?.icon || entry.images?.featured || null,
          type: entry.type?.value || null,
          backend: entry.backendValue ? entry.backendValue.toLowerCase() : null
        };
        if (entry.backendValue) lookup[entry.backendValue.toLowerCase()] = lookup[idKey];
      }
    }
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(lookup, null, 2));
    return lookup;
  } catch (err) {
    console.error("Failed to fetch cosmetics DB:", err.message || err);
    return {};
  }
}

module.exports = { loadCosmetics };
