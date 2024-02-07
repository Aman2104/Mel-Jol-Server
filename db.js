const mongoose = require("mongoose")
require('dotenv').config()
const MongoConnection = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
    }catch(error){
        console.log(error);
    }
}

module.exports = MongoConnection