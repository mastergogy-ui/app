import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import adRoutes from "./routes/adRoutes.js";

dotenv.config();

const app = express();

/* CORS FIX */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ROUTES */
app.use("/api/ads", adRoutes);

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.send("API running");
});

/* DB CONNECT */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("Mongo error:", err);
  });

/* START SERVER */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
