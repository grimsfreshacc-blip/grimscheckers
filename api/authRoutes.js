import express from "express";
import axios from "axios";
import { saveDeviceAuth } from "../utils/deviceStore.js";

const router = express.Router();

// Step 1: redirect user to Epic login
router.get("/login", (req, res) => {
  const user = req.query.user;
  const redirectUri = `${process.env.DOMAIN}/auth/callback?user=${user}`;

  const url =
    "https://www.epicgames.com/id/login?redirectUrl=" +
    encodeURIComponent(`https://www.epicgames.com/id/api/redirect?redirectUrl=${redirectUri}`);

  res.redirect(url);
});

// Step 2: Epic redirects here with code → exchange for device auth
router.get("/callback", async (req, res) => {
  const { code, user } = req.query;

  try {
    const response = await axios.post(
      "https://account-public-service-prod.ol.epicgames.com/account/api/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        token_type: "eg1",
      }),
      {
        auth: {
          username: process.env.EPIC_CLIENT_ID,
          password: process.env.EPIC_CLIENT_SECRET,
        },
      }
    );

    saveDeviceAuth(user, response.data);

    res.send("Login successful. You can return to Discord and run /locker.");
  } catch (err) {
    console.error(err);
    res.status(400).send("Login error");
  }
});

export default router;
