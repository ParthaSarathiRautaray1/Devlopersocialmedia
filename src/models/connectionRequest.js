const mongoose = require("mongoose")

const connectionRequestSchema = new mongoose.Schema({
    
    fromUserId :{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User" // connecting 2 collection of db i.e user & connectionRequest 

    },

    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
    },

    status:{
        type: String,
        enum: {
            values: ["ignored" , "interested" , "accepted" , "rejected"],
            message: `{VALUE} is incorrect status`
        }
    }

} ,
{   timestamps: true    }

)

// when 1000 of users sending request for connection ( cunncurrent users ) so the db is hang
//  to handle it we can use index in this case we use compound index i.e one index that include 2 field to handle optimization.
connectionRequestSchema.index({fromUserId: 1 , toUserId: 1})



connectionRequestSchema.pre("save" , function(next) {
    const connectionRequest = this;

    // checking if the fromuserId is same as the touserId i.e connnection request from A -> A 
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cann't send connection Request to Yourself !")
    }
    next();
})


const ConnectionRequestModel = new mongoose.model("connectionRequest" , connectionRequestSchema)

module.exports = ConnectionRequestModel