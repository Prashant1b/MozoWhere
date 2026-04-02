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




const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { firstname, lastname, age } = req.body;
        const updates = {};

        if (firstname !== undefined) {
            const name = String(firstname).trim();
            if (name.length < 3 || name.length > 20) {
                return res.status(400).json({ message: "First name must be 3-20 characters" });
            }
            updates.firstname = name;
        }
        if (lastname !== undefined) {
            const lname = String(lastname).trim();
            if (lname && (lname.length < 3 || lname.length > 20)) {
                return res.status(400).json({ message: "Last name must be 3-20 characters" });
            }
            updates.lastname = lname;
        }
        if (age !== undefined) {
            const a = Number(age);
            if (a && (a < 6 || a > 60)) {
                return res.status(400).json({ message: "Age must be between 6 and 60" });
            }
            updates.age = a || undefined;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "Nothing to update" });
        }

        const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select("-password -__v");
        return res.status(200).json({ message: "Profile updated", user });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Failed to update profile" });
    }
};

const Order = require("../models/OrderModel");

const getProfileStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const [user, orders, recentOrders] = await Promise.all([
            User.findById(userId).select("-password -__v").lean(),
            Order.find({ user: userId }).select("totalAmount orderStatus paymentStatus shippingCharge createdAt").lean(),
            Order.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .select("totalAmount orderStatus paymentStatus shippingCharge items createdAt")
                .lean(),
        ]);

        if (!user) return res.status(404).json({ message: "User not found" });

        const totalOrders = orders.length;
        const totalSpent = orders
            .filter((o) => o.paymentStatus === "paid" || o.orderStatus !== "cancelled")
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const delivered = orders.filter((o) => o.orderStatus === "delivered").length;
        const pending = orders.filter((o) => ["pending", "confirmed", "processing"].includes(o.orderStatus)).length;
        const shipped = orders.filter((o) => o.orderStatus === "shipped").length;
        const cancelled = orders.filter((o) => o.orderStatus === "cancelled").length;

        return res.json({
            user,
            stats: { totalOrders, totalSpent, delivered, pending, shipped, cancelled },
            recentOrders: recentOrders.map((o) => ({
                _id: o._id,
                totalAmount: o.totalAmount,
                shippingCharge: o.shippingCharge,
                orderStatus: o.orderStatus,
                paymentStatus: o.paymentStatus,
                itemCount: o.items?.length || 0,
                createdAt: o.createdAt,
            })),
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    register,
    adminRegister,
    login,
    logout,
    getprofile,
    DeleteUserData,
    updatepassword,
    updateProfile,
    getProfileStats,
};




