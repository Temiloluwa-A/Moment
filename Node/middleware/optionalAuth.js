const jwt = require('jsonwebtoken');

// Like auth.middleware.js, but never rejects — attaches req.user when a valid
// token is present, otherwise leaves it undefined and continues. For routes
// that are publicly viewable but want to personalize the response for a
// logged-in caller (e.g. "have I already voted on this pin?").
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next();

    try {
        req.user = jwt.verify(token, process.env.APP_TOKEN);
    } catch {
        // Invalid/expired token on an optional route — just proceed unauthenticated
        // rather than rejecting a request that doesn't strictly require login.
    }
    next();
};

module.exports = optionalAuth;
