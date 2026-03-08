import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

let ads = [];

/* GET ADS */

app.get("/api/ads", (req, res) => {
  res.json(ads);
});

/* POST AD */

app.post("/api/ads", (req, res) => {
  const ad = {
    id: Date.now(),
    ...req.body
  };

  ads.push(ad);

  res.json({
    message: "Ad created",
    ad
  });
});

/* ROOT */

app.get("/", (req, res) => {
  res.send("RentWala API Running");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
