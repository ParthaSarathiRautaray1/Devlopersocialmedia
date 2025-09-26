const express = require('express');
const { userAuth } = require('../middlewares/auth');
const userRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const user = require('../models/user');



const USER_POPULATE_DATA = ["firstName" , "lastName" , "photoUrl" , "age" , "gender" , "skills" , "about"]
// get all the pending connection request for the loggedin user 
userRouter.get("/user/request/received" , userAuth , async (req , res , next) => {
    try {
        const loggedInUser = req.user;


        const connectionRequests = await ConnectionRequest.find({
            toUserId : loggedInUser._id,
            status: "interested",
        }).populate("fromUserId" , USER_POPULATE_DATA);  // populate extract those details from the user collection which we ask with giving reference to the fromUserId


        res.json({
            message:`Data Fetched Successfully`,
            data: connectionRequests,
        })

    } catch (error) {
        res.status(400).send("Error " + error.message)
    }
})



userRouter.get("/user/connections" , userAuth , async (req , res , next) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId : loggedInUser._id , status: "accepted"},
                { fromUserId : loggedInUser._id , status: "accepted"}
            ]
        }).populate({
            path: "fromUserId",
            select: USER_POPULATE_DATA
        }).populate({
            path: "toUserId", 
            select: USER_POPULATE_DATA
        })



        const data = connectionRequests.map((row) => {
            // Check if loggedInUser is the sender (fromUserId), return the receiver (toUserId)
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
                return row.toUserId;
            }
            // Otherwise loggedInUser is the receiver (toUserId), return the sender (fromUserId)  
            return row.fromUserId;
        });

        res.json({data})

    } catch (error) {
        res.status(400).send("Error "  + error.message)
    }
})



userRouter.get("/feed" , userAuth , async (req , res , next) => {
    try {
        const loggedInUser = req.user;

        const page = parseInt(req.params.page) || 1 ;
        let limit = parseInt(req.params.limit) || 10 ;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;



        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: loggedInUser._id} , { toUserId: loggedInUser._id }],
        }).select("fromUserId toUserId");


        const hideUserFromFeed = new Set();
        connectionRequests.forEach((req) => {
            hideUserFromFeed.add(req.fromUserId.toString());
            hideUserFromFeed.add(req.toUserId.toString());
        })

        // console.log(hideUserFromFeed);

        const users = await user.find({
           $and: [ 
            {_id:{ $nin : Array.from(hideUserFromFeed)}},
            {_id:{ $ne: loggedInUser._id } } ,],
        }).select(USER_POPULATE_DATA).skip(skip).limit(limit)
        
        res.send({ data : users})

    } catch (error) {
        res.status(400).send("Error " + error.message)
    }
})

module.exports = userRouter;