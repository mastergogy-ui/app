import express from "express";
import cors from "cors";

import adRoutes from "./routes/adRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

app.use(express.json());

/* ROUTES */

app.use("/api/ads", adRoutes);
app.use("/api/auth", authRoutes);

export default app;
