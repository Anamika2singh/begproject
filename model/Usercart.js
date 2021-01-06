const mongoose=require('mongoose');
var Schema = mongoose.Schema;
var card = new Schema({
  customer_id: {type : mongoose.Types.ObjectId},
  carditems:{type:Array,required:true},
  order:{type:Number,required:true},
  delivery:{type:Number,required:true},
  total_amount:{type:Number,required:true},
  created  : {type  : Date , default : Date.now()},
  updated : {type  : Date, default : Date.now()},
  status :{type : Number , default :1} 

})
module.exports =  mongoose.model('cards',card);