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
    });

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

    const isPasswordMatch = await bcrypt.compare(
      password,
      admin.password
    );

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
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      status: "OK",
      message: "Admin login successful",
      token,
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const registerUser = async (req, res) => {
  console.log("registerUser function called");
  try {
    //request body
    const { name, age, address, email, password, role } = req.body;
    // console.log(name,age,address,email,password);

    if (!name || !email || !password) {
      throw new Error("name, email, and password field required");
    }

    //uuid
    const userId = uuidV7();

    //password bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    //date & time
    const user = await User.create({
      userId,
      name,
      age,
      address,
      email,
      role,
      password: hashedPassword,
    });

    res.status(200).json({
      status: "OK",
      message: "registerUser Success",
      data: user,
    });

    //save structured data to database -db.js
  } catch (error) {
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // 2. Find user
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // 3. Check password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // 4. Prevent admins from using user login
    if (user.role !== "user") {
      return res.status(403).json({
        message: "Please use admin login"
      });
    }

    // 5. Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "User login successful",
      token
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};