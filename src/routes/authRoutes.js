import express from "express";
import { registerUser } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { registerValidation } from "../validators/authValidators.js";

const authRoutes = express.Router({ mergeParams: true });

// authRoutes.get("/login", (req, res) => {
//   res.status(200).json({
//     status: "OK",
//     message: "success login check",
//   });
// });

// authRoutes.get("/register", (req, res) => {
//   res.status(200).json({
//     status: "OK",
//     message: "success register check",
//   });
// });

authRoutes.post("/register", validate({ body: registerValidation }), registerUser);

// authRoutes.post("/register", registerUser);

export default authRoutes;
