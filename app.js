const express = require("express");
const uploadRoutes = require("./routes/uploadRoutes");
const addressRoutes = require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes");
const Test = require("./models/Test.model");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/upload", uploadRoutes);
// Auth Routes
app.use("/api/auth", authRoutes);

// Test API
app.post("/test", async (req, res) => {
  try {
    const data = await Test.create(req.body);

    res.status(201).json({
      success: true,
      message: "Data Saved Successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = app;