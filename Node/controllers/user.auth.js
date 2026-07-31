const bcrypt = require('bcryptjs')
const User = require('../model/user.model')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')


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
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        // Always respond the same way so attackers can't probe which emails exist.
        const genericMessage = "If an account with that email exists, a password reset link has been sent.";
        if (!user) {
            return res.status(200).json({ message: genericMessage });
        }

        // Generate a raw token for the link, store only its hash.
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Point the link back at whichever frontend made the request.
        const clientUrl = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173";
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: "Reset your Moment password",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2E241A;">
                        <h2 style="font-style: italic; color: #A9631E;">Moment</h2>
                        <p>Hi ${user.fullName || "there"},</p>
                        <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
                        <p style="text-align: center; margin: 32px 0;">
                            <a href="${resetUrl}" style="background: #A9631E; color: #F7EFE0; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: bold;">Reset password</a>
                        </p>
                        <p style="font-size: 12px; color: #6E6050;">If you didn't request this, you can safely ignore this email. If the button doesn't work, paste this link into your browser:</p>
                        <p style="font-size: 12px; word-break: break-all; color: #6E6050;">${resetUrl}</p>
                    </div>
                `,
            });
        } catch (mailErr) {
            // Don't fail the request if email delivery breaks — log a fallback link
            // so the flow is still usable in development / if SMTP is misconfigured.
            console.error("Failed to send reset email:", mailErr.message);
            console.log(`Password reset link for ${email}: ${resetUrl}`);
        }

        res.status(200).json({ message: genericMessage });

    } catch (error) {
        console.error("Error in forgotPassword: ", error);
        res.status(500).json({ message: "An internal server error occurred." });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        // Match against the stored hash, and only while the token is still valid.
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Password reset link is invalid or has expired." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        // Invalidate the token so the link can't be reused.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful. You can now log in." });

    } catch (error) {
        console.error("Error in resetPassword: ", error);
        res.status(500).json({ message: "An internal server error occurred." });
    }
};


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

// Update the signed-in user's editable profile fields (username, name, gender, avatar).
const updateProfile = async (req, res) => {
    try {
        // Whitelist — the schema is strict:"throw", so only set known, safe fields.
        const allowed = ['fullName', 'userName', 'gender', 'avatarStyle'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined && req.body[key] !== '') updates[key] = req.body[key];
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).send({ message: "No valid fields to update" });
        }
        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true,
        }).select('-password');
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send({ message: "Profile updated successfully", data: user });
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Unable to update profile" });
    }
};

// Change the signed-in user's password.
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).send({ message: "New password must be at least 6 characters." });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        // Google-only accounts may have no password yet — allow setting one without a current password.
        if (user.password) {
            if (!currentPassword) {
                return res.status(400).send({ message: "Current password is required." });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).send({ message: "Current password is incorrect." });
            }
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.status(200).send({ message: "Password changed successfully." });
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Unable to change password" });
    }
};

// Delete the signed-in user's own account (uses the id from the token, not a URL param).
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.status(200).send({ message: "Account deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: "Unable to delete account" });
    }
};

// Export the new controller
module.exports = { register, loginUser, googleAuth, deleteUser, logoutUser, getUserProfile, forgotPassword, resetPassword, updateProfile, changePassword, deleteAccount }