import {v7 as uuidV7} from "uuid";
import bcrypt from "bcrypt";
import User from "../models/User.js"

export const userLogin = async (req, res) => {
  console.log("userLogin function called");

  try {
    const { username, password } = req.body;
    console.log(username, password);
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return res.status(200).json({
        status: "OK",
        message: "userLogin Success",
      });
    } else {
      throw new Error("Invalid username or password");
    }
  } catch (error) {
    res.status(200).json({
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

    if(!name || !email || !password){
throw new Error("name, email, and password field required")
    }

    //uuid
const userId= uuidV7()
console.log({userId});

//password bcrypt
const hashedPassword= await bcrypt.hash(password,10)
console.log({hashedPassword});

//date & time
const user= await User.create({
    userId,name,age,address,email,password:hashedPassword
})

res.status(200).json({
        status:"OK",
        message:"registerUser Success",
        data:user
    })

//save structured data to database -db.js


  } catch (error) {
    res.status(400).json({
      status: "Error",
      message: error.message,
    });
  }
};
