import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cloudinary from "../cloudinary.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

/* Schema */

const AdSchema = new mongoose.Schema(
{
title: String,
price: String,
category: String,
location: String,
description: String,
image: String
},
{ timestamps: true }
);

const Ad = mongoose.models.Ad || mongoose.model("Ad", AdSchema);


/* GET ADS */

router.get("/", async (req, res) => {

try {

const ads = await Ad.find().sort({ createdAt: -1 });

res.json(ads);

} catch (err) {

res.status(500).json({ error: "Failed to fetch ads" });

}

});


/* CREATE AD */

router.post("/", upload.single("image"), async (req, res) => {

try {

let imageUrl = "";

if (req.file) {

const result = await cloudinary.uploader.upload(req.file.path);

imageUrl = result.secure_url;

}

const ad = new Ad({
title: req.body.title,
price: req.body.price,
category: req.body.category,
location: req.body.location,
description: req.body.description,
image: imageUrl
});

await ad.save();

res.json({ success: true, ad });

} catch (err) {

console.log(err);

res.status(500).json({
error: "Failed to create ad"
});

}

});

export default router;
