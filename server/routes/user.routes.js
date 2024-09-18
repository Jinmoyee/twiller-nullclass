import express from 'express';
import { getUserProfile, followUnfollowUser, getSuggestedUser, updateUser } from "../controllers/user.controller.js"
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get("/profile/:username", verifyToken, getUserProfile)

router.post("/follow/:id", verifyToken, followUnfollowUser)

router.get("/suggested", verifyToken, getSuggestedUser)

router.post("/update", verifyToken, updateUser)

export default router; 