const express = require("express")
const { userAuth } = require("../middlewares/auth.js");
const { validateEditProfileData } = require("../utils/validation.js");



const profileRouter = express.Router()

profileRouter.get("/profile/view", userAuth , async (req, res) => {

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

profileRouter.patch("/profile/edit" , userAuth , async (req , res) => {
    try {
        if(!validateEditProfileData(req)){
            throw new Error("Invalid Edit Request");
            
        }

        const LoggedInUser = req.user;
        
        Object.keys(req.body).forEach((key) => (LoggedInUser[key] = req.body[key] ) );

        await LoggedInUser.save()
        // console.log(LoggedInUser);
        
      
        res.json({message: `${LoggedInUser.firstName } , Your Profile Updated Successfully` , data:LoggedInUser , })
 
    } catch (error) {
        res.status(400).send("Error : " + error.message );
    }
})

module.exports = profileRouter;