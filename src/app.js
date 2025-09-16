const express = require('express');

const app = express();


app.use("/hello",(req , res) => {
    res.send("Hello from the Server");
    
})

app.use("/test",(req , res) => {
    res.send("Test from the Server");
    
})

app.use((req , res) => {
    res.send("Response from the HOME PAGE");
    
})

app.listen(3000 , () =>{
    console.log("Server is listening on port 3000");
    
})