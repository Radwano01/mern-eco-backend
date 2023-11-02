const mongoose = require("mongoose")

const Products = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    brand:{
        type:String,
        required: true
    },
    image:{
        type:String,
        required: true
    },
    desc:{
        type:String,
        required: true
    },
    price:{
        type:String,
        required: true
    },
    category:{
        type:String,
        require:true
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
})

const ProductModel = mongoose.model("products", Products)
module.exports = ProductModel