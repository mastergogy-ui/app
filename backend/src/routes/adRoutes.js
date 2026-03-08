const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage
});

router.post("/ads", upload.single("image"), async (req, res) => {

  try {

    const {
      title,
      description,
      category,
      price,
      city,
      area,
      country
    } = req.body;

    const image = req.file;

    const newAd = {
      title,
      description,
      category,
      price,
      location: `${area}, ${city}, ${country}`,
      image: image ? image.originalname : ""
    };

    console.log("NEW AD:", newAd);

    res.json({
      success: true,
      ad: newAd
    });

  } catch (err) {

    console.log("POST AD ERROR", err);

    res.status(500).json({
      error: "Server error"
    });

  }

});

module.exports = router;
