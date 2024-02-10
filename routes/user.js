const express = require('express');
const router = express.Router();
const User = require('../models/User');



router.post('/newuser/details', async (req, res) => {
  const { uid, name, email, age, height, gender, imageUrl, fcmToken } = req.body;
  const user = new User({
    uid,
    name,
    email,
    age,
    height,
    gender,
    imageUrl,
    fcmToken
  });

  try {
    const newUser = await user.save();
    console.log(newUser)
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.put('/updateuser/details/:uid', async (req, res) => {
  const uidToUpdate = req.params.uid;
  const updatedFields = req.body;
  console.log(uidToUpdate, updatedFields);
  try {
    const updatedUser = await User.findOneAndUpdate(
      { uid: uidToUpdate },
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(updatedUser);
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.get('/user/details/:uid', async (req, res) => {
  const { uid } = req.params;
  console.log(uid);

  try {
    const user = await User.findOne({ uid }).populate({
      path: 'matchedUser',
      model: 'User',
      select: 'name imageUrl job',
    });
    // console.log(user)
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    // const { gender } = req.query;
    // if (gender) {
      const users = await User.find();
      res.json(users);
    // } else {
    //   const users = await User.find();
    //   res.json(users);
    // }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/sendNotification', async (req, res) => {
  try {
    const { id } = req.body
    console.log(req.body);
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    console.log(user);

    const response = await admin.messaging().send({
      token: user.fcmToken,
      notification: {
        title: 'Basic Notification',
        body: 'This is a basic notification sent from the server!',
      },
    });

    console.log('Successfully sent multicast notification:', response);
    res.status(200).send('Multicast notification sent successfully');
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = router;
