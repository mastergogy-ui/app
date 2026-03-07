import express from "express";

const router = express.Router();

let ads = [];

/* CREATE AD */
router.post("/", (req, res) => {

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

  res.status(201).json(ad);
});

/* GET ALL ADS */
router.get("/", (req, res) => {
  res.json(ads);
});

export default router;
