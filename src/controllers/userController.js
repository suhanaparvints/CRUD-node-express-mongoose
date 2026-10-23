import bcrypt from "bcrypt";

import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      status: "OK",
      data: users,
    });
  } catch (error) {
    console.error("User listing failed:", error);
    res.status(500).json({
      status: "error",
      message: "Unable to retrieve users",
    });
  }
};

export const nameUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: id });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    user.name = req.body.name;
    await user.save();

    res.status(200).json({
      status: "OK",
      data: user,
    });
  } catch (error) {
    console.error("User name update failed:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Unable to update user",
    });
  }
};

export const replaceUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: id }).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    const { name, age, address, email, password } = req.body;
    user.name = name;
    user.age = age;
    user.address = address;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({
      status: "OK",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: "error",
        message: "A user with this email already exists",
      });
    }
    console.error("User replacement failed:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Unable to update user",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.deleteOne({ userId: id });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "ok",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("User deletion failed:", error);
    res.status(500).json({
      status: "error",
      message: "Unable to delete user",
    });
  }
};
