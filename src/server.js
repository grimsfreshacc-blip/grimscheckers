import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { parseLocker } from "./parseLocker.js";

const app = express();
app.use(cors());
app.use(express.json());

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Memory upload (BotGhost sends: "locker")
const upload = multer({ storage: multer.memoryStorage() });

// POST /upload for BotGhost
app.post("/upload", upload.single("locker"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No locker.json uploaded" });
        }

        const json = JSON.parse(req.file.buffer.toString());
        const parsed = await parseLocker(json);

        res.json({
            success: true,
            cosmetics: parsed,
        });

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        res.status(500).json({ error: "Failed to parse locker.json" });
    }
});

// Serve HTML page
app.use(express.static(path.join(__dirname, "public")));

// Default route → open skin viewer page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Render port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("SERVER READY on port " + PORT));
