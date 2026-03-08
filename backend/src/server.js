import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());

/* TEST ROOT */
app.get("/", (req, res) => {
  res.send("Backend running");
});

/* ADS ROUTES */
app.get("/api/ads", (req, res) => {
  res.json([]);
});

app.post("/api/ads", (req, res) => {
  console.log("AD RECEIVED:", req.body);
  res.json({ success: true });
});

/* DATABASE (optional but safe) */
mongoose.connect(process.env.MONGO_URI || "", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=>console.log("MongoDB connected"))
.catch(()=>console.log("MongoDB skipped"));

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
