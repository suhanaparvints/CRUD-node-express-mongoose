import { v7 as uuidV7 } from "uuid";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      return res.status(200).json({
        status: "OK",
        message: "adminLogin Success",
        token,
      });
    } else {
      throw new Error("Invalid username or password");
    }
  } catch (error) {
    res.status(401).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

export const registerUser = async (req, res) => {
  console.log("registerUser function called");
  try {
    //request body
    const { name, age, address, email, password } = req.body;
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
  console.log("userLogin Function Called");
  try {
    const { email, password } = req.body;
    // console.log(email,password);

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    console.log("isPasswordMatch>>", isPasswordMatch);
    if (!isPasswordMatch) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      status: "OK",
      message: "login successfully",
      token,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
