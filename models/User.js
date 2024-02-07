const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    matchedUser: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'user'
    },
    fcmToken: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("User", userSchema);
//  = User
