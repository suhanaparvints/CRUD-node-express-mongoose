import User from "../models/User.js";
import bcrypt from "bcrypt";

export const getAllUsers = async (req, res) => {
  console.log("getAllUsers function called");

  try {
    const users = await User.find();

    res.status(200).json({
      status: "OK",
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

export const nameUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: id });
    if (!user) {
      throw new Error("User not found");
    }

    user.name = req.body.name;
    await user.save();

    res.status(200).json({
      status: "OK",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

export const replaceUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: id });
    if (!user) {
      throw new Error("User not found");
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
    res.status(400).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userId: id });
    if (!user) {
      throw new Error("user not found");
    }
    const result = await User.deleteOne({ userId: id });
    res.status(200).json({
      status: "ok",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
