import User from "../models/User.js";


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


export const partialUpdate = async (req, res) => {
  console.log("addressUpdate called");
  console.log("req.params.id>>>", req.params.id);
  console.log("req.body>>>", req.body);

  try {
    const { id } = req.body;
    const user = await User.findOne({ id });
    if (!user) {
      throw new Error("User not found");
    }

    user.address = req.body.address;
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
  console.log("addressUpdate called");
  console.log("req.params.id>>>", req.params.id);
  console.log("req.body>>>", req.body);
  try {
    const { id } = req.body;
    const user = await User.findOne({ id });
    if (!user) {
      throw new Error("User not found");
    }
const result= await User.updateOne({id},req.body)
await user.save()
    res.status(200).json({
      status: "OK",
      data: result
    });
  } catch (error) {
     res.status(400).json({
      status: "ERROR",
      message: error.message,
    });
  }
};


export const deleteUser = async (req,res)=>{
    try{
    const {userId}= req.body
    const user = await User.findOne({userId})
    if(!user){
        throw new Error ("user not found")
    }
    const result = await User.deleteOne({userId})
    res.status(200).json({
        status:"ok",
        data: result
    })
}
catch(error){
    res.status(400).json({
        status:"error",
        message: error.message
    })
}
}
