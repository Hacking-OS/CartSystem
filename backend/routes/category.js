
const express = require("express");
const myConnection = require("../connection");
const router = express.Router();
const authentication = require("../services/authentication");
const checkRole = require("../services/checkRole");


router.post("/add",authentication.authenticateToken,checkRole.CheckRole,(req,res,next)=>{
let category = req.body;
query= "INSERT INTO category (name) values (?)";
myConnection.query(query, [category.catName], (err, results) => {
    if(err){
        return res.status(500).json(err);
    }else{
        return res.status(200).json({message:"Category registered Successfully !"});
    }
});
});


router.get("/get",authentication.authenticateToken,checkRole.CheckRole,(req,res,next)=>{
query= "SELECT * from category order by name";
myConnection.query(query, (err, results) => {
    if(err){
        return res.status(500).json(err);
    }else{
        return res.status(200).json(results);
    }
});
});

router.get("/getUserCategory",authentication.authenticateToken,(req,res,next)=>{
query= "SELECT * from category order by name";
myConnection.query(query, (err, results) => {
    if(err){
        return res.status(500).json(err);
    }else{
        return res.status(200).json(results);
    }
});
});


router.patch("/update",authentication.authenticateToken,checkRole.CheckRole,(req,res,next)=>{
let category = req.body;
query= "UPDATE category SET name=? where id=?";
myConnection.query(query, [category.name,category.id], (err, results) => {
    if(err){
        return res.status(500).json(err);
    }else{
        if(results.affectedRows==0){
            return res.status(404).json({message:"Invalid Data provided!"});
        }
            return res.status(200).json({message:"Category Updated Successfully !"});
    }
});
});

module.exports=router;
