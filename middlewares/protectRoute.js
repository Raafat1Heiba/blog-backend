import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";
const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.jwt;
    console.log(token);
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // const decoded = jwt.decode(token, process.env.JWT_SECRET);
    // console.log(decoded);
    const decoded = jwtDecode(token);
    console.log(decoded);

    const user = await User.findById(decoded.userId).select("-password");

    req.user = user;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log("Error in signupUser: ", err.message);
  }
};

export default protectRoute;
