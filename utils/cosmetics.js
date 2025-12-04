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
  } catch (e) { /* ignore and refetch */ }

  try {
    const res = await axios.get("https://fortnite-api.com/v2/cosmetics/br");
    const lookup = {};
    if (res.data && res.data.data) {
      for (const entry of res.data.data) {
        if (entry.id) {
          lookup[entry.id.toLowerCase()] = {
            name: entry.name,
            rarity: entry.rarity?.value || null,
            icon: entry.images?.icon || entry.images?.featured || null,
            type: entry.type?.value || null,
            backend: entry.backendValue ? entry.backendValue.toLowerCase() : null
          };
        }
        if (entry.backendValue) {
          lookup[entry.backendValue.toLowerCase()] = lookup[entry.id.toLowerCase()];
        }
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

function resolve(key, lookup) {
  if (!key) return null;
  const k = key.toLowerCase();
  if (lookup[k]) return lookup[k];
  // try partial matches
  for (const lk in lookup) {
    if (lk.includes(k) || k.includes(lk)) return lookup[lk];
  }
  // fallback
  return { name: key.replace(/[:_.]/g, " "), icon: null, rarity: null };
}

module.exports = { loadCosmetics, resolve };
