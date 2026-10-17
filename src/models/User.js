import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
    userId:{
        type:String,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    age:{
        type:String
    },
     address:{
        type:String,
    },
     email:{
        type:String,
        required:true
    },
     password:{
        type:String,
        required:true
    }
},{timestamps:true})

const User=mongoose.model("User",userSchema)

 export default User