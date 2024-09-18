import express from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { createPost, deletePost, commentPost, likeUnlikePost, allPost, getLikedPost, getFollowingPost, getUserPost } from "../controllers/post.controller.js"

const router = express.Router()

router.get("/all", verifyToken, allPost)
router.get("/following", verifyToken, getFollowingPost)
router.get("/likes/:id", verifyToken, getLikedPost)
router.get("/user/:username", verifyToken, getUserPost)
router.post("/create", verifyToken, createPost)
router.delete("/:id", verifyToken, deletePost)
router.post("/comment/:id", verifyToken, commentPost)
router.post("/like/:id", verifyToken, likeUnlikePost)

export default router