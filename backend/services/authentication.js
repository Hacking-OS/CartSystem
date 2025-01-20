require('dotenv').config();
const Jtoken = require('jsonwebtoken');

function authenticateToken(req,res,next){
const authHeader=req.headers['authorization'];
const token = authHeader && authHeader.split(" ")[1];
if(token==null){
    return res.sendStatus(401);
}
Jtoken.verify(token,process.env.ACCESS_TOKEN,(error,response)=>{
    if(error){
        return res.sendStatus(403);
    }
    res.locals=response;
    next();
});
};


module.exports= {authenticateToken:authenticateToken}
