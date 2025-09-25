const express = require('express')
const { userAuth } = require("../middlewares/auth.js");
const ConnectionRequest = require('../models/connectionRequest.js');
const user = require('../models/user.js');




const requestRouter = express.Router()

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res, next) => {

    try {

        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        //checking if any other (status) entered by user 
        const allowedStatus = ["ignored", "interested"]
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid Status Type : " + status })
        }

        // checking is there the reciever ( toUser) is present on db or sender randomly send request to anyone else 
        const toUser = await user.findById(toUserId)
        const toUserFirstName = toUser?.firstName

        if(!toUser){
            return res.status(404).json({message:"Reciever User Not Found !!!"})
        }


        // if there is a existing connection request  i.e A -> B or B -> A  ( Mongo DB query - Or )
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        })

        if (existingConnectionRequest) {
            return res.status(400).send({ message: "Conncetion Request Already Exists !! " })
        }


        // creating and saving new instance of connectionRequest collection
        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        })
        const data = await connectionRequest.save();
        // console.log(data);
        res.json({
            message: `${req.user?.firstName} show ${status} to ${toUserFirstName} . `,
            data,
        })

    } catch (error) {
        res.status(400).send("Error " + error.message)
    }
})


requestRouter.post("/request/review/:status/:requestId" , userAuth , async (req, res , next) =>{
    try {
        const loggedInUser = req.user
        const status = req.params.status
        const requestId = req.params.requestId
        console.log(requestId);
        
        // validate the status 
        // A -> B then only B can accept or reject the request 
        // so B should be the loggedin user 
        // and only status = interested are shown to B so that B should choose which to accept or reject not the ignored by A are comes here
        // request Id A should be Valid

        const allowedStatus = ["accepted" , "rejected"]
        if(!allowedStatus.includes(status)){
            return res.status(400).json({ message: "Invalid Status Type : " + status })
        }

        // checking credentials in database 
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId : loggedInUser._id,
            status: "interested"

        })
        if(!connectionRequest){
            return res.status(400).json({message: "Connection request not found ."})
        }

        // updating the request status in db from interest -> accept or reject
        connectionRequest.status = status;
        const data = await connectionRequest.save()


        res.json({
            message: `Connection Request  ${status}`,
            data,
        })



    } catch (error) {
        res.status(400).send("Error " + error.message)
    }
})


module.exports = requestRouter;