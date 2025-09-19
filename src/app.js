const express = require('express');

const app = express();
const connectDB = require("./config/database.js");
const User = require('./models/user.js');
const { validateSignUpData } = require("./utils/validation.js")
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { userAuth } = require("./middlewares/auth.js")





app.use(express.json())
app.use(cookieParser())




app.post("/signup", async (req, res) => {
    try {


        validateSignUpData(req);
        // console.log(validateSignUpData);

        const { firstName, lastName, emailId, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10)

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        })

        // console.log(user);



        await user.save()
        res.send("user added sussesfully...")

    } catch (error) {
        res.status(400).send("Error saving the user" + error.message)
    }


})

app.post("/login", async (req, res, next) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId: emailId })
        // console.log(user);

        if (!user) {
            throw new Error("Invalid Credentials.")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (isPasswordValid) {


            const token = await jwt.sign({ _id: user._id }, "mypassword" , {
                expiresIn: "1d"
            })

            // console.log(token);


            res.cookie("token", token ,{
                expires: new Date(Date.now() + 8 * 36000 ),
            });
            res.send("User LoggedIn")

        } else {
            throw new Error("Password not Matched.")
        }

    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }
})


app.get("/profile", userAuth , async (req, res) => {

    try {
        // req.user got from userAuth middleware where user is the db data of the particular user who want to see the profile
        const user = req.user;
        if(!user){
            throw new Error("user Not Found")
        }

        res.send(user)

    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }

})


app.get("/feed", async (req, res) => {

    try {
        const users = await User.find({})

        if (users.length === 0) {
            res.status(404).send("Users not found Create a new User")
        } else {
            res.send(users)
        }
    } catch (error) {
        res.status(400).send("something went wrong: " + error.message)
    }
})


app.delete("/user", async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId)
        res.send("User deleted sussesfully")
    } catch (error) {
        res.status(400).send("Something went wrong" + error.message)
    }

})

app.patch("/user/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;


    try {
        const ALLOWE_UPATES = ["photoUrl", "about", "gender", "age", "skills"];
        const isUpdateAllowed = Object.keys(data).every((k) =>
            ALLOWE_UPATES.includes(k)
        );

        if (!isUpdateAllowed) {
            throw new Error("update not allowed");
        }

        if (data?.skills.length > 10) {
            throw new Error("Maximum 10 skills allowed")
        }
        const user = await User.findByIdAndUpdate({ _id: userId }, data, {
            returnDocument: "after",
            runValidators: true,
        })
        //    console.log(user);
        res.send("User updated successfully.")

    } catch (error) {
        res.status(400).send("Can't Update: " + error.message)
    }
})



app.post("/sendConnectionRequest", userAuth ,  async (req, res ,  next) =>{

    const user = req.user;
    

    res.send(user.firstName + " Is Sending A Connection Request !")
    
})





connectDB().then(() => {
    console.log("Database connection established...");

    app.listen(3000, () => {
        console.log("Server is listening on port 3000");

    })

}).catch((error) => {
    console.error("Database cann't be connected...", error);

})

