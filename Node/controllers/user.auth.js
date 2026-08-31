const bcrypt = require('bcryptjs')
const path = require('path')
const ejs = require('ejs')
const User = require('../model/user.model')
const Timer = require('../model/timer.model')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')
const AppError = require('../utils/AppError')

const signToken = (userId) => jwt.sign({ id: userId }, process.env.APP_TOKEN, { expiresIn: "5hr" })

// dont forget to do session timeout(logging out)
const register = async (req, res) => {
    const { fullName, userName, email, password, gender } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        throw new AppError(409, "Email already exists. Please login instead.")
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
        fullName,
        userName,
        gender,
        email,
        password: hashedPassword,
    })

    const token = signToken(user._id)

    // Best-effort welcome email — don't fail signup if mail delivery breaks.
    try {
        const clientUrl = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173";
        const html = await ejs.renderFile(path.join(__dirname, '../welcomeMailMessage.ejs'), {
            fullName: user.fullName,
            clientUrl,
        });
        await sendEmail({ to: user.email, subject: "Welcome to Moment", html });
    } catch (mailErr) {
        console.error("Failed to send welcome email:", mailErr.message);
    }

    res.status(200).send({
        message: "User added successfully",
        token,
        data: { fullName: user.fullName, userName: user.userName, email: user.email, gender: user.gender },
    })
}

const loginUser = async (req, res) => {
    const { identifier, password } = req.body
    const isSignedIn = await User.findOne({
        $or: [
            { email: identifier },
            { userName: identifier }
        ]
    })
    if (!isSignedIn || !isSignedIn.password) {
        throw new AppError(401, "Invalid email/username or password")
    }
    const isMatch = await bcrypt.compare(password, isSignedIn.password)
    if (!isMatch) {
        throw new AppError(401, "Invalid email/username or password")
    }
    const token = signToken(isSignedIn._id)
    //syntax: jwt.sign(payload[actual data to be sent or carried, secret[token], expiry])

    res.status(200).send({
        message: "User logged in successfully",
        token,
        data: {
            fullName: isSignedIn.fullName,
            userName: isSignedIn.userName,
            email: isSignedIn.email,
            gender: isSignedIn.gender,
        },
    })
}

// Sign in / sign up with Google.
// The frontend obtains a Google OAuth access token in the browser and sends it here.
// We verify it by asking Google for the profile, then find-or-create the user.
const googleAuth = async (req, res) => {
    const { access_token } = req.body

    // Verify the token by fetching the user's profile from Google.
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
    })
    if (!googleRes.ok) {
        throw new AppError(401, "Invalid or expired Google token")
    }

    const profile = await googleRes.json()
    const { sub: googleId, email, name } = profile
    if (!email) {
        throw new AppError(400, "Google account did not provide an email")
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

    const token = signToken(user._id)
    res.status(200).send({
        message: "Google sign-in successful",
        token,
        data: { fullName: user.fullName, userName: user.userName, email: user.email, gender: user.gender },
    })
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond the same way so attackers can't probe which emails exist.
    const genericMessage = "If an account with that email exists, a password reset link has been sent.";
    if (!user) {
        return res.status(200).send({ message: genericMessage });
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

    res.status(200).send({ message: genericMessage });
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Match against the stored hash, and only while the token is still valid.
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw new AppError(400, "Password reset link is invalid or has expired.")
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    // Invalidate the token so the link can't be reused.
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).send({ message: "Password reset successful. You can now log in." });
};

const logoutUser = async (req, res) => {
    res.status(200).send({ message: "Logged out successfully" });
};

const getUserProfile = async (req, res) => {
    // req.user.id comes from the authMiddleware
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
        throw new AppError(404, "User not found")
    }
    res.status(200).send({ message: "Profile fetched successfully", data: user });
};

// Update the signed-in user's editable profile fields (username, name, gender, avatar).
// req.body is already whitelisted and validated by updateProfileSchema (validate middleware).
const updateProfile = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
        new: true,
        runValidators: true,
    }).select('-password');
    if (!user) {
        throw new AppError(404, "User not found")
    }
    res.status(200).send({ message: "Profile updated successfully", data: user });
};

// Change the signed-in user's password.
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
        throw new AppError(404, "User not found")
    }
    // Google-only accounts may have no password yet — allow setting one without a current password.
    if (user.password) {
        if (!currentPassword) {
            throw new AppError(400, "Current password is required.")
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new AppError(400, "Current password is incorrect.")
        }
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).send({ message: "Password changed successfully." });
};

// Delete the signed-in user's own account (uses the id from the token, not a URL param).
const deleteAccount = async (req, res) => {
    // Orphan their moments rather than deleting them — a collaborator
    // shouldn't lose a shared moment just because the owner left — but hide
    // them from Explore and from members' listings since no one can manage
    // them anymore.
    await Timer.updateMany({ userId: req.user.id }, { isPublic: false, ownerDeleted: true });

    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
        throw new AppError(404, "User not found")
    }
    res.status(200).send({ message: "Account deleted successfully" });
};

// Export the new controller
module.exports = { register, loginUser, googleAuth, logoutUser, getUserProfile, forgotPassword, resetPassword, updateProfile, changePassword, deleteAccount }
