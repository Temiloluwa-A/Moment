const express = require("express")
const { loginUser, deleteUser, register } = require("../controllers/user.auth")
const route = express.Router()

route.post("/signup", register)
route.post("/login", loginUser) 
route.get("/logout", deleteUser)

module.exports = route;