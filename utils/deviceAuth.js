const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/deviceAuth.json');

// Create database file if missing
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({}), 'utf8');
}

function loadDB() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// Generate login URL (official Epic OAuth)
function generateLoginURL(discordId) {
    const state = Buffer.from(
        JSON.stringify({ discordId, time: Date.now() })
    ).toString('base64');

    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.EPIC_CLIENT_ID,
        redirect_uri: process.env.EPIC_REDIRECT_URI,
        scope: "basic_profile",
        state
    });

    return `https://www.epicgames.com/id/authorize?${params.toString()}`;
}

// Save token (after OAuth callback)
function saveUserAuth(discordId, tokenData) {
    const db = loadDB();
    db[discordId] = tokenData;
    saveDB(db);
    return true;
}

// Get saved login
function getUserAuth(discordId) {
    const db = loadDB();
    return db[discordId] || null;
}

// Remove login
function deleteUserAuth(discordId) {
    const db = loadDB();
    if (!db[discordId]) return false;

    delete db[discordId];
    saveDB(db);
    return true;
}

module.exports = {
    generateLoginURL,
    saveUserAuth,
    getUserAuth,
    deleteUserAuth
};
