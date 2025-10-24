# TATHYA React Application

## Overview
This is a React-based application for the TATHYA platform, which includes both frontend and backend components.

## Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd tathya-frontend
npm install

# Install backend dependencies
cd ../tathya-backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `tathya-backend` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tathya_db
JWT_SECRET=your_jwt_secret_here
```

Create a `.env` file in the `tathya-frontend` directory with:

```env
VITE_API_BASE=http://localhost:5000/api
```

### 3. Run the Application

#### Backend
```bash
cd tathya-backend
npm start
```

#### Frontend
```bash
cd tathya-frontend
npm run dev
```

The application will be available at `http://localhost:3000` (or the next available port).

## Testing

### Run Unit Tests
```bash
cd tathya-frontend
npm test
```

### Run Specific Tests
```bash
# Run only formatTimestamp tests
npm test src/__tests__/formatTimestamp.test.js
```

## Key Features Fixed

### Contact Form Query/Response System
1. **Fixed "formatTimestamp is not defined" error** in User Dashboard
2. **Enhanced contact queries display** to show both user submissions and moderator responses
3. **Improved backend controllers** for better handling of contact form submissions
4. **Added proper timestamp formatting** across the application

## Project Structure
```
.
├── tathya-backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── server.js
├── tathya-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── vite.config.js
└── README.md
```

## Contact Form Flow

1. **User submits contact form** via `/contact` or `/contact/authenticated` endpoints
2. **Moderator receives notification** in their dashboard
3. **Moderator responds** to the contact form submission
4. **User views response** in their "My Queries" section of the User Dashboard

## Troubleshooting

### Port Conflicts
If you see "Port already in use" errors:
- Change the PORT in `.env` file for backend
- The frontend will automatically use the next available port

### MongoDB Connection Issues
- Ensure MongoDB is running locally
- Verify the MONGODB_URI in the backend `.env` file

### Common Errors Fixed
- "formatTimestamp is not defined" - Fixed by adding the function to UserDashboard
- Contact queries not displaying properly - Fixed by improving parsing logic
- Timestamp formatting inconsistencies - Fixed by standardizing the formatTimestamp function