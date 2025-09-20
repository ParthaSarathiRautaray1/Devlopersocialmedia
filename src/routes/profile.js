const express = require("express")
const { userAuth } = require("../middlewares/auth.js")



const profileRouter = express.Router()

profileRouter.get("/profile", userAuth , async (req, res) => {

    try {
        // req.user got from userAuth middleware where user is the db data of the particular user who want to see the profile
        const user = req.user;
        if(!user){
            throw new Error("user Not Found")
        }

        res.send(user)

    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }

})

module.exports = profileRouter;