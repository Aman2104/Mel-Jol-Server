const mongoose = require("mongoose")
require('dotenv').config()
const MongoConnection = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("connected");
    }catch(error){
        console.log("error"+error);
    }
}

module.exports = MongoConnection