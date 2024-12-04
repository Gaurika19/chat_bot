const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/chatbot', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('MongoDB connection error:', error));

// User data schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  coursePreferences: [String],
  wantsToTalkToSales: Boolean, // Added new field to track if user wants to talk to sales team
});

const User = mongoose.model('User', userSchema);

// API route to save user data
app.post('/api/users', async (req, res) => {
  const { name, email, phone, coursePreferences, wantsToTalkToSales } = req.body;
  const user = new User({ name, email, phone, coursePreferences, wantsToTalkToSales });
  
  try {
    await user.save();
    res.status(201).send('User data saved');
    
    // If the user wants to talk to sales, trigger the sales team interaction
    if (wantsToTalkToSales) {
      // Logic to notify the sales team can be added here (e.g., email or trigger a notification system)
      console.log(`User wants to talk to sales team. Sales team will be notified.`);
    } else {
      console.log('User does not want to talk to sales.');
    }
  } catch (error) {
    res.status(500).send('Error saving user data');
  }
});

// API route to handle user decision for sales team
app.post('/api/sales', async (req, res) => {
  const { userResponse } = req.body;

  if (userResponse === 'yes') {
    res.status(200).send('Someone from our sales team will contact you soon.');
  } else if (userResponse === 'no') {
    res.status(200).send('Thanks for your time.');
  } else {
    res.status(400).send('Invalid response.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
