const mongoose = require('mongoose')

const connectDB = async () =>{
    await mongoose.connect(
        "mongodb+srv://parthasarathirautaray176_db_user:Ghi3gPMyVbVGLq7i@cluster0.ykh0qg8.mongodb.net/devtinder"
    )
}



module.exports = connectDB;



