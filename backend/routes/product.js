const express = require("express");
const router = express.Router();
const authentication = require("../services/authentication");
const checkRole = require("../services/checkRole");
const { Product, Category, UserCart } = require("../database/models");
const { Op } = require("sequelize");

router.post("/add", authentication.authenticateToken, checkRole.CheckRole, async (req, res) => {
  try {
    const payload = req.body.userInput || {};
    await Product.create({
      name: payload.name,
      categoryId: payload.catID,
      description: payload.description,
      price: payload.price,
      status: true,
      image: payload.image || "",
      subCategoryID: payload.subCategoryID || "",
    });
    return res.status(200).json({ message: "Product registered Successfully !" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.post("/addToCart", authentication.authenticateToken, async (req, res) => {
  try {
    const payload = req.body;
    const userId = parseInt(payload.userId, 10);
    const productId = payload.productId;
    const productPrice = payload.productPrice;

    const cartEntry = await UserCart.findOne({
      where: { user_id: userId, product_id: productId, userCheckOut: 0 },
    });

    if (cartEntry) {
      const quantity = cartEntry.quantity + 1;
      const total = productPrice * quantity;
      cartEntry.quantity = quantity;
      cartEntry.total_price = total;
      await cartEntry.save();
      return res.status(200).json({ message: "Updated To Cart Successfully !" });
    }

    await UserCart.create({
      user_id: userId,
      product_id: productId,
      quantity: 1,
      total_price: productPrice,
      userCheckOut: 0,
    });
    return res.status(200).json({ message: "Added To Cart Successfully !" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/get", authentication.authenticateToken, checkRole.CheckRole, async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: "category", attributes: ["name"] }],
    });
    return res.status(200).json(products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      categoryId: p.categoryId,
      category: p.category ? p.category.name : null,
      status: p.status,
    })));
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/getUserProducts", authentication.authenticateToken, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: true },
      include: [{ model: Category, as: "category", attributes: ["name"] }],
    });
    return res.status(200).json(products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      categoryId: p.categoryId,
      category: p.category ? p.category.name : null,
      status: p.status,
    })));
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/getCategoryById/:id", authentication.authenticateToken, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { categoryId: req.params.id, status: true },
    });
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/GetById/:id", authentication.authenticateToken, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, status: true },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.patch("/update", authentication.authenticateToken, checkRole.CheckRole, async (req, res) => {
  try {
    const payload = req.body.userInput || {};
    const [affected] = await Product.update(
      {
        name: payload.name2,
        categoryId: payload.catID2,
        description: payload.description2,
        price: payload.price2,
      },
      { where: { id: payload.ProductId2 } }
    );
    if (!affected) {
      return res.status(404).json({ message: "Invalid Data provided!" });
    }
    return res.status(200).json({ message: "Product Updated Successfully !" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.delete("/delete/:id", authentication.authenticateToken, checkRole.CheckRole, async (req, res) => {
  try {
    const removed = await Product.destroy({ where: { id: req.params.id } });
    if (!removed) {
      return res.status(404).json({ message: "Invalid Data provided!" });
    }
    return res.status(200).json({ message: "Product Deleted Successfully !" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.patch("/updateStatus", authentication.authenticateToken, checkRole.CheckRole, async (req, res) => {
  try {
    const payload = req.body;
    const [affected] = await Product.update(
      { status: payload.status },
      { where: { id: payload.userInput } }
    );
    if (!affected) {
      return res.status(404).json({ message: "Invalid Data provided!" });
    }
    return res.status(200).json({ message: "Product status Updated Successfully !" });
  } catch (error) {
    return res.status(500).json(error);
  }
});
module.exports = router;
