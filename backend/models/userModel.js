const mongoose = require('mongoose')


const Schema=mongoose.Schema

const userSchema=new Schema({
    Name:{
        type:String,
        required:true
    },
    NID:{
        type:String,
        required:true
    },
    Phone:{
        type:Number,
        required:true
    },
    Email:{
        type: String,
        required:true
    },
    Weight: {
        type:Number,
        required:true
    },
    Blood_Grp:{
        type:String,
        required:true
    }
},{timestamps:true})

module.exports=mongoose.model('Users',userSchema)

