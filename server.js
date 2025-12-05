import express from "express";
import axios from "axios";
import cors from "cors";

import { startDeviceAuth, pollDeviceAuth, getLockerData } from "./src/epic.js";

const app = express();
app.use(express.json());
app.use(cors());

// in-memory token storage (no database)
const sessions = {};

app.post("/login", async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const auth = await startDeviceAuth();
    sessions[userId] = { deviceCode: auth.device_code };

    res.json({
      loginUrl: `https://www.epicgames.com/activate?userCode=${auth.user_code}`,
      userCode: auth.user_code,
      expiresIn: auth.expires_in
    });

  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/poll", async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!sessions[userId]) return res.json({ status: "no_session" });

    const token = await pollDeviceAuth(sessions[userId].deviceCode);

    if (token === "authorization_pending") {
      return res.json({ status: "pending" });
    }

    sessions[userId].accessToken = token;
    return res.json({ status: "success" });

  } catch (err) {
    res.json({ status: "error" });
  }
});

app.post("/locker", async (req, res) => {
  try {
    const userId = req.body.userId;
    const session = sessions[userId];

    if (!session || !session.accessToken)
      return res.status(400).json({ error: "Not logged in" });

    const locker = await getLockerData(session.accessToken);

    res.json(locker);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch locker" });
  }
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});
