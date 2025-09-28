# MongoDB Setup Instructions

This project has been updated to use MongoDB instead of MySQL. Follow these steps to set up and run the project.

## Prerequisites

1. **Node.js** (version 14 or higher)
2. **MongoDB** (local installation or MongoDB Atlas)
3. **npm** (comes with Node.js)

## Database Setup

### Option 1: Local MongoDB Installation

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   - Windows: MongoDB should start automatically as a service
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string

## Environment Configuration

Create a `.env` file in the `backend` folder with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/restaurant
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant

# JWT Secret Key (change this to a secure random string in production)
ACCESS_TOKEN=your_super_secret_jwt_key_here

# Server Port
PORT=5000
```

## Installation and Running

### 1. Install Dependencies

**Backend:**
```bash
cd restaurant-management-system-master/backend
npm install
```

**Frontend:**
```bash
cd restaurant-management-system-master
npm install
```

### 2. Run the Application

**Start the Backend Server:**
```bash
cd restaurant-management-system-master/backend
npm start
```

**Start the Frontend (in a new terminal):**
```bash
cd restaurant-management-system-master
npm start
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Database Collections

The application will automatically create the following collections in MongoDB:

- **users**: Stores user information (fullname, email, password)
- **foods**: Stores food items (food_name, food_price, food_image)
- **carts**: Stores cart items (user_id, food_id, quantity)

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Users
- `GET /api/user` - Get all users

### Foods
- `GET /api/foods` - Get all food items
- `POST /api/foods` - Add new food item

### Cart
- `GET /api/cart` - Get all cart items
- `GET /api/cart/:userId` - Get cart items for specific user
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:cartId` - Update cart item quantity
- `DELETE /api/cart/:cartId` - Remove item from cart
- `DELETE /api/cart/user/:userId` - Clear entire cart for a user

## Key Changes from MySQL Version

1. **Database**: Switched from MySQL to MongoDB
2. **ORM**: Using Mongoose instead of raw MySQL queries
3. **Schema**: Document-based schemas instead of relational tables
4. **Relationships**: Using ObjectId references instead of foreign keys
5. **Queries**: Using Mongoose methods instead of SQL queries

## Troubleshooting

1. **MongoDB Connection Error**: Ensure MongoDB is running and the connection string is correct
2. **Port Already in Use**: Change the PORT in .env file or stop the process using the port
3. **JWT Errors**: Ensure ACCESS_TOKEN is set in .env file
4. **CORS Issues**: The backend is configured to allow all origins in development

## Production Considerations

1. Use a strong, random JWT secret key
2. Configure proper CORS settings
3. Use environment-specific MongoDB connection strings
4. Implement proper error handling and logging
5. Add input validation and sanitization
6. Use HTTPS in production

