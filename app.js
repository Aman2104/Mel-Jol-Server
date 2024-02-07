const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin')
const cors = require('cors')
const userRoutes = require('./routes/user');
const connectionRoute = require('./routes/connect');
const Connection = require('./models/Connect');

const app = express();
const User = require('./models/User');
require('dotenv').config()



const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY
);
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}



app.listen(3000);
// const io = require('socket.io')(server, {
//   cors: {
//     origin: '*'
//   }
// });



app.use(express.json());
app.use(cors());


const connectMongo = async () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB', err);
    });
}
connectMongo()


app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})
app.use('/api', userRoutes);
app.use('/api/connection', connectionRoute);



// io.on('connection', (socket) => {

//   console.log('A user connected', socket.user);

//   socket.on('message', (data) => {
//     saveMessageToDatabase(data);
//     io.emit('message', data);
//   });

//   socket.on('disconnect', () => {
//     console.log('A user disconnected', socket.id);
//   });
// });




const saveMessageToDatabase = async (data) => {
  try {
    const { senderId, content, userA, userB } = data;

    const connectionAtoB = await Connection.findOne({ currentUser: userA, requestUser: userB });
    const connectionBtoA = await Connection.findOne({ currentUser: userB, requestUser: userA });

    connectionAtoB.messages.push({
      senderId,
      content,
    });
    connectionBtoA.messages.push({
      senderId,
      content,
    });

    await connectionAtoB.save();
    await connectionBtoA.save();
  } catch (error) {
    console.error('Error saving message to database:', error);
  }
};




app.post('/sendNotification', async (req, res) => {
  try {
    const { id, code } = req.body
    const user = await User.findById(id);
    if (!user) {
      console.error(req.body);
      return res.status(404).send('User not found');
    }
    const payload = {
      tokens: [user.fcmToken],
      notification: {
        title: 'Basic Notification',
        body: 'This is a basic notification sent from the server!',
      },
      data: {
        receiverId: id,
        code: code,
        navigationTarget: 'VideoCall',
      }
    };
    const response = await admin.messaging().sendMulticast(payload);

    console.log('Successfully sent multicast notification:', response);
    res.status(200).send('Multicast notification sent successfully');
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    res.status(500).send('Internal Server Error');
  }
});

