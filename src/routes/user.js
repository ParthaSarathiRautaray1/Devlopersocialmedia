const express = require('express');
const { userAuth } = require('../middlewares/auth');
const userRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest")


// get all the pending connection request for the loggedin user 
userRouter.get("/user/request/received" , userAuth , async (req , res , next) => {
    try {
        const loggedInUser = req.user;


        const connectionRequests = await ConnectionRequest.find({
            toUserId : loggedInUser._id,
            status: "interested",
        }).populate("fromUserId" , ["firstName" , "lastName" , "photoUrl" , "age" , "gender" , "skills" , "about"]);  // populate extract those details from the user collection which we ask with giving reference to the fromUserId


        res.json({
            message:`Data Fetched Successfully`,
            data: connectionRequests,
        })

    } catch (error) {
        res.status(400).send("Error " + error.message)
    }
})







module.exports = userRouter;