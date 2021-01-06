const mongoose = require('mongoose');
var Schema = mongoose.Schema
var cate = new Schema({
category_name : {type:String , required : true},
created  : {type  : Date , default : Date.now()},
updated : {type  : Date, default : Date.now()},
status :{type : Number , default :1}
})
module.exports =  mongoose.model('category',cate);