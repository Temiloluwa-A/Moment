const express = require("express")
const { loginUser, register, googleAuth, getUserProfile, logoutUser, forgotPassword, resetPassword, updateProfile, changePassword, deleteAccount } = require("../controllers/user.auth")
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const { authLimiter, forgotPasswordLimiter } = require('../middleware/rateLimit');
const {
    registerSchema,
    loginSchema,
    googleAuthSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    changePasswordSchema,
} = require('../validation/auth.validation');
const route = express.Router()

route.post("/signup", authLimiter, validate(registerSchema), register)
route.post("/login", authLimiter, validate(loginSchema), loginUser)
route.post("/google-auth", authLimiter, validate(googleAuthSchema), googleAuth)
route.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), forgotPassword)
route.post("/reset-password/:token", authLimiter, validate(resetPasswordSchema), resetPassword)
route.get("/logout", authMiddleware, logoutUser)
route.get("/profile", authMiddleware, getUserProfile)
route.patch("/profile", authMiddleware, validate(updateProfileSchema), updateProfile)
route.patch("/profile/password", authMiddleware, validate(changePasswordSchema), changePassword)
route.delete("/profile", authMiddleware, deleteAccount)

module.exports = route;