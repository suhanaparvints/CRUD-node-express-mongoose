import express from "express"
import { registerUser, userLogin } from "../controllers/authController.js"

const authRoutes=express.Router({mergeParams:true})

authRoutes.get("/login",(req,res)=>{
     res.status(200).json({
        status:"OK",
        message:"success login check"
    })
})

authRoutes.get("/register",(req,res)=>{
      res.status(200).json({
        status:"OK",
        message:"success register check"
    })
})

authRoutes.post("/login",userLogin)
authRoutes.post("/register",registerUser)

export default authRoutes