import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
origin: "*",
methods: ["GET","POST","PUT","DELETE"],
credentials: true
}));

app.use(express.json());

export default app;
