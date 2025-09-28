const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testAuth() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Test user creation
        console.log('\n--- Testing User Registration ---');
        const testUser = new User({
            fullname: 'Test User',
            email: 'test@example.com',
            password: 'testpassword123'
        });

        // Clear any existing test user
        await User.deleteOne({ email: 'test@example.com' });
        console.log('Cleared existing test user');

        await testUser.save();
        console.log('✅ User created successfully');

        // Test user login
        console.log('\n--- Testing User Login ---');
        const foundUser = await User.findOne({ email: 'test@example.com' });
        console.log('Found user:', foundUser ? 'Yes' : 'No');
        
        if (foundUser) {
            console.log('User details:', {
                id: foundUser._id,
                name: foundUser.fullname,
                email: foundUser.email,
                password: foundUser.password
            });
            
            // Test password comparison
            const passwordMatch = foundUser.password === 'testpassword123';
            console.log('Password match:', passwordMatch);
        }

        // Clean up
        await User.deleteOne({ email: 'test@example.com' });
        console.log('✅ Test user cleaned up');

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testAuth();
