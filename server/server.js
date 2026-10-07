import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import clothingRoutes from "./routes/clothingRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";

const app = express();

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ClosetIQ API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/clothing", clothingRoutes);

app.use("/api/outfits", outfitRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ClosetIQ server running on port ${PORT}`);
});