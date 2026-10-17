import express from "express"
import { getAllUsers,partialUpdate, replaceUser,deleteUser } from "../controllers/userController.js";

const userRoutes=express.Router({mergeParams:true})

userRoutes.get("/",getAllUsers)

userRoutes.patch("/:id",partialUpdate)

userRoutes.put("/:id",replaceUser)

userRoutes.delete("/:id",deleteUser)

export default userRoutes

//show list of users


