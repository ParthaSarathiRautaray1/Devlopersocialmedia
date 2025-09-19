const jwt = require('jsonwebtoken')
const User = require("../models/user")

const userAuth = async (req ,res , next) =>{
    try {
        const {token} = req.cookies;
        if(!token){
            throw new Error("Token is Not Valid")

        }
        const decodedObj = await jwt.verify(token , "mypassword");
        const {_id} = decodedObj;

        const user = await User.findById(_id);
        if(!user){
            throw new Error("User not Found");

        }
        // if got user from db then push it to req object and then next()
        req.user = user;
        next()
    } catch (error) {
        res.status(400).send("Error:  " + error.message)
    }
}


module.exports ={
    userAuth,
}