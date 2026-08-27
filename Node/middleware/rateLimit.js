const rateLimit = require('express-rate-limit');

// Login/signup: generous enough for a real user mistyping a password a few
// times, tight enough to make credential stuffing impractical.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again in a few minutes." },
});

// Forgot-password sends an email per request — keep this tighter so the
// route can't be used to mail-bomb an address.
const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many reset requests. Please try again later." },
});

module.exports = { authLimiter, forgotPasswordLimiter };
