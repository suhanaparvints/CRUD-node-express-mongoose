import express from "express";
import {
  getAllUsers,
  nameUpdate,
  replaceUser,
  deleteUser,
} from "../controllers/userController.js";
import {
  verifyAdmin,
  verifyToken,
  verifyUser,
} from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  deleteUserSchema,
  replaceUserSchema,
  updateNameSchema,
} from "../validators/userValidators.js";

const userRoutes = express.Router({ mergeParams: true });

userRoutes.get("/", verifyAdmin, getAllUsers);

userRoutes.patch("/:id", verifyUser, validate(updateNameSchema), nameUpdate);

userRoutes.put("/:id", verifyAdmin, validate(replaceUserSchema), replaceUser);

userRoutes.delete("/:id", verifyAdmin, validate(deleteUserSchema), deleteUser);

export default userRoutes;

//show list of users
