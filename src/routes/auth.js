const express = require('express');
const authRouter = express.Router();
const { validateSignUpData } = require('../utils/validation');
const bcrypt = require("bcrypt");
const User = require('../models/user.js');
const jwt = require('jsonwebtoken')





authRouter.post("/signup", async (req, res) => {
    try {


        validateSignUpData(req);
        // console.log(validateSignUpData);

        const { firstName, lastName, emailId, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10)

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        })

        // console.log(user);



        await user.save()
        res.send("user added sussesfully...")

    } catch (error) {
        res.status(400).send("Error saving the user" + error.message)
    }


})


authRouter.post("/login", async (req, res, next) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId })
        // console.log(user);
        if (!user) {
            throw new Error("Invalid Credentials.")
        }

        const isPasswordValid = await user.validatePassword(password)
        if (isPasswordValid) {

            const token = await user.getJWT(); 
            res.cookie("token", token ,{
                expires: new Date(Date.now() + 8 * 3600000 ),
            });
            res.send("User LoggedIn")

        } else {
            throw new Error("Password not Matched.")
        }

    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }
})


authRouter.post("/logout" , async (req , res , next ) => {
    res.cookie("token" , null , {
        expires: new Date(Date.now()),
    })
    res.send("User Logged Out !")
})





module.exports = authRouter;