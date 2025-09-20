const express = require('express')
const { userAuth } = require("../middlewares/auth.js")




const requestRouter = express.Router()

requestRouter.post("/sendConnectionRequest", userAuth, async (req, res, next) => {

    const user = req.user;


    res.send(user.firstName + " Is Sending A Connection Request !")

})


module.exports = requestRouter;