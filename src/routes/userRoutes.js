import express from "express";

import { userLogin } from "../controllers/authController.js";
import { verifyUser } from "../middleware/authMiddleware.js";
import { nameUpdate, replaceUser } from "../controllers/userController.js";
import { validate } from "../middleware/validate.js";
import { updateNameSchema, replaceUserSchema } from "../validators/userValidators.js";

const userRoutes = express.Router({ mergeParams: true });

userRoutes.post("/login", userLogin);
userRoutes.patch("/:id", verifyUser, validate(updateNameSchema), nameUpdate);
userRoutes.put("/:id", verifyUser, validate(replaceUserSchema), replaceUser);

export default userRoutes;
