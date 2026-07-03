const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile'] }));

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/login' }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });
    // Get the token from the request headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send({ message: "Access Denied. No token provided." });
    }

    try {
        // Verify the token using secret key and attach the decoded user data to the request
        const verified = jwt.verify(token, process.env.APP_TOKEN);
        req.user = verified; // This contains the user's { id: ... }
        next(); // Move on to the next function
    } catch (err) {
        res.status(400).send({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;