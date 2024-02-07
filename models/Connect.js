const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    currentUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    connected: { 
        type: Boolean, 
        default: false 
    },
    messages: [
        {
            senderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
        },
    ],
});

module.exports = mongoose.model('Connection', connectionSchema);
// module.exports= Connect