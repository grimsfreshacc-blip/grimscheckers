import express from "express";
import axios from "axios";
import { query } from "../lib/db.js";
const router = express.Router();

const DEVICE_AUTH_URL = "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/deviceAuthorization";
const TOKEN_URL = "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token";

router.post("/generate-device", async (req, res) => {
  try {
    const resp = await axios.post(DEVICE_AUTH_URL, null, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": process.env.EPIC_BASIC_TOKEN
      }
    });

    // resp.data contains user_code, verification_uri, device_code, interval, expires_in, etc.
    res.json(resp.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "failed to generate device code" });
  }
});

// Poll token using device code. BotGhost or your backend can call this repeatedly.
router.post("/poll-device", async (req, res) => {
  const { device_code, discord_id } = req.body;
  try {
    const resp = await axios.post(TOKEN_URL,
      `grant_type=device_code&device_code=${encodeURIComponent(device_code)}`,
      { headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": process.env.EPIC_BASIC_TOKEN } }
    );

    const tokenData = resp.data; // access_token, refresh_token, expires_in, account_id ? check payload

    // store token in DB connected to discord user id (optional)
    if (discord_id) {
      await query(
        `INSERT INTO user_tokens (discord_id, epic_account_id, access_token, refresh_token, expires_at)
         VALUES ($1,$2,$3,$4, NOW() + ($5 || ' seconds')::interval)
         ON CONFLICT (discord_id) DO UPDATE
         SET access_token = EXCLUDED.access_token, refresh_token = EXCLUDED.refresh_token, expires_at = EXCLUDED.expires_at;`,
        [discord_id, tokenData.account_id || null, tokenData.access_token, tokenData.refresh_token, tokenData.expires_in]
      );
    }

    res.json(tokenData);
  } catch (err) {
    // if still pending or not yet approved, epic returns an error we should propagate
    const data = err.response?.data || { error: "pending" };
    res.status(400).json(data);
  }
});

export default router;
