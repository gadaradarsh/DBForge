const mongoose = require('mongoose');
require('dotenv').config();

// Test MongoDB connection
async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connection successful!');
        
        // Test creating a simple document
        const testSchema = new mongoose.Schema({ name: String });
        const TestModel = mongoose.model('Test', testSchema);
        
        const testDoc = new TestModel({ name: 'Test Document' });
        await testDoc.save();
        console.log('✅ Document creation successful!');
        
        // Clean up test document
        await TestModel.deleteOne({ name: 'Test Document' });
        console.log('✅ Test cleanup successful!');
        
        await mongoose.disconnect();
        console.log('✅ MongoDB connection closed successfully!');
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();

