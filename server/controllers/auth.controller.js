import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" })
        }

        const existingEmail = await User.findOne({ email })
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists" })
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" })
        }

        const hashPassword = bcrypt.hashSync(password, 12)
        const newUser = new User({ fullName, username, email, password: hashPassword })
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()
            res.status(201).json({
                _id: newUser._id,
                username: newUser.username,
                fullName: newUser.fullName,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            })
        } else {
            return res.status(400).json({ error: "Failed to create user" })
        }
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" })
        }
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" })
        }
        generateTokenAndSetCookie(user._id, res)
        res.status(200).json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg
        })
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" })
    }
}


export const google = async (req, res) => {
    try {
        // Check if user already exists
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            // If the user exists, generate a JWT and set it in the cookie
            generateTokenAndSetCookie(user._id, res);
            return res.status(200).json({
                _id: user._id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg
            });
        } else {
            // If user doesn't exist, create a new user
            const generatePassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashPassword = bcrypt.hashSync(generatePassword, 10);
            const newUser = new User({
                username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4),
                email: req.body.email,
                password: hashPassword,
                profileImg: req.body.photo,  // Assuming profile image is provided in the body
                fullName: req.body.name
            });
            await newUser.save();

            // Generate token for new user and set in cookie
            generateTokenAndSetCookie(newUser._id, res);
            return res.status(200).json({
                _id: newUser._id,
                username: newUser.username,
                fullName: newUser.fullName,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            });
        }
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" })
    }
}

