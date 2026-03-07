import express from "express";
import cors from "cors";
import adRoutes from "./routes/adRoutes.js";

const app = express();

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* ROUTES */
app.use("/api/ads", adRoutes);

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.send("API Running");
});

/* NOT FOUND */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
