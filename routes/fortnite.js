import express from "express";
import axios from "axios";
import { query } from "../lib/db.js";
const router = express.Router();

const PROFILE_URL = "https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/game/v2/profile";

async function fetchProfileWithToken(accountId, accessToken) {
  const url = `${PROFILE_URL}/${encodeURIComponent(accountId)}/client/QueryProfile?profileId=athena`;
  const resp = await axios.get(url, { headers: { "Authorization": `bearer ${accessToken}` } });
  return resp.data;
}

router.get("/locker/:discordId", async (req, res) => {
  const discordId = req.params.discordId;
  const dbres = await query("SELECT * FROM user_tokens WHERE discord_id=$1 LIMIT 1", [discordId]);
  const row = dbres.rows[0];
  if (!row) return res.status(404).json({ error: "no linked account" });

  try {
    const profile = await fetchProfileWithToken(row.epic_account_id, row.access_token);
    // parse cosmetics list out of profile
    res.json({ profile });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "failed fetching profile" });
  }
});

export default router;
