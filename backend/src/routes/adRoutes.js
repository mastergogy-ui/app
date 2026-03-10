
import express from "express";
import Ad from "../models/Ad.js";
import upload from "../middleware/upload.js";

const router = express.Router();



/* CREATE AD WITH IMAGE */

router.post("/", upload.single("image"), async (req, res) => {

  try {

    const { title, description, price, location } = req.body;

    const imageUrl = req.file ? req.file.path : "";

    const ad = new Ad({
      title,
      description,
      price,
      location,
      image: imageUrl
    });

    await ad.save();

    res.json(ad);

  } catch (err) {

    console.log(err);
    res.status(500).json({ message: "Failed to create ad" });

  }

});



/* GET ALL ADS */

router.get("/", async (req, res) => {

  try {

    const ads = await Ad.find().sort({ createdAt: -1 });

    res.json(ads);

  } catch (err) {

    res.status(500).json({ message: "Failed to fetch ads" });

  }

});



/* GET SINGLE AD */

router.get("/:id", async (req, res) => {

  try {

    const ad = await Ad.findById(req.params.id);

    res.json(ad);

  } catch (err) {

    res.status(500).json({ message: "Ad not found" });

  }

});

export default router;
