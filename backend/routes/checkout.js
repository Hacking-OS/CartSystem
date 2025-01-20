const express = require('express');
const myConnection = require("../connection");
const Token = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const router = express.Router();
const authentication = require("../services/authentication");
const CheckRole = require("../services/checkRole");

router.post("/remove", (req, res) => {
    let user = req.body;
    query = "DELETE FROM user_cart WHERE  cartId=?";
    myConnection.query(query, [user.id], (err, results) => {
        if (err) {
            return res.status(500).json(err);
        } else {
          return res.status(200).json({message:"Cart Item Deleted Successfully!"});
        }
    });
});


router.get("/get/:id",authentication.authenticateToken, (req, res) => {
  const id= req.params.id;
var query="SELECT user_cart.cartId,user_cart.user_id,user_cart.total_price as total,user_cart.quantity,product.id,product.name,product.price,product.description,product.categoryId,category.name as category,product.status FROM product INNER JOIN category ON product.categoryId = category.id INNER JOIN user_cart ON product.id = user_cart.product_id and user_cart.userCheckOut=1 and user_cart.user_id=?;";

myConnection.query(query,[id],(err, results) => {
    if(err){
        return res.status(500).json(err);
    }else{
      if(results.length!==0){
        var query="SELECT sum(total_price) as finalTotal from user_cart where user_id=? and userCheckOut=?";
        myConnection.query(query,[results[0].user_id,1],(errs, result) => {
          if(errs){
            return res.status(500).json(errs);
        }else{
          // results.push(result);
          return res.status(200).json({result:results,resultPriceTotal:result[0].finalTotal});
      }
    });
      }else{
        return res.status(200).json({result:0,resultPriceTotal:0});
      }

}
});
});


router.post("/checkout",authentication.authenticateToken, (req, res) => {
  let user = req.body;
var query="UPDATE user_cart SET userCheckOut=1 WHERE user_id=?";
myConnection.query(query,[user.id],(err, results) => {
    if(err){
        return res.status(500).json(err);
    }else{
              return res.status(200).json({message:"Added To checkout Option , to purchase, confirm the payment soon as possible!"});
    }
});
});

module.exports = router;
