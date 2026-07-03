const bcrypt = require('bcryptjs')
const User = require('../model/user.model')
const jwt = require('jsonwebtoken')


// dont forget to do session timeout(logging out)
const register = async (req, res) => {
    const { fullName, userName, email, password, gender } = req.body
    try {

        console.log(req.body);
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).send({
                message: "Email already exists. Please login instead."
            })
        }

        const user = await User.create({
            fullName,
            userName,
            gender,
            email,
            password: hashedPassword,
        })

        const token = await jwt.sign({ id: user._id }, process.env.APP_TOKEN, { expiresIn: "5hr" })
        res.status(200).send({
            message: "User added successfully",
            Data: user, token
        })

    } catch (error) {
        console.log(error);
        res.status(400).send({
            message: "Unable to SignUp"
        })


    }
}

const loginUser = async (req, res) => {
    const { identifier, password } = req.body
    try {
        const isSignedIn = await User.findOne({
            $or: [
                { email: identifier },
                { userName: identifier }
            ]
        })
        if (!isSignedIn) {
            res.status(404).send({
                message: "invalid email or password"
            })
            return;
        }
        if (!isSignedIn.password) {
            res.status(404).send({
                message: "invalid email or password"
            })
            return;
        }
        const isMatch = await bcrypt.compare(password, isSignedIn.password)
        if (!isMatch) {
            res.status(400).send({
                message: "invalid email or password"
            })
            return;
        }
        const token = await jwt.sign({ id: isSignedIn._id }, process.env.APP_TOKEN, { expiresIn: "5hr" })
        //syntax: await jwt.sign(payload[actaul data to be sent or carried, secret[token], expiry])

        res.status(200).send({
            message: "User logged in successfully",
            Data: {
                fullName: isSignedIn.fullName,
                userName: isSignedIn.userName,
                email: isSignedIn.email,
                gender: isSignedIn.gender,
                token
            },
        })


    } catch (error) {
        console.log(error);
        res.status(400).send({
            message: "Unable to login"
        })


    }
}

// Sign in / sign up with Google.
// The frontend obtains a Google OAuth access token in the browser and sends it here.
// We verify it by asking Google for the profile, then find-or-create the user.
const googleAuth = async (req, res) => {
    const { access_token } = req.body
    try {
        if (!access_token) {
            return res.status(400).send({ message: "Missing Google access token" })
        }

        // Verify the token by fetching the user's profile from Google.
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        })
        if (!googleRes.ok) {
            return res.status(401).send({ message: "Invalid or expired Google token" })
        }

        const profile = await googleRes.json()
        const { sub: googleId, email, name } = profile
        if (!email) {
            return res.status(400).send({ message: "Google account did not provide an email" })
        }

        // Find an existing account by email, otherwise create a new one.
        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({
                fullName: name || email.split('@')[0],
                userName: email.split('@')[0],
                email,
                googleId,
            })
        } else if (!user.googleId) {
            // Link Google to a previously password-based account.
            user.googleId = googleId
            await user.save()
        }

        const token = await jwt.sign({ id: user._id }, process.env.APP_TOKEN, { expiresIn: "5hr" })
        res.status(200).send({
            message: "Google sign-in successful",
            Data: {
                fullName: user.fullName,
                userName: user.userName,
                email: user.email,
                gender: user.gender,
                token
            },
            token,
        })

    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Unable to sign in with Google" })
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findByIdAndDelete(id)

        if (!user) {
            return res.status(404).send({
                message: "User not found"
            })
        }
        res.status(200).send({
            message: "User deleted successfully"
        })


    } catch (error) {
        console.log(error);
        res.status(400).send({
            message: "Unable to delete user, try again"
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        res.status(200).send({ message: "Logged out successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Unable to logout" });
    }
};

const getUserProfile = async (req, res) => {
    try {
        // req.user.id comes from the authMiddleware
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send({ message: "Profile fetched successfully", data: user });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Failed to fetch profile" });
    }
};

// Export the new controller
module.exports = { register, loginUser, googleAuth, deleteUser, logoutUser, getUserProfile }