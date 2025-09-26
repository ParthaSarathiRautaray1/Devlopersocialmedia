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

        // Get logged in user's skills for matching
        const loggedInUserSkills = loggedInUser.skills || [];

        // Sort users by skill similarity (users with more matching skills appear first)
        const sortedUsers = users.sort((userA, userB) => {
            const userASkills = userA.skills || [];
            const userBSkills = userB.skills || [];

            // Count matching skills with logged in user
            const userAMatches = userASkills.filter(skill => 
                loggedInUserSkills.includes(skill)
            ).length;

            const userBMatches = userBSkills.filter(skill => 
                loggedInUserSkills.includes(skill)
            ).length;

            // Handle corner cases:
            // 1. If both users have skill matches, sort by match count
            if (userAMatches > 0 || userBMatches > 0) {
                return userBMatches - userAMatches;
            }

            // 2. If no skill matches, prioritize users who have skills over users with no skills
            if (userASkills.length === 0 && userBSkills.length > 0) {
                return 1; // userB comes first (has skills)
            }
            if (userBSkills.length === 0 && userASkills.length > 0) {
                return -1; // userA comes first (has skills)
            }

            // 3. If both have no skills or both have skills but no matches, maintain original order
            return 0;
        });
        
        res.send({ data : sortedUsers})

    } catch (error) {
        res.status(400).send("Error " + error.message)
    }
})

module.exports = userRouter;