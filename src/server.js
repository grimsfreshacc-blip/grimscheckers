import express from "express";
import cors from "cors";
import multer from "multer";
import { parseLocker } from "./parseLocker.js";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Temporary in-memory storage (reset when Render restarts)
const lockerStore = {};

// Upload locker.json from BotGhost
app.post("/upload", upload.single("locker"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const json = JSON.parse(req.file.buffer.toString());
        const parsed = await parseLocker(json);

        // Generate unique ID
        const id = crypto.randomBytes(6).toString("hex");

        // Save the parsed locker
        lockerStore[id] = parsed;

        return res.json({
            success: true,
            id,
            url: `/locker/${id}`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to parse locker" });
    }
});

// Serve HTML page for viewing locker
app.get("/locker/:id", (req, res) => {
    const id = req.params.id;

    if (!lockerStore[id]) {
        return res.status(404).send("Locker not found or expired.");
    }

    res.sendFile("locker.html", { root: "./public" });
});

// API endpoint for HTML to fetch the locker data
app.get("/locker-data/:id", (req, res) => {
    const id = req.params.id;

    if (!lockerStore[id]) {
        return res.status(404).json({ error: "Locker not found." });
    }

    res.json(lockerStore[id]);
});

// Serve everything in /public
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("SERVER READY on port " + PORT));
