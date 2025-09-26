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



        const loggedInUserSkills = loggedInUser.skills || [];

        const users = await user.aggregate([
            // Stage 1: Lookup connection requests to find users to exclude
            {
                $lookup: {
                    from: "connectionrequests",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $or: [
                                                { $eq: ["$fromUserId", "$$userId"] },
                                                { $eq: ["$toUserId", "$$userId"] }
                                            ]
                                        },
                                        {
                                            $or: [
                                                { $eq: ["$fromUserId", loggedInUser._id] },
                                                { $eq: ["$toUserId", loggedInUser._id] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "connectionHistory"
                }
            },

            // Stage 2: Filter out users with connection history and logged-in user
            {
                $match: {
                    $and: [
                        { connectionHistory: { $size: 0 } }, // No connection history
                        { _id: { $ne: loggedInUser._id } }   // Not the logged-in user
                    ]
                }
            },

            // Stage 3: Add skill matching calculations
            {
                $addFields: {
                    skillMatches: {
                        $size: {
                            $setIntersection: [
                                { $ifNull: ["$skills", []] },
                                loggedInUserSkills
                            ]
                        }
                    },
                    hasSkills: {
                        $gt: [{ $size: { $ifNull: ["$skills", []] } }, 0]
                    }
                }
            },

            // Stage 4: Sort by skill relevance
            {
                $sort: {
                    skillMatches: -1,  // First: More skill matches
                    hasSkills: -1,     // Second: Users with skills
                    _id: 1             // Third: Consistent ordering
                }
            },

            // Stage 5: Select only required fields
            {
                $project: {
                    firstName: 1,
                    lastName: 1, 
                    photoUrl: 1,
                    age: 1,
                    gender: 1,
                    skills: 1,
                    about: 1
                }
            },

            // Stage 6: Pagination
            { $skip: skip },
            { $limit: limit }
        ]);
        
        res.send({ data: users })

    } catch (error) {
        res.status(400).send("Error " + error.message)
    }
})

module.exports = userRouter;