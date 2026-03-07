import express from "express"
import cors from "cors"
import adRoutes from "./routes/adRoutes.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/ads", adRoutes)

app.get("/", (req,res)=>{
res.send("API running")
})

app.use((req,res)=>{
res.status(404).json({message:"Route not found"})
})

export default app
