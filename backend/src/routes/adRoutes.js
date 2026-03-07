import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { title, price, category, location, description } = req.body;

    const newAd = {
      title,
      price,
      category,
      location,
      description
    };

    console.log("New Ad:", newAd);

    res.json({ message: "Ad created", ad: newAd });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  res.json([]);
});

export default router;
