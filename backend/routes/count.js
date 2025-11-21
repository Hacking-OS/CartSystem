const express = require("express");
const router = express.Router();
const authentication = require("../services/authentication");
const { sequelize, UserCart, Product, Bill } = require("../database/models");
const { Op } = require("sequelize");

router.get("/cart", authentication.authenticateToken, async (req, res) => {
  try {
    const total = await UserCart.sum("quantity", {
      where: { userCheckOut: 0 },
      include: [{ model: Product, as: "product", where: { status: true }, required: true }],
    });
    return res.status(200).json([{ total: total || 0 }]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/checkout/:id", authentication.authenticateToken, async (req, res) => {
  try {
    const total = await UserCart.sum("quantity", {
      where: { userCheckOut: 1, user_id: req.params.id },
      include: [{ model: Product, as: "product", where: { status: true }, required: true }],
    });
    return res.status(200).json([{ total: total || 0 }]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/bill/:id", authentication.authenticateToken, async (req, res) => {
  try {
    const count = await Bill.count({ where: { userId: req.params.id } });
    return res.status(200).json([{ total: count }]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/Adminbill/:id", authentication.authenticateToken, async (req, res) => {
  try {
    const count = await Bill.count();
    return res.status(200).json([{ total: count }]);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
