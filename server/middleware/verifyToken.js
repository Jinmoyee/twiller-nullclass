import User from "../models/user.model.js"
import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(401).json({ error: "You are not authenticated" })
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        if (!verified) {
            return res.status(403).json({ error: "Invalid token" })
        }
        const user = await User.findById(verified.userId).select("-password");
        if (!user) {
            return res.status(403).json({ error: "User not found" })
        }
        req.user = user
        next()
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
}