import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Resume from "../models/Resume.js";

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);

    newUser.password = undefined;

    return res.status(201).json({
      message: "User created successfully",
      token,
      user: newUser,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login request received:", { email });

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    console.log("Found user:", user ? user._id : "none");

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);
    console.log("Generated token:", token ? "yes" : "no");

    user.password = undefined;

    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

// Data
export const getUserData= async (req, res) => {
    try {
        const userId = req.userId;

        // check if user exists
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: "User not found"})
        }

        // return user
        user.password = undefined;
        return res.status(200).json({user})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}

// controller for getting user resumes
// GET : /api/users/resumes
export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;

        //return user resumes
        const resumes = await Resume.find({userId});
        return res.status(200).json({resumes})
    } catch (error) {
        return res.status(400).json({message: error.message})
    }
}
