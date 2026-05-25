const express = require("express")
const { loginUser, deleteUser, register, getUserProfile, logoutUser } = require("../controllers/user.auth")
const authMiddleware = require('../middleware/auth.middleware');
const route = express.Router()

route.post("/signup", register)
route.post("/login", loginUser)
route.get("/logout", authMiddleware, logoutUser)
route.delete("/users/:id", authMiddleware, deleteUser)
route.get("/profile", authMiddleware, getUserProfile)

module.exports = route;