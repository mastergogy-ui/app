import express from "express";

const router = express.Router();

let ads = [];

/* CREATE LISTING (POST AD) */
router.post("/", async (req, res) => {
  try {
    const { title, price, category, location, description } = req.body;

    const ad = {
      id: Date.now().toString(),
      title,
      price,
      category,
      location,
      description,
      createdAt: new Date()
    };

    ads.push(ad);

    res.status(201).json({
      success: true,
      ad
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

/* GET ALL LISTINGS */
router.get("/listings", async (req, res) => {
  res.json(ads);
});

export default router;
