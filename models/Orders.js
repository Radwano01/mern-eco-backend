const mongoose = require("mongoose")


const Orders = new mongoose.Schema({
    userID:{
        type:String
    },
    email:{
        type:String,
        require:true
    },
    cartItems:[{
        name:String,
        brand:String,
        price:Number,
        desc:String,
        category:String,
        cartTotalQuantity:Number,  
    }],
    cartTotalAmount:{
        type:Number,
    },
    orderDate:{
        type:Date,
        default:Date.now
    },
    orderStatus:{
        type:String,
        default:"Pending"
    },
    shippingAddress:{
        name: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        postal_code: Number,
        country: String,
        phone: Number,
        email: String,
    }
})

const OrdersModel = mongoose.model("orders", Orders)
module.exports = OrdersModel