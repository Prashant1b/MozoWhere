const User = require('../models/user')
const bcrypt = require('bcrypt');
const validate = require('../utils/validator')
const jwt = require("jsonwebtoken");
const redisClient = require('../config/redis');

const register = async (req, res) => {
  try {
    validate(req.body);

    const { firstname, emailid, password } = req.body;

    const emailexist = await User.exists({ emailid });
    if (emailexist) {
      return res.status(409).json({ message: "Email already exists. Please login." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      emailid,
      password: hashed,
      role: "user",
    });

    const token = jwt.sign(
      { _id: user._id, emailid: user.emailid, role: user.role },
      process.env.key,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
  httpOnly: true,
  sameSite:  "none",    
  secure: true,
  maxAge: 60 * 60 * 1000,
});

    const safeUser = await User.findById(user._id).select("-password");
    return res.status(201).json({ message: "Registered", user: safeUser });
  } catch (error) {
    console.log("REGISTER ERROR:", error);
    if (error.message === "Weak Password") {
      return res.status(400).json({ message: "Password must be 8+ characters with uppercase, lowercase, number & symbol (e.g. @#$!)" });
    }
    return res.status(400).json({ message: error.message || "Registration failed" });
  }
};

const adminRegister = async (req, res) => {
  try {
    validate(req.body);

    const { firstname, emailid, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      emailid,
      password: hashed,
      role: "admin", // force admin
    });

    const token = jwt.sign(
      { _id: user._id, emailid: user.emailid, role: user.role },
      process.env.key,
      { expiresIn: "1h" }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      user: {
        _id: user._id,
        firstname: user.firstname,
        emailid: user.emailid,
        role: user.role,
      },
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }

    return res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { emailid, password } = req.body;

    if (!emailid || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ emailid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, emailid, role: user.role },
      process.env.key,
      { expiresIn: "1h" }
    );

   res.cookie("token", token, {
  httpOnly: true,
  sameSite:  "none",    
  secure: true,
  maxAge: 60 * 60 * 1000,
});


    const safeUser = await User.findById(user._id).select("-password");
    return res.status(200).json({ message: "Logged in", user: safeUser });
  } catch (error) {
    console.log("LOGIN ERROR:", error); 
    return res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
    try {
        // vaildate karo token ko 
        // add to redis for blacklist
        const token = req.cookies.token;
        if(token){
        const payload = jwt.decode(token);
        await redisClient.set(`blocked_${token}`, "blocked");
        await redisClient.expireAt(`blocked_${token}`, payload.exp)
        }
            res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
    return res.status(200).json({ message: "Logged out" });
        // res.clearCookie("token");
        // res.status(200).send("User Logout Sucessfully");
    }
    catch (err) {
        res.status(503).send("Error " + err);
    }
}

const getprofile = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new Error("Token is missing");
        const payload = jwt.verify(token, process.env.key);
        const { _id } = payload;
        const user = await User.findById(_id).select('-password -__v');
        if (!user) throw new Error("User doesn't exists");
         return res.status(200).json({ user });
    } catch (error) {
        res.status(400).send("Error " + error);
    }
}


const DeleteUserData = async (req, res) => {
    try {
        const userid = req.user._id;
        await User.findByIdAndDelete(userid);
        res.status(200).send("User Deleted Sucessfully");
    } catch (error) {
        res.status(500).send("Error " + error.message);
    }
}

const updatepassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).send("Password is required");
        }
        if (password.length < 6) {
            return res.status(400).send("Password must be at least 6 characters");
        }
        if (!req.user) {
            return res.status(401).send("Unauthorized");
        }
        req.user.password = await bcrypt.hash(password, 10);
        await req.user.save();
        const token = req.cookies.token;
        const payload = jwt.decode(token);
        await redisClient.set(`blocked_${token}`, "blocked");
        await redisClient.expireAt(`blocked_${token}`, payload.exp)
        res.cookie("token", null, { expires: new Date(Date.now()) });
        res.status(200).send("Password Update Sucessfully. Login Again");
    } catch (error) {
        res.status(500).send("Error " + error.message);
    }
}




module.exports = {
    register,
    adminRegister,
    login,
    logout,
    getprofile,
    DeleteUserData,
    updatepassword
};




