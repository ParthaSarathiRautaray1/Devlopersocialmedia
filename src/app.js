const express = require('express');
const app = express();

const connectDB = require("./config/database.js");
const cookieParser = require('cookie-parser')


const User = require('./models/user.js');


app.use(express.json())
app.use(cookieParser())


const authRouter = require("./routes/auth.js")
const profileRouter = require("./routes/profile.js")
const requestRouter = require("./routes/request.js");
const userRouter = require("./routes/user.js")



app.use("/" , authRouter );
app.use("/" , profileRouter);
app.use("/" , requestRouter);
app.use("/" , userRouter)





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



connectDB().then(() => {
    console.log("Database connection established...");

    app.listen(3000, () => {
        console.log("Server is listening on port 3000");

    })

}).catch((error) => {
    console.error("Database cann't be connected...", error);

})

