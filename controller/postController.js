import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

const multerStorage = multer.memoryStorage();
const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    // cb(new ApiError("only images", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
export const uploadImage = upload.single("image");
export const resizeImage = async (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return next();
    // new ApiError("No file uploaded or file buffer is missing", 400)
  }
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/categories/${filename}`);
  // // Save image into our db
  req.body.image = filename;
  next();
};

const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { image } = req.body;
    if (!postedBy || !text) {
      return res.status(400).json({ msg: "Missing fields" });
    }
    const user = await User.findById(postedBy);
    if (!user) {
      return res
        .status(401)
        .json({ error: `User with the id of ${postedBy} not found` });
    }
    if (user._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to make this post." });
    }
    const maxLength = 500;
    if (text.length > maxLength) {
      return res.status(400).json({
        error: `Text length should be less than or equal to ${maxLength}`,
      });
    }

    const newPost = new Post({ postedBy, text, image });
    await newPost.save();
    res.status(201).json({ message: "post created scuccess", data: newPost });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "No post found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};
const getUserPost = async (req, res) => {
  try {
    const post = await Post.find({ postedBy: req.params.id });
    if (!post) {
      return res.status(404).json({ error: "No post found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};
const getAllPosts = async (req, res) => {
  try {
    const post = await Post.find();
    if (!post) {
      return res.status(404).json({ error: "No post found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "No post with this ID was found" });
    }
    // Check user authorization
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "User is not authorized to perform this action" });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const updatePost = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { text },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ error: "No post with this ID was found" });
    }
    // Check user authorization

    res.status(200).json({ msg: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        error: "The post you are trying to interact with does not exist.",
      });
    }
    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      return res.status(201).json({ liked: false, count: post.likes.length });
    } else {
      post.likes.push(userId);
      await post.save();
      res.status(201).json({ liked: true, count: post.likes.length });
    }

    await post.save();
    res.status(201).json(post.likes);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.userProfilePic;
    const username = req.user.username;

    if (!text) {
      return res.status(400).json({ error: "Please enter a comment." });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = { text, userId, userProfilePic, username };

    post.replies.push(reply);
    await post.save();

    res.status(201).json({ message: "Reply  has been posted!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};

const getFeed = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("User ID:", userId); // Log user ID
    const user = await User.findById(userId);
    console.log("User:", user); // Log user object
    if (!user) {
      return res.status(404).json({
        error: `User not found`,
      });
    }
    const following = user.following;
    console.log("Following:", following); // Log following array
    const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({
      createdAt: -1,
    });
    console.log("Feed Posts:", feedPosts); // Log feed posts
    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};
export {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  replyToPost,
  getFeed,
  getAllPosts,
  getUserPost,
  updatePost,
};
