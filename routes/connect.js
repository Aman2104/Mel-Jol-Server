const express = require('express');
const router = express.Router();
const Connection = require('../models/Connect');
const User = require('../models/User');


router.post('/createconnection', async (req, res) => {
    const { userA, userB } = req.body;
    console.log(userA, userB);

    try {
        const connectionAtoB = new Connection({ currentUser: userA, requestUser: userB });
        await connectionAtoB.save();
        const connectionRequestAtoB = await Connection.findOne({
            currentUser: userA,
            requestUser: userB,
        });

        const connectionRequestBtoA = await Connection.findOne({
            currentUser: userB,
            requestUser: userA,
        });

        if (connectionRequestAtoB && connectionRequestBtoA) {
            const userAUpdate = await User.updateOne(
                { _id: userA, matchedUser: { $ne: userB } }, 
                { $push: { matchedUser: userB } }
            );

            const userBUpdate = await User.updateOne(
                { _id: userB, matchedUser: { $ne: userA } }, 
                { $push: { matchedUser: userA } }
            );
            await Connection.updateOne(
                { _id: connectionRequestAtoB._id },
                { $set: { connected: true } }
            );
            await Connection.updateOne(
                { _id: connectionRequestBtoA._id },
                { $set: { connected: true } }
            );



            res.status(201).json({ message: 'It\'s a Match.' });
        } else {
            res.status(201).json({ message: 'Connection request sent. Waiting for approval.' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.get('/connected-data/:userA', async (req, res) => {
    const { userA } = req.params;
    
    try {
        const connectedDataForUserA = await Connection.find({ currentUser: userA, connected: true }).populate('requestUser', 'name imageUrl');
        res.status(200).json(connectedDataForUserA);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.post('/sendmessage', async (req, res) => {
    const { userA, userB, content } = req.body;

    try {
        const connectionAtoB = await Connection.findOne({
            currentUser: userA,
            requestUser: userB,
        });

        const connectionBtoA = await Connection.findOne({
            currentUser: userB,
            requestUser: userA,
        });

        if (connectionBtoA && connectionAtoB) {
            await addMessageToConversation(connectionAtoB._id, userA, content);
            await addMessageToConversation(connectionBtoA._id, userA, content);

            io.emit('message', { senderId: userA, content });
            res.status(201).json({ message: 'Message sent successfully.' });
        } else {
            res.status(404).json({ message: 'Connection not found.' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/messages', async (req, res) => {
    const { currentUser, requestUser } = req.body;
    console.log(req.body)
    try {
        const connection = await Connection.findOne({
            currentUser: currentUser,
            requestUser: requestUser,
        });

        if (!connection) {
            return res.status(404).json({ message: 'Connection not found.' });
        }

        res.status(200).json({ messages: connection.messages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});







async function addMessageToConversation(connectionId, senderId, content) {
    await Connection.findByIdAndUpdate(
        connectionId,
        {
            $push: {
                messages: {
                    senderId,
                    content,
                },
            },
        },
        { new: true }
    );
}

module.exports = router;
