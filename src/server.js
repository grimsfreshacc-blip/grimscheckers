import express from "express";
import cors from "cors";
import { parseLocker } from "./parseLocker.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/upload-locker", (req, res) => {
    const locker = req.body;

    if (!locker || !locker.items) {
        return res.status(400).json({ error: "Invalid locker file" });
    }

    const parsed = parseLocker(locker);
    res.json(parsed);
});

app.get("/", (req, res) => {
    res.send("Safe Skinchecker Backend Running");
});

app.listen(3000, () => console.log("Server running on port 3000"));
