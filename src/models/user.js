const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
 



const userSchema = new mongoose.Schema({
    
    firstName : {
        type: String,
        required: true,
        minLength: 4,
        maxLenght: 50,
        index: true,
    },
    lastName : {
        type: String,
    },
    emailId : {
        type: String,
        required: true,
        unique: true,
        index: true,
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


userSchema.methods.getJWT = async function (){
    const user = this;

    const token = await jwt.sign({_id:user._id} , "mypassword", {
        expiresIn:"7d",
    })

    return token
}

userSchema.methods.validatePassword = async function (passwordInputByUser){
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(
        passwordInputByUser,
        passwordHash
    );
    return isPasswordValid;
}


module.exports = mongoose.model("User" , userSchema)