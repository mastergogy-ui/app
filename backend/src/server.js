const express = require("express");
import dotenv from 'dotenv'; 

import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  const adRoutes = require("./routes/adRoutes");
});
