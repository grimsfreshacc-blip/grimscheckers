import express from "express";
import cors from "cors";
import multer from "multer";
import { parseLocker } from "./parseLocker.js";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Upload locker.json
app.post("/upload", upload.single("locker"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const json = JSON.parse(req.file.buffer.toString());
        const parsed = await parseLocker(json);

        res.json(parsed);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to parse locker" });
    }
});

// Public HTML
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("SERVER READY on port " + PORT));
