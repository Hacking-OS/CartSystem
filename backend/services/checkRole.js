const config = require('../config');

function CheckRole(req,res,next){

if(res.locals.role==config.jwt.userRole){
    return res.sendStatus(401);
}else{
    next()
}

}


module.exports= {CheckRole:CheckRole}