const bcrypt = require('bcryptjs')
const User = require('../model/user.model')
const jwt = require('jsonwebtoken')

// dont forget to do session timeout(logging out)
const register = async (req, res) => {
    const {fullName, userName, email, password, gender} = req.body
    try {
        
        console.log(req.body);
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const existingUser = await User.findOne({email})
        if (existingUser) {
            return res.status(400).send ({
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

        const token = await jwt.sign({id:user._id}, process.env.APP_TOKEN, {expiresIn: "5hr"})
        res.status(200).send ({
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
    const { identifier, password} = req.body
    try {
        const isSignedIn = await User.findOne({
            $or:[
                {email: identifier },
                {userName: identifier}
            ]
        })
        if(!isSignedIn) {
            res.status(404).send ({
                message: "invalid email or password"
            })
            return;
        }
        const isMatch = await bcrypt.compare(password, isSignedIn.password)
        if(!isMatch) {
            res.status(400).send({
                message: "invalid email or password"
            })
            return;
        }
        const token = await jwt.sign({id:isSignedIn._id}, process.env.APP_TOKEN, {expiresIn: "5hr"})
        //syntax: await jwt.sign(payload[actaul data to be sent or carried, secret[token], expiry])

        res.status(200).send ({
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

const deleteUser =  async (req, res) => {
    const {id} = req.params
    try {
        const user = await User.findByIdAndDelete(id)

        if(!user) {
            return res.status(404).send ({
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
module.exports = {register, loginUser, deleteUser, logoutUser, getUserProfile}