const express = require("express");
const myConnection = require("../connection");
const router = express.Router();
const authentication = require("../services/authentication");


router.get("/cart", authentication.authenticateToken, (req, res) => {
    query = "SELECT SUM(user_cart.quantity) as total FROM product INNER JOIN category ON product.categoryId = category.id INNER JOIN user_cart ON product.id = user_cart.product_id and user_cart.userCheckOut=0 and product.status=1;";
    myConnection.query(query,(err, data) => {
      if (err) {
          console.log(err);
          return res.status(500).json(err);
      } else {
          return res.status(200).json(data);
      }
});
});

router.get("/checkout/:id", authentication.authenticateToken, (req, res) => {
    query = "SELECT SUM(user_cart.quantity) as total FROM product INNER JOIN category ON product.categoryId = category.id INNER JOIN user_cart ON product.id = user_cart.product_id INNER JOIN users ON users.id=user_cart.user_id and user_cart.userCheckOut=1 and product.status=1 and users.id=?";
      myConnection.query(query,[req.params.id],(err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        } else {
            return res.status(200).json(data);
        }
});
});

router.get("/bill/:id", authentication.authenticateToken, (req, res) => {
    query = "SELECT count(bill.id) as total FROM bill where bill.userId=?;";
    myConnection.query(query,[req.params.id],(err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        } else {
            return res.status(200).json(data);
        }
});
});


router.get("/Adminbill/:id", authentication.authenticateToken, (req, res) => {
    query = "SELECT count(bill.id) as total FROM bill;";
    // ,[req.params.id]
    myConnection.query(query,(err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        } else {
            return res.status(200).json(data);
        }
});
});

module.exports = router;
