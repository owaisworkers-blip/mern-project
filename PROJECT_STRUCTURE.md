# Event Management System - Project Structure

## Overall Directory Structure
```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication & validation
│   │   ├── models/          # Database models
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic & external services
│   │   ├── utils/           # Helper functions
│   │   ├── seed.js          # Database seeding
│   │   └── server.js        # Main entry point
│   └── package.json         # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # State management (AuthContext)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # React entry point
│   └── package.json         # Frontend dependencies
│
└── README.md               # Project documentation
```

## Backend Structure (`backend/`)
```
backend/
├── src/
│   ├── config/
│   │   ├── db.js            # Database connection
│   │   └── env.js           # Environment variables
│   │
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── exhibitorController.js
│   │   ├── feedbackController.js
│   │   ├── notificationController.js
│   │   ├── registrationController.js
│   │   ├── reviewController.js
│   │   ├── sessionController.js
│   │   └── statsController.js
│   │
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   └── roles.js         # Role-based access control
│   │
│   ├── models/
│   │   ├── Event.js
│   │   ├── Exhibitor.js
│   │   ├── Feedback.js
│   │   ├── Notification.js
│   │   ├── Registration.js
│   │   ├── Review.js
│   │   ├── Session.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── exhibitorRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── sessionRoutes.js
│   │   └── statsRoutes.js
│   │
│   ├── services/
│   │   └── socket.js        # Socket.IO implementation
│   │
│   ├── utils/
│   │   ├── email.js         # Email sending utilities
│   │   ├── generateToken.js # JWT token generation
│   │   ├── qrcode.js        # QR code generation
│   │   └── upload.js        # File upload utilities
│   │
│   ├── seed.js              # Database seeding script
│   └── server.js            # Application entry point
│
├── .env                     # Environment variables
└── package.json             # Dependencies and scripts
```

## Frontend Structure (`frontend/`)
```
frontend/
├── src/
│   ├── components/
│   │   ├── AnalyticsDashboard.jsx
│   │   ├── BoothManagement.jsx
│   │   ├── Communications.jsx
│   │   ├── EventTicket.jsx
│   │   ├── ExhibitorSearch.jsx
│   │   ├── Feedback.jsx
│   │   ├── Home.jsx
│   │   └── Notifications.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication state management
│   │
│   ├── hooks/
│   │   └── useSocket.js      # Custom hook for Socket.IO
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── EventDetails.jsx
│   │   ├── ExhibitorPortal.jsx
│   │   ├── ExhibitorProfile.jsx
│   │   ├── FeedbackPage.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Pass.jsx
│   │   ├── PasswordReset.jsx
│   │   ├── Schedule.jsx
│   │   ├── Signup.jsx
│   │   └── Statistics.jsx
│   │
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # React DOM rendering entry point
│   └── tailwind.css          # Tailwind CSS styles
│
├── public/                   # Static assets
├── index.html                # HTML template
└── package.json              # Dependencies and scripts
```

## Key Entry Points

1. **Backend Entry Point**: `backend/src/server.js`
2. **Frontend Entry Point**: `frontend/src/main.jsx`
3. **Main App Component**: `frontend/src/App.jsx`

## Scripts

### Backend Scripts
```bash
npm run dev     # Start development server with nodemon
npm start       # Start production server
```

### Frontend Scripts
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```