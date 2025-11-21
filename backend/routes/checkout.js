const express = require('express');
const router = express.Router();
const authentication = require("../services/authentication");
const { UserCart, Product, Category } = require("../database/models");
const { Op } = require("sequelize");

router.post("/remove", async (req, res) => {
  try {
    await UserCart.destroy({ where: { cartId: req.body.id } });
    return res.status(200).json({ message: "Cart Item Deleted Successfully!" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/get/:id", authentication.authenticateToken, async (req, res) => {
  try {
    const items = await UserCart.findAll({
      where: { user_id: req.params.id, userCheckOut: 1 },
      include: [
        {
          model: Product,
          as: "product",
          include: [{ model: Category, as: "category", attributes: ["name"] }],
        },
      ],
    });

    if (!items.length) {
      return res.status(200).json({ result: 0, resultPriceTotal: 0 });
    }

    const total = items.reduce((sum, item) => sum + item.total_price, 0);

    return res.status(200).json({
      result: items.map((row) => ({
        cartId: row.cartId,
        user_id: row.user_id,
        total: row.total_price,
        quantity: row.quantity,
        id: row.product.id,
        name: row.product.name,
        price: row.product.price,
        description: row.product.description,
        categoryId: row.product.categoryId,
        category: row.product.category ? row.product.category.name : null,
        status: row.product.status,
      })),
      resultPriceTotal: total,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/checkout", authentication.authenticateToken, async (req, res) => {
  try {
    await UserCart.update(
      { userCheckOut: 1 },
      { where: { user_id: req.body.id, userCheckOut: { [Op.ne]: 2 } } }
    );
    return res.status(200).json({
      message: "Added to checkout option, confirm payment as soon as possible!",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
