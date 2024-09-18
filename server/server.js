import express from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import stripe from "./routes/stripe.routes.js";
import dotenv from "dotenv";
import connectMongoDb from "./db/mongoDbConnect.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import path from "path";
import fs from "fs";
import url from "url";

dotenv.config();
// { path: '../.env' }
// const __dirname = path.resolve();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const app = express();
app.use(cors({
    origin: 'https://twiiller.netlify.app',  // Allow requests from your frontend domain
    credentials: true  // Allow cookies to be sent
}));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/stripe", stripe);

// Serve static files from the 'dist' directory
// app.use(express.static(path.join(__dirname, "client", "dist")));

// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
// });

app.get("/", (req, res) => {
    res.send("Hello")
})

app.listen(1000, () => {
    console.log("Server is running on port 1000");
    connectMongoDb();
});
