const mongoose = require('mongoose');
const validator = require('validator');
const userSchema = new mongoose.Schema({
    
    firstName : {
        type: String,
        required: true,
        minLength: 4,
        maxLenght: 50,
    },
    lastName : {
        type: String,
    },
    emailId : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email Address:" + value );
            }
        }
    },
    password : {
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter a Strong Password .")
            }
        }
    },
    age : {
        type: Number,
        min: 18,
    },
    gender : {
        type: String,
        validate(value){
            if(!["male" , "female" , "others"].includes(value)){
                throw new Error("Gender data not valid. ! ")
            }
        }
    },
    photoUrl:{
        type: String,
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Enter a Valid Photo URL")
            }
        }
      
    },

    about: {
        type: String,
        default: "This is default about section of user!",
    },
    skills: {
        type: [String],
    },
},
{
    timestamps:true,
}
)



module.exports = mongoose.model("User" , userSchema)