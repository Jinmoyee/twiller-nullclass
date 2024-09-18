import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary"

export const getUserProfile = async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username }).select("-password")
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params
        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id)
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "Cannot follow or unfollow yourself" })
        }
        if (!currentUser || !userToModify) {
            return res.status(404).json({ error: "User not found" })
        }
        const isFollowing = currentUser.following.includes(id)
        if (isFollowing) {
            //Unfollow
            // I am the user who is unfollowing another user so I am going to get a following number(-1).
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            // The id or the another user is going to get (-1) followers because I unfollowed.
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })

            res.status(200).json({ message: "Unfollowed user successfully" })
        } else {
            //Follow
            // I am the user who is following another user so I am going to get a following number.
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            // The id or the another user is going to get a follower from me.
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })

            const newNotification = new Notification({
                from: req.user._id,
                to: userToModify._id,
                type: "follow",
            })

            await newNotification.save()
            res.status(200).json({ message: "Followed user successfully" })
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id
        const usersFollowedByMe = await User.findById(userId).select("following")

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                },
            },
            {
                $sample: { size: 10 }
            },
        ])

        const filterUsers = users.filter(users => !usersFollowedByMe.following.includes(users._id))

        const suggestedUsers = filterUsers.slice(0, 4)

        suggestedUsers.forEach((user) => (user.password = null))

        res.status(200).json(suggestedUsers)

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { username, fullName, email, password, resetPassword, bio, link, location } = req.body
        let { profileImg, coverImg } = req.body

        const userId = req.user._id
        let user = await User.findOne(userId)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        if ((password && !resetPassword) || (!password && resetPassword)) {
            return res.status(400).json({ error: "Provide the password in the given fields" })
        }

        if (password && resetPassword) {
            const validPassword = bcrypt.compareSync(password, user.password)
            if (!validPassword) {
                return res.status(401).json({ error: "Invalid password" })
            }
            if (resetPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters long" })
            }

            const hashPassword = bcrypt.hashSync(resetPassword, 12)

            //
            await User.findByIdAndUpdate(userId, { password: hashPassword })
        }
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uploadResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadResponse.secure_url
        }
        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uploadResponse = await cloudinary.uploader.upload(coverImg)
            profileImg = uploadResponse.secure_url
        }

        user.fullName = fullName || user.fullName
        user.username = username || user.username
        user.email = email || user.email
        user.bio = bio || user.bio
        user.link = link || user.link
        user.location = location || user.location
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg
        user = await user.save()

        user.password = null

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json(error.message)
    }
}