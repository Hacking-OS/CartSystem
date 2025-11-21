
const express = require("express");
const router = express.Router();
const authentication = require("../services/authentication");
const checkRole = require("../services/checkRole");
const { Category } = require("../database/models");

router.post("/add", authentication.authenticateToken, checkRole.CheckRole, async (req, res) => {
  try {
    const category = await Category.create({ name: req.body.catName });
    return res.status(200).json({ message: "Category registered Successfully !", category });
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/get", authentication.authenticateToken, checkRole.CheckRole, async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [["name", "ASC"]] });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.get("/getUserCategory", authentication.authenticateToken, async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [["name", "ASC"]] });
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json(error);
  }
});

router.patch("/update", authentication.authenticateToken, checkRole.CheckRole, async (req, res) => {
  try {
    const [affected] = await Category.update({ name: req.body.name }, { where: { id: req.body.id } });
    if (!affected) {
      return res.status(404).json({ message: "Invalid Data provided!" });
    }
    return res.status(200).json({ message: "Category Updated Successfully !" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
