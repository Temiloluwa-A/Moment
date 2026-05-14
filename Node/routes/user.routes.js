const express = require("express")
const { loginUser, deleteUser, register, getUserProfile } = require("../controllers/user.auth")
const authMiddleware = require('../middleware/auth.middleware');
const route = express.Router()

route.post("/signup", register)
route.post("/login", loginUser) 
route.get("/logout", deleteUser)
route.get("/profile", authMiddleware, getUserProfile)

module.exports = route;