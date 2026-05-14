const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // // === DEV MODE: Bypass Authentication ===
    // // We assign a dummy user ID so the database doesn't complain about a missing user!
    // req.user = { id: "000000000000000000000000" };
    // return next();
    // // =======================================

    // Get the token from the request headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).send({ message: "Access Denied. No token provided." });
    }

    try {
        // Verify the token using your secret key and attach the decoded user data to the request
        const verified = jwt.verify(token, process.env.APP_TOKEN);
        req.user = verified; // This contains the user's { id: ... }
        next(); // Move on to the next function
    } catch (err) {
        res.status(400).send({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;