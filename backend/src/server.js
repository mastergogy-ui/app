import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import adRoutes from "./routes/adRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

/* CONNECT ROUTES */
app.use("/api/ads", adRoutes);

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.send("API running");
});

/* DATABASE */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

/* SERVER */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
