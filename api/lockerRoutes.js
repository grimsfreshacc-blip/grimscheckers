import express from "express";
import { getDeviceAuth } from "../utils/deviceStore.js";
import { fetchLocker } from "../utils/fetchLocker.js";
import { renderLocker } from "../utils/renderLocker.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  const auth = getDeviceAuth(userId);
  if (!auth) return res.status(400).json({ error: "User not logged in." });

  try {
    const locker = await fetchLocker(auth);
    const image = await renderLocker(locker);

    res.setHeader("Content-Type", "image/png");
    res.send(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch locker." });
  }
});

export default router;
