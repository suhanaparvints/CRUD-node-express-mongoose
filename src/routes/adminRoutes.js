import express from "express";
import { adminLogin } from "../controllers/authController.js";

const adminRoutes = express.Router({ mergeParams: true });

adminRoutes.post("/login", adminLogin);

export default adminRoutes;
