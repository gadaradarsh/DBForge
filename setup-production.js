const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Restaurant Management System for Production...\n');

// 1. Create production environment file
const prodEnvContent = `# Production Environment Variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant
ACCESS_TOKEN=your_super_secure_jwt_secret_key_here_change_in_production
PORT=5000

# Security
CORS_ORIGIN=https://yourdomain.com
SESSION_SECRET=your_session_secret_here

# Email Configuration (for future use)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Gateway (for future use)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
`;

fs.writeFileSync(path.join(__dirname, 'backend', '.env.production'), prodEnvContent);
console.log('✅ Created production environment file');

// 2. Create production build script
const buildScript = `#!/bin/bash
echo "🏗️ Building Restaurant Management System for Production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🎨 Building frontend..."
cd restaurant-management-system-master
npm run build

# Copy build files to backend public directory
echo "📁 Copying build files..."
cp -r build/* ../backend/public/

echo "✅ Production build complete!"
echo "🚀 To start the production server:"
echo "   cd backend && npm start"
`;

fs.writeFileSync(path.join(__dirname, 'build-production.sh'), buildScript);
console.log('✅ Created production build script');

// 3. Create Docker configuration
const dockerfileContent = `FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm install --only=production

# Copy application code
COPY backend/ .

# Create public directory for frontend build
RUN mkdir -p public

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
`;

fs.writeFileSync(path.join(__dirname, 'Dockerfile'), dockerfileContent);
console.log('✅ Created Dockerfile');

// 4. Create docker-compose file
const dockerComposeContent = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/restaurant
      - ACCESS_TOKEN=your_jwt_secret_here
    depends_on:
      - mongo
    volumes:
      - ./backend/public:/app/public

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
`;

fs.writeFileSync(path.join(__dirname, 'docker-compose.yml'), dockerComposeContent);
console.log('✅ Created docker-compose.yml');

// 5. Create deployment guide
const deploymentGuide = `# Restaurant Management System - Production Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Traditional VPS/Server

1. **Server Requirements:**
   - Node.js 18+
   - MongoDB 5.0+
   - 2GB RAM minimum
   - 10GB storage

2. **Deployment Steps:**
   \`\`\`bash
   # Clone repository
   git clone <your-repo-url>
   cd restaurant-management-system-master
   
   # Install dependencies
   npm install
   cd backend && npm install
   
   # Set up environment
   cp .env.production .env
   # Edit .env with your production values
   
   # Build frontend
   cd .. && npm run build
   
   # Copy build to backend
   cp -r build/* backend/public/
   
   # Start application
   cd backend && npm start
   \`\`\`

### Option 2: Docker Deployment

1. **Using Docker Compose:**
   \`\`\`bash
   # Build and start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   \`\`\`

2. **Using Docker:**
   \`\`\`bash
   # Build image
   docker build -t restaurant-app .
   
   # Run with MongoDB
   docker run -d --name restaurant-app -p 5000:5000 restaurant-app
   \`\`\`

### Option 3: Cloud Deployment

#### Heroku:
1. Create Heroku app
2. Add MongoDB Atlas addon
3. Set environment variables
4. Deploy with Git

#### Vercel (Frontend) + Railway (Backend):
1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Connect to MongoDB Atlas

#### AWS/GCP/Azure:
1. Use container services (ECS/GKE/AKS)
2. Set up managed MongoDB
3. Configure load balancer
4. Set up monitoring

## 🔧 Environment Variables

### Required:
- \`MONGODB_URI\`: MongoDB connection string
- \`ACCESS_TOKEN\`: JWT secret key
- \`NODE_ENV\`: production

### Optional:
- \`PORT\`: Server port (default: 5000)
- \`CORS_ORIGIN\`: Allowed origins
- \`SESSION_SECRET\`: Session secret

## 📊 Monitoring & Maintenance

### Health Checks:
- \`GET /api/health\` - Application health
- \`GET /api/debug/users\` - User count
- \`GET /api/foods\` - Food items count

### Logs:
- Application logs: \`npm start\` output
- Database logs: MongoDB logs
- Server logs: System logs

### Backup:
- Database: MongoDB backup scripts
- Files: Regular backup of uploads
- Code: Git repository

## 🔒 Security Checklist

- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Set up CORS properly
- [ ] Enable MongoDB authentication
- [ ] Use environment variables
- [ ] Set up rate limiting
- [ ] Enable request logging
- [ ] Set up monitoring alerts

## 📈 Performance Optimization

- [ ] Enable MongoDB indexes
- [ ] Use CDN for static files
- [ ] Implement caching
- [ ] Optimize images
- [ ] Use compression
- [ ] Set up load balancing

## 🆘 Troubleshooting

### Common Issues:
1. **Database Connection Error**: Check MONGODB_URI
2. **JWT Errors**: Verify ACCESS_TOKEN
3. **CORS Issues**: Check CORS_ORIGIN
4. **Port Issues**: Check PORT variable

### Debug Commands:
\`\`\`bash
# Check application status
curl http://localhost:5000/api/health

# Check database connection
node backend/test-connection.js

# Run complete system test
node backend/test-complete-system.js
\`\`\`

## 📞 Support

For issues and questions:
- Check logs first
- Review environment variables
- Test with debug scripts
- Contact development team

---

**🎉 Your Restaurant Management System is ready for production!**
`;

fs.writeFileSync(path.join(__dirname, 'DEPLOYMENT_GUIDE.md'), deploymentGuide);
console.log('✅ Created deployment guide');

// 6. Create health check endpoint
const healthCheckContent = `// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Add this to your backend/index.js file
`;

fs.writeFileSync(path.join(__dirname, 'backend', 'health-check.js'), healthCheckContent);
console.log('✅ Created health check endpoint');

console.log('\n🎉 Production Setup Complete!');
console.log('\n📋 Created Files:');
console.log('  - backend/.env.production');
console.log('  - build-production.sh');
console.log('  - Dockerfile');
console.log('  - docker-compose.yml');
console.log('  - DEPLOYMENT_GUIDE.md');
console.log('  - backend/health-check.js');
console.log('\n🚀 Your restaurant management system is ready for production deployment!');
console.log('\nNext steps:');
console.log('1. Review and update .env.production with your values');
console.log('2. Run: chmod +x build-production.sh');
console.log('3. Run: ./build-production.sh');
console.log('4. Follow DEPLOYMENT_GUIDE.md for deployment options');
