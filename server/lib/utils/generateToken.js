import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });

    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, //MS
        httpOnly: false, // prevent XSS attacks cross-site scripting attacks
        sameSite: "none", // CSRF attacks cross-site request forgery attacks
        secure: false
    });
};