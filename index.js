import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { init as initDb } from "./lib/db.js";
import authRouter from "./routes/auth.js";
import fortniteRouter from "./routes/fortnite.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// init DB
await initDb();

// routes
app.use("/auth", authRouter);
app.use("/fortnite", fortniteRouter);

// health
app.get("/", (req, res) => res.send("Fortnite Rift Bot API"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
