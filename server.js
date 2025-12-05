import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./api/authRoutes.js";
import lockerRoutes from "./api/lockerRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/locker", lockerRoutes);

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});
