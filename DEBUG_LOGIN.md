# Debug Login Issues

## Steps to Debug Login Problems

### 1. Check Backend Server
Make sure the backend server is running:
```bash
cd restaurant-management-system-master/backend
npm start
```

You should see:
```
Connected to MongoDB!
Server is running on port 5000
```

### 2. Test Database Connection
Run the test script:
```bash
cd restaurant-management-system-master/backend
node test-connection.js
```

### 3. Test Authentication
Run the auth test:
```bash
cd restaurant-management-system-master/backend
node test-auth.js
```

### 4. Check Environment Variables
Make sure you have a `.env` file in the `backend` folder with:
```env
MONGODB_URI=mongodb://localhost:27017/restaurant
ACCESS_TOKEN=your_super_secret_jwt_key_here
PORT=5000
```

### 5. Test API Endpoints Directly

#### Test Registration:
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":"Test User","email":"test@example.com","password":"test123"}'
```

#### Test Login:
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 6. Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to register and login
4. Check for any error messages

### 7. Check Backend Console
Look at the backend server console for:
- Registration logs: "Registration attempt:", "User registered successfully:"
- Login logs: "Login attempt:", "User found:", "Login successful for user:"

### 8. Common Issues and Solutions

#### Issue: "User not found with this email"
- **Cause**: Email case sensitivity or extra spaces
- **Solution**: The backend now handles this by converting to lowercase and trimming

#### Issue: "Incorrect password"
- **Cause**: Password mismatch
- **Solution**: Make sure you're using the exact same password for registration and login

#### Issue: "Internal server error"
- **Cause**: Database connection or server error
- **Solution**: Check MongoDB is running and .env file is correct

#### Issue: Frontend not navigating after login
- **Cause**: Response message format mismatch
- **Solution**: The backend now returns consistent message format

### 9. Manual Database Check
Connect to MongoDB and check if users are being created:
```bash
# Connect to MongoDB
mongosh

# Use the restaurant database
use restaurant

# Check users collection
db.users.find()

# Check specific user
db.users.findOne({email: "test@example.com"})
```

### 10. Reset Database (if needed)
If you want to start fresh:
```bash
# Connect to MongoDB
mongosh

# Use the restaurant database
use restaurant

# Drop the users collection
db.users.drop()

# Or drop the entire database
db.dropDatabase()
```

## Expected Flow

1. **Registration**: User fills form → Frontend sends POST to `/api/register` → Backend creates user → Returns success message
2. **Login**: User fills form → Frontend sends POST to `/api/login` → Backend finds user → Compares password → Returns JWT token
3. **Navigation**: Frontend receives success message → Navigates to home page

## Debug Checklist

- [ ] Backend server is running
- [ ] MongoDB is running
- [ ] .env file exists and is correct
- [ ] No console errors in browser
- [ ] No errors in backend console
- [ ] User is created in database
- [ ] Login finds the user
- [ ] Password comparison works
- [ ] JWT token is generated
- [ ] Frontend receives success response
