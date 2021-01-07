const mongoose = require('mongoose');
var Schema = mongoose.Schema
var address = new Schema({
 customer_id:{type : mongoose.Types.ObjectId},
address_line1 : {type:String , required : true},
address_line2 : {type :String , required : true},
city : {type :String,required : true},
state : {type : String,required:true},
zipcode : {type : Number , required : true},
country : {type : String,required : true},
set_default_address :{type : Number , default : 0},
created  : {type  : Date , default : Date.now()},
updated : {type  : Date, default : Date.now()},
status :{type : Number , default :1}
})
module.exports =  mongoose.model('shipping_address',address);