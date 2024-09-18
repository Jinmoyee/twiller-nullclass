import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: [],
    }],
    profileImg: {
        type: String,
        default: ""
    },
    coverImg: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    likedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: [],
    }],
    // Subscription-related fields
    subscriptionPlan: {
        type: String,
        enum: ['free', 'bronze', 'silver', 'gold'],
        default: 'free'
    },
    subscriptionExpiration: {
        type: Date,
    },
    tweetCount: {
        type: Number,
        default: 0
    },
    tweetLimit: {
        type: Number,
        default: 1  // Default for the 'free' plan
    },
    lastPaymentTime: {
        type: Date,
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
