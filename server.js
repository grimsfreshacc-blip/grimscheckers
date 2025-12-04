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

// -----------------------------
// Load cosmetics.json
// -----------------------------
const cosmeticsPath = path.join(process.cwd(), "data", "cosmetics.json");
let cosmetics = [];

if (fs.existsSync(cosmeticsPath)) {
  cosmetics = JSON.parse(fs.readFileSync(cosmeticsPath));
}

// -----------------------------
// API: Start Device Auth Login
// -----------------------------
app.get("/auth/start", (req, res) => {
  res.json({
    message: "Use /login in Discord. This is a backend endpoint only."
  });
});

app.post("/auth/create", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) return res.status(400).json({ error: "Missing authorization code" });

    // Exchange code for access token
    const tokenRes = await axios.post("https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token", new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      token_type: "eg1"
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `basic ${process.env.EPIC_BASIC_TOKEN}`
      }
    });

    const accessToken = tokenRes.data.access_token;

    // Create device auth
    const deviceRes = await axios.post(
      "https://account-public-service-prod.ak.epicgames.com/account/api/oauth/deviceAuthorization",
      {},
      { headers: { Authorization: `bearer ${accessToken}` } }
    );

    res.json({
      deviceAuth: deviceRes.data,
      accountId: tokenRes.data.account_id
    });

  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).json({
      error: "Login failed",
      details: err?.response?.data || err
    });
  }
});

// -----------------------------
// GET COSMETIC IMAGE
// -----------------------------
app.get("/cosmetic/:id.png", (req, res) => {
  const id = req.params.id;
  const imgPath = path.join(process.cwd(), "data", "images", `${id}.png`);

  if (fs.existsSync(imgPath)) {
    res.sendFile(imgPath);
  } else {
    const defaultPath = path.join(process.cwd(), "data", "default.png");
    res.sendFile(defaultPath);
  }
});

// -----------------------------
// Render locker card
// -----------------------------
app.get("/renderLocker", (req, res) => {
  const { items } = req.query;

  if (!items) return res.status(400).send("Missing items");

  const itemList = items.split(",");

  // Return image URLs (your bot will embed them)
  const images = itemList.map((id) => `${process.env.SERVER_URL}/cosmetic/${id}.png`);

  res.json({ images });
});

// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
