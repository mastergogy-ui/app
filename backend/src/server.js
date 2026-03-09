import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

/* TEST DATA */
const ads = [
  {
    _id: "1",
    title: "Laptop for Rent",
    description: "HP laptop good condition",
    price: 500
  },
  {
    _id: "2",
    title: "Camera for Rent",
    description: "Canon DSLR",
    price: 800
  }
];

/* ROUTE */
app.get("/api/ads", (req, res) => {
  res.json(ads);
});

/* SERVER */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
