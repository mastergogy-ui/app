import express from "express";

const router = express.Router();

let ads = [];

/* CREATE AD */
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
    res.status(500).json({ message: "Server error" });
  }
});

/* GET ALL ADS */
router.get("/", async (req, res) => {
  res.json({
    success: true,
    ads
  });
});

export default router;
