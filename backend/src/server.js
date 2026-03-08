import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import adRoutes from "./routes/adRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

/* TEST ROOT */
app.get("/", (req, res) => {
  res.send("Backend running");
});

/* DATABASE */
mongoose.connect(process.env.MONGO_URI || "")
.then(()=>console.log("MongoDB connected"))
.catch((err)=>console.log("MongoDB error:", err));

/* ADS ROUTES */
app.use("/api/ads", adRoutes);

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
