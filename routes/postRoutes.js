import express from "express";
import {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  replyToPost,
  getFeed,
  resizeImage,
  uploadImage,
  getAllPosts,
  getUserPost,
  updatePost,
} from "../controller/postController.js";
import protectRoute from "../middlewares/protectRoute.js";
const router = express.Router();
router.get("/", getAllPosts);
router.get("/:id/user", getUserPost);
router.patch("/:id", updatePost);
router.get("/feed", protectRoute, getFeed);
router.get("/:id", getPost);
router.post("/create", protectRoute, resizeImage, uploadImage, createPost);
router.delete("/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, likeUnlikePost);
router.put("/reply/:id", protectRoute, replyToPost);

export default router;
