import { v7 as uuidV7 } from "uuid";
import bcrypt from "bcrypt";
import User from "../models/User.js";

import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const admin = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Allow only admins
    if (admin.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Only admins can log in here",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin.userId,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      status: "OK",
      message: "Admin login successful",
      token,
    });
  } catch (error) {
    console.error("Admin login failed:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, age, address, email, password, role } = req.body;
    const userId = uuidV7();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      userId,
      name,
      age,
      address,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      status: "OK",
      message: "User registered successfully",
      data: { userId: user.userId },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "A user with this email already exists",
      });
    }
    console.error("User registration failed:", error);
    return res.status(500).json({
      status: "error",
      message: "Unable to register user",
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        message: "Please use admin login",
      });
    }

    const token = jwt.sign({ id: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      message: "User login successful",
      token,
    });
  } catch (error) {
    console.error("User login failed:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
