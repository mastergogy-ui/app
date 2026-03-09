import express from "express";
import cors from "cors";
import adRoutes from "./routes/adRoutes.js";
const app = express();

app.use(cors({
origin: "*",
methods: ["GET","POST","PUT","DELETE"],
credentials: true
}));

app.use(express.json());
app.use("/api/ads",adRoutes);
export default app;
