const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envContent = `# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/restaurant

# JWT Secret Key (change this to a secure random string in production)
ACCESS_TOKEN=your_super_secret_jwt_key_here_12345

# Server Port
PORT=5000
`;

if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 You can edit the .env file to customize your settings.');
} else {
    console.log('⚠️  .env file already exists. Skipping creation.');
}

console.log('\n🔧 Environment variables:');
console.log('MONGODB_URI=mongodb://localhost:27017/restaurant');
console.log('ACCESS_TOKEN=your_super_secret_jwt_key_here_12345');
console.log('PORT=5000');
