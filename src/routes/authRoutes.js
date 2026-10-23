import express from "express";

import { registerUser } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { registerValidation } from "../validators/authValidators.js";

const authRoutes = express.Router();

authRoutes.post("/register", validate({ body: registerValidation }), registerUser);

export default authRoutes;
