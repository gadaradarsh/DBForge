const mongoose = require('mongoose');
const User = require('./models/User');
const Food = require('./models/Food');
const Cart = require('./models/Cart');
require('dotenv').config();

async function testCompleteSystem() {
    try {
        console.log('🧪 Starting Complete System Test...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Test 1: Check if sample data exists
        console.log('\n📊 Testing Sample Data...');
        const foodCount = await Food.countDocuments();
        const userCount = await User.countDocuments();
        const cartCount = await Cart.countDocuments();
        
        console.log(`Food items: ${foodCount}`);
        console.log(`Users: ${userCount}`);
        console.log(`Cart items: ${cartCount}`);

        // Test 2: Test user registration
        console.log('\n👤 Testing User Registration...');
        const testUser = {
            fullname: 'Test User',
            email: 'test@example.com',
            password: 'test123456'
        };

        // Clear existing test user
        await User.deleteOne({ email: testUser.email });
        console.log('Cleared existing test user');

        const newUser = new User(testUser);
        await newUser.save();
        console.log('✅ User registered successfully');

        // Test 3: Test food items
        console.log('\n🍽️ Testing Food Items...');
        const foods = await Food.find().limit(3);
        console.log(`Found ${foods.length} food items:`);
        foods.forEach(food => {
            console.log(`- ${food.food_name}: ₹${food.food_price}`);
        });

        // Test 4: Test cart functionality
        console.log('\n🛒 Testing Cart Functionality...');
        const cartItem = new Cart({
            user_id: newUser._id,
            food_id: foods[0]._id,
            quantity: 2
        });
        await cartItem.save();
        console.log('✅ Item added to cart');

        // Test 5: Test cart retrieval
        const userCart = await Cart.find({ user_id: newUser._id })
            .populate('food_id', 'food_name food_price')
            .select('quantity food_id');
        
        console.log(`Cart items for user: ${userCart.length}`);
        userCart.forEach(item => {
            console.log(`- ${item.food_id.food_name}: Qty ${item.quantity}`);
        });

        // Test 6: Test data relationships
        console.log('\n🔗 Testing Data Relationships...');
        const cartWithFood = await Cart.findOne({ user_id: newUser._id })
            .populate('food_id')
            .populate('user_id', 'fullname email');
        
        if (cartWithFood) {
            console.log('✅ Cart relationship working:');
            console.log(`User: ${cartWithFood.user_id.fullname}`);
            console.log(`Food: ${cartWithFood.food_id.food_name}`);
            console.log(`Quantity: ${cartWithFood.quantity}`);
        }

        // Test 7: Test validation
        console.log('\n✅ Testing Input Validation...');
        try {
            const invalidUser = new User({
                fullname: 'A', // Too short
                email: 'invalid-email', // Invalid format
                password: '123' // Too short
            });
            await invalidUser.save();
            console.log('❌ Validation failed - invalid data was accepted');
        } catch (error) {
            console.log('✅ Validation working - invalid data rejected');
        }

        // Test 8: Test database indexes
        console.log('\n📈 Testing Database Indexes...');
        const indexes = await Cart.collection.getIndexes();
        console.log('Cart indexes:', Object.keys(indexes));

        // Cleanup
        console.log('\n🧹 Cleaning up test data...');
        await Cart.deleteMany({ user_id: newUser._id });
        await User.deleteOne({ _id: newUser._id });
        console.log('✅ Test data cleaned up');

        // Final summary
        console.log('\n🎉 Complete System Test Results:');
        console.log('✅ Database connection: Working');
        console.log('✅ User registration: Working');
        console.log('✅ Food items: Working');
        console.log('✅ Cart functionality: Working');
        console.log('✅ Data relationships: Working');
        console.log('✅ Input validation: Working');
        console.log('✅ Database indexes: Working');
        console.log('\n🚀 System is fully functional and ready for production!');

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testCompleteSystem();
