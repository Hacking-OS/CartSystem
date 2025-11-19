const express = require("express");
const myConnection = require("../connection");
const router = express.Router();
const authentication = require("../services/authentication");
const uuid = require("uuid");


router.get("/get", authentication.authenticateToken, (req, res) => {
    query = "SELECT * FROM user_message order by messagedAt desc";
    myConnection.query(query,(err, data) => {
      if (err) {
          console.log(err);
          return res.status(500).json(err);
      } else {
          return res.status(200).json(data);
      }
});
});

router.post("/send",authentication.authenticateToken, (req, res) => {
  let user = req.body;
var query="INSERT INTO user_message (userID,userName,userEmail,uuid_user,userMessage) VALUES (?,?,?,?,?)";
let GernerateId = uuid.v1();
myConnection.query(query,[user.id,user.name,user.email,GernerateId,user.message],(err, results) => {
    if(err){
        return res.status(500).json(err);
    }else {
       return res.status(200).json({message:"message sent Successfully!"});
    }
});
});

router.delete("/delete/:id", authentication.authenticateToken, (req, res, next) => {
  let uuid = req.params.id;
  query = "DELETE FROM user_message where uuid_User=?";
  myConnection.query(query, [uuid], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    } else {
      if (results.affectedRows == 0) {
        return res.status(404).json({
          message: "Invalid Data provided!"
        });
      }
      return res.status(200).json({
        message: "Message Deleted Successfully !"
      });
    }
  });
});
module.exports = router;
