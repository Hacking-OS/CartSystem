const express = require("express");
const myConnection = require("../connection");
const router = express.Router();
const authentication = require("../services/authentication");
const checkRole = require("../services/checkRole");

router.get("/details", authentication.authenticateToken, (req, res, next) => {
    var categoryCount;
    var productCount;
    var billCount;

    var query = "SELECT count(id) as categoryCount from category";
    myConnection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            categoryCount = results[0].categoryCount;
        }
    });
    var query = "SELECT count(id) as productCount from product";
    myConnection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            productCount = results[0].productCount;
        }
    });
    
    var query = "SELECT count(id) as billCount from bill";
    myConnection.query(query, (err, results) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            billCount = results[0].billCount;
            var data ={
                category:categoryCount,
                product:productCount,
                bill:billCount,
            }
            return res.status(200).json(data);
        }
    });
});

module.exports = router;