import express from "express";
import cors from "cors";
import axios from "axios";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Ensure folders exist
// ----------------------------------------------------
const usersDir = path.join(process.cwd(), "data", "users");
if (!fs.existsSync(usersDir)) fs.mkdirSync(usersDir, { recursive: true });

// ----------------------------------------------------
// Load cosmetics.json (used to render /locker)
// ----------------------------------------------------
const cosmeticsPath = path.join(process.cwd(), "data", "cosmetics.json");
let cosmetics = [];

if (fs.existsSync(cosmeticsPath)) {
  cosmetics = JSON.parse(fs.readFileSync(cosmeticsPath));
}

// ----------------------------------------------------
// AUTH: Step 2 — Exchange code → Create Device Auth
// ----------------------------------------------------
app.post("/auth/create", async (req, res) => {
  try {
    const { code, discordId } = req.body;

    if (!code) return res.status(400).json({ error: "Missing authorization code" });
    if (!discordId) return res.status(400).json({ error: "Missing Discord ID" });

    // ------------------------------------------
    // STEP 1 → Exchange authorization code
    // ------------------------------------------
    const tokenRes = await axios.post(
      "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        token_type: "eg1"
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `basic ${process.env.EPIC_BASIC_TOKEN}`
        }
      }
    );

    const accessToken = tokenRes.data.access_token;
    const accountId = tokenRes.data.account_id;

    // ------------------------------------------
    // STEP 2 → Generate Device Auth
    // ------------------------------------------
    const deviceRes = await axios.post(
      "https://account-public-service-prod.ak.epicgames.com/account/api/oauth/deviceAuthorization",
      {},
      { headers: { Authorization: `bearer ${accessToken}` } }
    );

    const deviceAuth = {
      accountId,
      deviceId: deviceRes.data.device_id,
      secret: deviceRes.data.device_secret
    };

    // ------------------------------------------
    // STEP 3 → Save auth to /data/users
    // ------------------------------------------
    const savePath = path.join(usersDir, `${discordId}.json`);

    fs.writeFileSync(savePath, JSON.stringify({
      discordId,
      epic: deviceAuth,
      locker: []
    }, null, 2));

    return res.json({
      success: true,
      message: "Device Auth created",
      accountId,
      deviceAuth
    });

  } catch (err) {
    console.error(err?.response?.data || err);
    return res.status(500).json({
      success: false,
      error: "Epic authentication failed",
      details: err?.response?.data || err
    });
  }
});

// ----------------------------------------------------
// GET COSMETIC IMAGE (like Rift /assets)
// ----------------------------------------------------
app.get("/cosmetic/:id.png", (req, res) => {
  const id = req.params.id;
  const imgPath = path.join(process.cwd(), "data", "images", `${id}.png`);

  if (fs.existsSync(imgPath)) {
    return res.sendFile(imgPath);
  }

  const defaultPath = path.join(process.cwd(), "data", "default.png");
  return res.sendFile(defaultPath);
});

// ----------------------------------------------------
// LOCKER: Fetch items for Discord user
// ----------------------------------------------------
app.get("/locker/fetch", (req, res) => {
  const { discordId } = req.query;

  if (!discordId) return res.status(400).json({ error: "Missing discordId" });

  const file = path.join(usersDir, `${discordId}.json`);

  if (!fs.existsSync(file)) {
    return res.json({ locker: [], epicLinked: false });
  }

  const user = JSON.parse(fs.readFileSync(file));

  return res.json({
    epicLinked: true,
    locker: user.locker || []
  });
});

// ----------------------------------------------------
// LOCKER: Render assets for embed
// ----------------------------------------------------
app.get("/renderLocker", (req, res) => {
  const { items } = req.query;

  if (!items) return res.status(400).send("Missing items");

  const itemList = items.split(",");
  const images = itemList.map(id => `${process.env.SERVER_URL}/cosmetic/${id}.png`);

  return res.json({ images });
});

// ----------------------------------------------------
// Start server
// ----------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
