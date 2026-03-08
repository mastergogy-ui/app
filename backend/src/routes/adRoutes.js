const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema(
{
title: String,
price: String,
category: String,
location: String,
description: String
},
{ timestamps: true }
);

const Ad = mongoose.models.Ad || mongoose.model("Ad", AdSchema);



/* ------------------ GET ALL ADS ------------------ */

router.get("/", async (req, res) => {
try {

const ads = await Ad.find().sort({ createdAt: -1 });

res.json(ads);

} catch (err) {
console.error(err);
res.status(500).json({ error: "Failed to fetch ads" });
}
});



/* ------------------ CREATE AD ------------------ */

router.post("/", async (req, res) => {

try {

console.log("AD RECEIVED:", req.body);

const { title, price, category, location, description } = req.body;

const ad = new Ad({
title,
price,
category,
location,
description
});

await ad.save();

res.json({ success: true, ad });

} catch (err) {

console.error("SAVE ERROR:", err);

res.status(500).json({
error: "Failed to save ad"
});

}

});

module.exports = router;
