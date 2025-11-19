const express = require('express');
const myConnection = require("../connection");
const Token = require("jsonwebtoken");
const router = express.Router();
const authentication = require("../services/authentication");
const CheckRole = require("../services/checkRole");
const config = require("../config");
const emailService = require("../services/emailService");

router.post("/signup", (req, res) => {
    let user = req.body;
    query = "SELECT * from users where email=?";
    myConnection.query(query, [user.userInput.email], (err, results) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            if (results.length <= 0) {
                query = "INSERT INTO users (name,email,phone,password,status,role) values(?,?,?,?,0,'user')";
                myConnection.query(query, [user.userInput.name, user.userInput.email, user.userInput.phone, user.userInput.password], (err, results) => {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        return res.status(200).json({
                            message: "User Registered Successfully !"
                        });
                    }
                });
            } else {
                return res.status(400).json({message: "Email Already Exist ! "});
            }
        }
    });
});


router.post("/login", (req, res) => {
    let user = req.body;
    query = "SELECT  * from users where email=?";
    myConnection.query(query, [user.userInput.email], async (err, results) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            if (results.length <= 0 || results[0].password != user.userInput.password) {
                return res.status(401).json({
                    message: "Invalid UserName/Email or Password!"
                });
            } else if (results[0].status === false || results[0].status === 0) {
                return res.status(401).json({
                    message: "Wait For Admin Approval!"
                });
            } else if (results[0].password == user.userInput.password) {
                const response = {
                    email: results[0].email,
                    role: results[0].role,
                    userId: results[0].id,
                }
                const AccessToken = Token.sign(response, config.jwt.accessSecret, {
                  expiresIn: config.jwt.accessTtl,
                });

               const newRefreshToken =generateRefreshToken(response);
                res.status(200).json({email:results[0].email,token:AccessToken,userRole:results[0].role,userId:results[0].id,refreshToken:newRefreshToken.refreshToken,userName:results[0].name});
            } else {
                return res.status(400).json({
                    message: "SomeThing Went Wrong please try again!"
                });
            }
        }
    });
});




router.post("/forgetPassword", (req, res) => {
let user = req.body;
    // let user= req.body;
    query = "SELECT  * from users where email=?";
    myConnection.query(query, [user.userInput.email], (err, results) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            if (results.length <= 0) {
                return res.status(200).json({
                    message: "Password sent Successfully to you email Address!(Not)"
                });
            } else {
                const mailingOptions = {
                    to: results[0].email,
                    subject: "Password By DeveloperCodingPreview:",
                    html: "<p><b>Your login details for developerCoding preview is :</b><br><b>your email : </b><b>" + results[0].email + "<br><b>your password:" + results[0].password + "</b><br><br> click <a href='http://localhost:4200'>here</a> to login</p>",
                };
                emailService.sendMail(mailingOptions)
                    .then((info) => {
                        if (info.skipped) {
                            console.log("Email disabled: password reminder skipped.");
                        } else {
                            console.log("email sent : " + info.response);
                        }
                        return res.status(200).json({message: "Password sent Successfully to you email Address!"});
                    })
                    .catch((error) => {
                        console.log(error);
                        return res.status(500).json({message: "Unable to send email right now."});
                    });
                return;
            }
        }
    });
});



router.get("/get",authentication.authenticateToken,CheckRole.CheckRole, (req, res) => {
var query="SELECT * from users where role='user'";
myConnection.query(query, (err, results) => {
    if(err){
        return res.status(500).json(err);
    }else{
        return res.status(200).json(results);
    }
});
});

router.get("/token", (req, res) => {
  const response = {
    email: res.locals.email,
    role: res.locals.role
}
const AccessToken = Token.sign(response, config.jwt.accessSecret, {
  expiresIn: config.jwt.accessTtl,
});
return res.status(200).json({response:AccessToken});
});


router.get("/validToken/:token", (req, res) => {
  if(req.params.token==null){
    return res.status(401).json({response:false});
}
Token.verify(req.params.token,config.jwt.accessSecret,(error,response)=>{
    if(error){
        return res.status(403).json({response:false});
    }
});
return res.status(200).json({response:true});
});


router.post("/getResults",authentication.authenticateToken, (req, res) => {
var user = req.body;
myConnection.query(user.query, (err, results) => {
    if(err){
        return res.status(500).json(err);
    }else{
        return res.status(200).json(results);
    }
});
});


router.patch("/update",authentication.authenticateToken,CheckRole.CheckRole, (req, res) => {
    let user = req.body;
    query = "UPDATE users SET status=? where id=?";
    myConnection.query(query, [user.Status,user.userInput], (err, results) => {
        if(err){
            return res.status(500).json(err);
        }else{
            if(results.affectedRows==0){
                return  res.status(400).json({message: "User Not Exist !"});
            }else{
                return res.status(200).json({message: "User Updated Succesfully!"});
            }
        }
    });
    });


router.get("/checkToken",authentication.authenticateToken, (req, res) => {
    return res.status(200).json({message:"true"});
    });




    router.post("/changePassword", authentication.authenticateToken , (req, res) => {
        let user = req.body;
            let email = res.locals.email;
            query = "SELECT  * from users where email=? and password=?";
            myConnection.query(query, [email,user.oldPassword], (err, results) => {
                if (err) {
                    return res.status(500).json(err);
                } else {
                if(results.length<=0){
                    return  res.status(400).json({message:"Incorrect Old password !"});
                }else if(results[0].password == user.oldPassword){
                    query = "UPDATE users SET password=? where email=?";
                    myConnection.query(query, [user.newPassword,email], (err, result) => {
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            return res.status(200).json({message:"Password Updated Successfully!"});
                        }
                    });
                }else{
                    return  res.status(400).json({message:"Please Try again Later!"});
                }

                    }
                });
        });



router.post('/refresh-token', (req, res) => {
  const refreshToken = req.body.refreshToken;
  const token = req.body.token;
  Token.verify(refreshToken,config.jwt.refreshSecret,(error,response)=>{
    const newAccessToken = generateAccessToken({email: res.locals.email,role: res.locals.role});
    if(error){
      return  res.status(401).json({ success: '' ,error: 'Invalid refresh token!' });
    }
    return  res.status(200).json({ success: 'Success' , access_token: newAccessToken.accessToken,error:''});
});
});



function generateAccessToken(payload) {
  const accessToken = Token.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtl });
  return {accessToken:accessToken};
}
function generateRefreshToken(payload) {
  const refresh_Token = Token.sign(payload,config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtl });
  return {refreshToken:refresh_Token};
}

module.exports = router;
