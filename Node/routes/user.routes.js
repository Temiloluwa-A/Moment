const express = require("express")
const { loginUser, deleteUser, register, googleAuth, getUserProfile, logoutUser, forgotPassword, resetPassword, updateProfile, changePassword, deleteAccount } = require("../controllers/user.auth")
const authMiddleware = require('../middleware/auth.middleware');
const route = express.Router()

route.post("/signup", register)
route.post("/login", loginUser)
route.post("/google-auth", googleAuth)
route.post("/forgot-password", forgotPassword)
route.post("/reset-password/:token", resetPassword)
route.get("/logout", authMiddleware, logoutUser)
route.delete("/users/:id", authMiddleware, deleteUser)
route.get("/profile", authMiddleware, getUserProfile)
route.patch("/profile", authMiddleware, updateProfile)
route.patch("/profile/password", authMiddleware, changePassword)
route.delete("/profile", authMiddleware, deleteAccount)

module.exports = route;