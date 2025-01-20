const express = require("express");
const myConnection = require("../connection");
const router = express.Router();
const authentication = require("../services/authentication");
const checkRole = require("../services/checkRole");


router.post("/add", authentication.authenticateToken, checkRole.CheckRole, (req, res, next) => {
  let product = req.body;
  query = "INSERT INTO product (name,categoryId,description,price,status) values (?,?,?,?,1)";
  myConnection.query(query, [product.userInput.name, product.userInput.catID, product.userInput.description, product.userInput.price], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.status(200).json({
        message: "Product registered Successfully !"
      });
    }
  });
});


router.post("/addToCart", authentication.authenticateToken, (req, res, next) => {
  let product = req.body;

  let query = "SELECT quantity from user_cart where user_id=? and product_id=? and userCheckOut=0";
  myConnection.query(query, [parseInt(product.userId),product.productId], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      if (result.length !== 0) {
        let Quantity = result[0].quantity+1;
        let Total = product.productPrice*Quantity;
        let query = "UPDATE user_cart SET quantity=?,total_price=? WHERE userCheckOut=0 AND user_id=? AND product_id=?";
        myConnection.query(query, [Quantity,Total,parseInt(product.userId),product.productId], (err, results) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            return res.status(200).json({
              message: "Updated To Cart Successfully !"
            });
          }
        });
      }else{
        let Quantity = 1;
        let Total = product.productPrice*Quantity;
        query = "INSERT INTO user_cart (product_id,quantity,total_price,user_id,userCheckOut) values (?,?,?,?,0)";
        myConnection.query(query, [product.productId,Quantity,Total,parseInt(product.userId)], (err, results) => {
          if (err) {
            return res.status(500).json(err);
          } else {
            return res.status(200).json({
              message: "Added To Cart Successfully !",
              response: results
            });
          }
        });

      }
    }
  });
});



router.get("/get", authentication.authenticateToken, checkRole.CheckRole, (req, res, next) => {
  query = "SELECT product.id,product.name,product.price,product.description,product.categoryId,category.name as category,product.status FROM product INNER JOIN category ON product.categoryId = category.id;";
  myConnection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.status(200).json(results);
    }
  });
});



router.get("/check", authentication.authenticateToken, (req, res, next) => {
  query = "SELECT * from users";
  myConnection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.status(200).json({message:"page is refreshed!"});
    }
  });
});





router.get("/getUserProducts", authentication.authenticateToken, (req, res, next) => {
  query = "SELECT product.id,product.name,product.price,product.description,product.categoryId,category.name as category,product.status FROM product INNER JOIN category ON product.categoryId = category.id where product.status=1;";
  myConnection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.status(200).json(results);
    }
  });
});





router.get("/getCategoryById/:id", authentication.authenticateToken, (req, res, next) => {
  let product = req.params.id;
  query = "SELECT * from product where categoryId=? and status=1";
  myConnection.query(query, [product], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.status(200).json(results);
    }
  });
});

router.get("/GetById/:id", authentication.authenticateToken, (req, res, next) => {
  let product = req.params.id;
  query = "SELECT * from product where categoryId=? and status=1";
  myConnection.query(query, [product], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      return res.status(200).json(results[0]);
    }
  });
});


router.patch("/update", authentication.authenticateToken, checkRole.CheckRole, (req, res, next) => {
  let product = req.body;
  query = "UPDATE product SET product.name=?,product.categoryId=?,product.description=?,product.price=? where product.id = ?";
  myConnection.query(query, [product.userInput.name2, product.userInput.catID2, product.userInput.description2, product.userInput.price2,product.userInput.ProductId2], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      if (results.affectedRows == 0) {
        return res.status(404).json({
          message: "Invalid Data provided!"
        });
      }
      return res.status(200).json({
        message: "Product Updated Successfully !"
      });
    }
  });
});

router.delete("/delete/:id", authentication.authenticateToken, checkRole.CheckRole, (req, res, next) => {
  let product = req.params.id;
  query = "DELETE FROM product where id=?";
  myConnection.query(query, [product], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      if (results.affectedRows == 0) {
        return res.status(404).json({
          message: "Invalid Data provided!"
        });
      }
      return res.status(200).json({
        message: "Product Deleted Successfully !"
      });
    }
  });
});

router.patch("/updateStatus", authentication.authenticateToken, checkRole.CheckRole, (req, res, next) => {
  let product = req.body;
  query = "UPDATE product SET status=? where id=?";
  myConnection.query(query, [product.status, product.userInput], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      if (results.affectedRows == 0) {
        return res.status(404).json({
          message: "Invalid Data provided!"
        });
      }
      return res.status(200).json({
        message: "Product status Updated Successfully !"
      });
    }
  });
});
module.exports = router;
