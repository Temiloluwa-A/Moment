const express = require("express")
const { loginUser, register, googleAuth, getUserProfile, logoutUser, forgotPassword, resetPassword, updateProfile, changePassword, deleteAccount } = require("../controllers/user.auth")
const authMiddleware = require('../middleware/auth.middleware');
const { authLimiter, forgotPasswordLimiter } = require('../middleware/rateLimit');
const route = express.Router()

route.post("/signup", authLimiter, register)
route.post("/login", authLimiter, loginUser)
route.post("/google-auth", authLimiter, googleAuth)
route.post("/forgot-password", forgotPasswordLimiter, forgotPassword)
route.post("/reset-password/:token", authLimiter, resetPassword)
route.get("/logout", authMiddleware, logoutUser)
route.get("/profile", authMiddleware, getUserProfile)
route.patch("/profile", authMiddleware, updateProfile)
route.patch("/profile/password", authMiddleware, changePassword)
route.delete("/profile", authMiddleware, deleteAccount)

module.exports = route;