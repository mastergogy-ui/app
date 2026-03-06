import express from "express"
import Ad from "../models/Ad.js"

const router = express.Router()

// POST - create new ad
router.post("/listings", async (req, res) => {
  try {
    const ad = new Ad(req.body)
    await ad.save()
    res.json(ad)
  } catch (error) {
    res.status(500).json({ message: "Failed to create ad" })
  }
})


// GET - fetch all ads
router.get("/listings", async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 })
    res.json(ads)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ads" })
  }
})

export default router
