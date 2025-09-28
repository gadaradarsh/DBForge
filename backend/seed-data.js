const mongoose = require('mongoose');
const Food = require('./models/Food');
require('dotenv').config();

// Sample food data
const sampleFoods = [
  {
    food_name: 'Delicious Pizza',
    food_price: 299,
    food_image: './images/Pizza.jpeg'
  },
  {
    food_name: 'Crispy Burger',
    food_price: 199,
    food_image: './images/Burger.jpeg'
  },
  {
    food_name: 'Tasty Dosa',
    food_price: 149,
    food_image: './images/Dosa.jpeg'
  },
  {
    food_name: 'Paneer Parantha',
    food_price: 179,
    food_image: './images/Paneerparantha.jpeg'
  },
  {
    food_name: 'Chocolate Shake',
    food_price: 129,
    food_image: './images/Chocolateshake.jpeg'
  },
  {
    food_name: 'Strawberry Shake',
    food_price: 129,
    food_image: './images/Strawberryshake.jpeg'
  },
  {
    food_name: 'Vanilla Shake',
    food_price: 119,
    food_image: './images/Vanillashake.jpeg'
  },
  {
    food_name: 'Butterscotch Shake',
    food_price: 139,
    food_image: './images/Butterscotchshake.jpeg'
  },
  {
    food_name: 'Pav Bhaji',
    food_price: 89,
    food_image: './images/Pavbhaji.jpeg'
  },
  {
    food_name: 'Aloo Parantha',
    food_price: 99,
    food_image: './images/Alooparantha.jpeg'
  },
  {
    food_name: 'Gobi Parantha',
    food_price: 109,
    food_image: './images/Gobiparantha.jpeg'
  },
  {
    food_name: 'Pyaz Parantha',
    food_price: 79,
    food_image: './images/Pyazparantha.jpeg'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing foods
    await Food.deleteMany({});
    console.log('Cleared existing foods');

    // Insert sample foods
    await Food.insertMany(sampleFoods);
    console.log('Sample foods inserted successfully');

    // Close connection
    await mongoose.disconnect();
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
