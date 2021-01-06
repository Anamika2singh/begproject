const mongoose = require('mongoose');
var Schema = mongoose.Schema
var product = new Schema({
    category_id : {type : mongoose.Types.ObjectId},
    vendor_id : {type : mongoose.Types.ObjectId},
   item_name : {type:String , required : true},
   description : {type :String , required : true },
   unit_price : {type : Number , required : true},
   discount_priceunit : {type : Number , required :true},
   product_pics : {type : Array , required: true},
  created  : {type  : Date , default : Date.now()},
  updated : {type  : Date, default : Date.now()},
  status :{type : Number , default :1} 
})
module.exports =  mongoose.model('addproduct',product);