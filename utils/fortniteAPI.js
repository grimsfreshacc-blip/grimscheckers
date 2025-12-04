const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { getUserAuth } = require('./deviceAuth');

const cosmeticsPath = path.join(__dirname, '../data/cosmetics.json');

// Load Fortnite cosmetic database (skins, pickaxes, etc.)
let cosmetics = [];

if (fs.existsSync(cosmeticsPath)) {
    cosmetics = JSON.parse(fs.readFileSync(cosmeticsPath, 'utf8'));
} else {
    console.error("❌ Missing data/cosmetics.json");
}

/**
 * Gets user's profile using official OAuth access token
 */
async function getUserProfile(accessToken) {
    try {
        const res = await fetch("https://api.epicgames.dev/fortnite/account/api/public/account", {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) return null;
        return res.json();
    } catch (err) {
        console.error("Profile fetch error:", err);
        return null;
    }
}

/**
 * Fake locker generator (SAFE)
 * You will replace this with the real profile pull once OAuth callback is added.
 */
function generateSafeLocker() {
    // Select random cosmetics for now (testing mode)
    const sample = (type) => cosmetics.filter(c => c.type === type).slice(0, 15);

    return {
        skins: sample("outfit"),
        backblings: sample("backpack"),
        pickaxes: sample("pickaxe"),
        gliders: sample("glider"),
        emotes: sample("emote"),
        wraps: sample("wrap")
    };
}

/**
 * Main function called by /locker
 */
async function getLocker(discordId) {
    const auth = getUserAuth(discordId);
    if (!auth) return null;

    const profile = await getUserProfile(auth.access_token);

    if (!profile) {
        console.log("⚠️ OAuth expired for user", discordId);
        return null;
    }

    // For now, return SAFE placeholder locker
    return generateSafeLocker();
}

module.exports = {
    getLocker
};
