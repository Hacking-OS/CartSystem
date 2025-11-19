const Jtoken = require('jsonwebtoken');
const config = require('../config');

function authenticateToken(req,res,next){
const authHeader=req.headers['authorization'];
const token = authHeader && authHeader.split(" ")[1];
if(token==null){
    return res.sendStatus(401);
}
Jtoken.verify(token,config.jwt.accessSecret,(error,response)=>{
    if(error){
        return res.sendStatus(403);
    }
    res.locals=response;
    next();
});
};


module.exports= {authenticateToken:authenticateToken}
