var jwt = require('jsonwebtoken');
module.exports=((req,res,next)=>{
    try{
      var token = req.headers['authorization'];
      var decoded = jwt.verify(token,'LOG_KEY');
      req.userData=decoded
    //   console.log(decoded)
      next()
    }
    catch(error){
        res.status(404).json({"message":'token not exist'})
    }

})