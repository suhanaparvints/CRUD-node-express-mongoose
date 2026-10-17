import express from "express"
import authRoutes from "./authRoutes.js";

const adminRoutes= express.Router({mergeParams:true})

adminRoutes.post("/login",authRoutes)

export default adminRoutes