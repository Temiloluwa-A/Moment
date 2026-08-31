const { z } = require('zod');

// Shared building block — reused everywhere a new password is being set, so
// the "at least 6 characters" rule and its message live in exactly one place.
const passwordSchema = z.string().min(6, "Password must be at least 6 characters.");

const registerSchema = z.object({
    fullName: z.string().min(1, "Full name is required."),
    userName: z.string().min(1, "Username is required."),
    email: z.string().email("Enter a valid email address."),
    password: passwordSchema,
    gender: z.enum(['male', 'female']).optional(),
});

const loginSchema = z.object({
    identifier: z.string().min(1, "Username or email is required."),
    password: z.string().min(1, "Password is required."),
});

const googleAuthSchema = z.object({
    access_token: z.string().min(1, "Missing Google access token"),
});

const forgotPasswordSchema = z.object({
    email: z.string().email("Enter a valid email address."),
});

const resetPasswordSchema = z.object({
    password: passwordSchema,
});

const updateProfileSchema = z.object({
    fullName: z.string().min(1).optional(),
    userName: z.string().min(1).optional(),
    gender: z.enum(['male', 'female']).optional(),
    avatarStyle: z.string().min(1).optional(),
}).refine((obj) => Object.keys(obj).length > 0, { message: "No valid fields to update" });

const changePasswordSchema = z.object({
    currentPassword: z.string().optional(),
    newPassword: passwordSchema,
});

module.exports = {
    registerSchema,
    loginSchema,
    googleAuthSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    changePasswordSchema,
};
