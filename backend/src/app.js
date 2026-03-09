import express from "express";
import cors from "cors";
import adRoutes from "./routes/adRoutes.js";
const app = express();
app.use("/api/ads",adRoutes);
app.use(cors({
origin: "*",
methods: ["GET","POST","PUT","DELETE"],
credentials: true
}));

app.use(express.json());

export default app;
