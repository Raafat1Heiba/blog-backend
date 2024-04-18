import express from "express";
import {
  loginUser,
  signupUser,
  logoutUser,
  followUnFollowUser,
  updateUser,
  getUserProfile,
  uploadImage,
  resizeImage,
} from "../controller/userController.js";
import protectRoute from "../middlewares/protectRoute.js";
const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnFollowUser);
router.put("/update/:id", protectRoute, uploadImage, resizeImage, updateUser);
export default router;
