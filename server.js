import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { exchangeCode, getLocker } from "./src/epic.js";
import { renderLockerCard } from "./src/renderer.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// =========================
// LOGIN REDIRECT FROM DISCORD (/login)
// =========================
app.get("/auth/login", (req, res) => {
  const userId = req.query.user;
  if (!userId) return res.send("Missing user ID");

  const redirectUrl =
    `https://www.epicgames.com/id/login?redirectUrl=${process.env.API_URL}/auth/callback?user=${userId}`;

  res.redirect(redirectUrl);
});

// =========================
// EPIC CALLBACK
// =========================
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  const userId = req.query.user;

  if (!code || !userId)
    return res.send("Missing login information.");

  try {
    const accessToken = await exchangeCode(code);

    // DO NOT SAVE ANYTHING — temporary only
    global.tempTokens = global.tempTokens || {};
    global.tempTokens[userId] = accessToken;

    res.send("Login successful. Return to Discord and run /locker");
  } catch (err) {
    console.log(err);
    res.send("Login failed.");
  }
});

// =========================
// LOCKER FETCH API
// =========================
app.get("/api/locker", async (req, res) => {
  const userId = req.query.user;
  if (!userId) return res.json({ error: "No user ID" });

  const token = global.tempTokens?.[userId];
  if (!token) return res.json({ error: "NOT_LOGGED_IN" });

  try {
    const locker = await getLocker(token);

    // Create PNG buffer
    const imageBuffer = await renderLockerCard(locker);

    res.set("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (err) {
    console.log(err);
    res.json({ error: "LOCKER_ERROR" });
  }
});

// START SERVER
app.listen(3000, () => console.log("API online"));
