const bcrypt = require('bcryptjs')
const User = require('../model/user.model')
const jwt = require('jsonwebtoken')

// dont forget to do session timeout(logging out)
const register = async (req, res) => {
    const {firstName, lastName, userName, email, password, gender} = req.body
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
            firstName,
            lastName,
            userName,
            email,
            password: hashedPassword,
            gender

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
    const { email, password} = req.body
    try {
        const isSignedIn = await User.findOne({email})
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
                firstName: isSignedIn.firstName,
                lastName: isSignedIn.lastName,
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
            message: "User logged out successfully"
        })

        
    } catch (error) {
        console.log(error);
        res.status(400).send({
            message: "Unable to logout, try again"
        })
    }
}

//  
module.exports = {register, loginUser, deleteUser}