const express = require("express");
const router = express.Router();
const authentication = require("../services/authentication");
const { Category, Product, Bill } = require("../database/models");

router.get("/details", authentication.authenticateToken, async (req, res) => {
  try {
    const [category, product, bill] = await Promise.all([
      Category.count(),
      Product.count(),
      Bill.count(),
    ]);
    return res.status(200).json({ category, product, bill });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;