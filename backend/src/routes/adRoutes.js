import express from "express";

const router = express.Router();

// POST /api/ads
router.post("/", async (req, res) => {
  try {

    const { title, price, category, location, description } = req.body;

    console.log("Received Ad:", req.body);

    const ad = {
      title,
      price,
      category,
      location,
      description,
      createdAt: new Date()
    };

    res.status(201).json({
      message: "Ad created successfully",
      ad
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/ads
router.get("/", async (req, res) => {
  res.json([]);
});

export default router;
