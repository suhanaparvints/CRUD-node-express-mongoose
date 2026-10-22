import express from "express";
import { nameUpdate,replaceUser } from "../controllers/userController.js";
import { verifyUser } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { replaceUserSchema,updateNameSchema } from "../validators/userValidators.js";
import { userLogin } from "../controllers/authController.js";

const userRoutes = express.Router({ mergeParams: true });

userRoutes.post("/login", userLogin);

userRoutes.patch("/:id", verifyUser, validate(updateNameSchema), nameUpdate);

userRoutes.put("/:id", verifyUser, validate(replaceUserSchema), replaceUser);

export default userRoutes;

//show list of users
