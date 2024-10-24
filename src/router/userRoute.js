const router = require("express").Router();
const UserRegistrationModel = require('../model/registration');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post("/register", async (req, res) => {

    const { fullName, email, mobile, designation, password } = req.body;
    try {

        const user = await UserRegistrationModel.findOne({ email });

        if (user) {
            return res.json({
                message: "User Exist allready",
                status: 400
            })
        }

        const HashPassword = await bcrypt.hash(password, 10);

        const newUser = new UserRegistrationModel({
            fullName,
            email,
            mobile,
            designation,
            password: HashPassword
        });
        console.log('newUser', newUser);
        const savedUser = await newUser.save();

        return res.json({
            message: "User Registration Successfully",
            success: true,
            savedUser
        })

    } catch (error) {
        console.log(error);
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserRegistrationModel.findOne({ email });

        if (!user) {
            return res.json({
                error: "User not exist"
            }, { status: 400 })
        }
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.json({
                error: "Invalid Password"
            }, { status: 401 })
        }
        const tokenData = {
            id: user._id,
            email: user.email,
            fullName: user.fullName
        }

        const token = await jwt.sign(tokenData, process.env.TOKEN, { expiresIn: "1h" })
        const response = res.json({
            message: "User Login Successfully",
        })
        response.cookie.set("token", token, {
            httpOnly: true
        })

        return response
    } catch (error) {
        console.log(error)
    }
})
module.exports = router;