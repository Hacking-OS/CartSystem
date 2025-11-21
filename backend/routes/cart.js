const express = require('express');
const router = express.Router();
const authentication = require("../services/authentication");
const { UserCart, Product, Category } = require("../database/models");

router.post("/remove", async (req, res) => {
  try {
    const removed = await UserCart.destroy({ where: { cartId: req.body.id } });
    if (!removed) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    return res.status(200).json({ message: "Cart Item Deleted Successfully!" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/get", authentication.authenticateToken, async (req, res) => {
  try {
    const results = await UserCart.findAll({
      where: { userCheckOut: 0 },
      include: [
        {
          model: Product,
          as: "product",
          where: { status: true },
          include: [{ model: Category, as: "category", attributes: ["name"] }],
        },
      ],
    });
    return res.status(200).json(results.map((row) => ({
      cartId: row.cartId,
      total: row.total_price,
      quantity: row.quantity,
      id: row.product.id,
      name: row.product.name,
      price: row.product.price,
      description: row.product.description,
      categoryId: row.product.categoryId,
      category: row.product.category ? row.product.category.name : null,
      status: row.product.status,
    })));
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/getRemoved", authentication.authenticateToken, async (req, res) => {
  try {
    const results = await UserCart.findAll({
      where: { userCheckOut: 0 },
      include: [
        {
          model: Product,
          as: "product",
          where: { status: false },
          include: [{ model: Category, as: "category", attributes: ["name"] }],
        },
      ],
    });
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/checkout", authentication.authenticateToken, async (req, res) => {
  try {
    await UserCart.update(
      { userCheckOut: 1 },
      { where: { user_id: req.body.id, userCheckOut: 0 } }
    );
    return res.status(200).json({
      message: "Added to checkout option, confirm payment as soon as possible!",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
