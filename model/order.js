var mongoose = require('mongoose')
var Schema = mongoose.Schema

var orderplace = new Schema ({
    order_number : {type : Number},
    product : {type : Array},
    vendor_id : {type : Schema.Types.ObjectId},
    customer_id  : {type : Schema.Types.ObjectId},
    total_amountpaid : {type : Number},
    created : {type : Date , default : Date.now()},
    updated : {type :Date , default : Date.now()},
    order_status : {type : Number , default : 0}
})
module.exports = new mongoose.model('placed_orders',orderplace)