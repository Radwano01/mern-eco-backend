const mongoose = require("mongoose")

const Users = new mongoose.Schema({

    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    isVerified:{
        type:Boolean,
        default: false
    }

})

const UsersModel = mongoose.model("users", Users)
module.exports = UsersModel