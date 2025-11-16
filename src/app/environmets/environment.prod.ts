// src/environments/environment.ts

export const environment = {
  production: false,

  // API endpoint for your backend
  apiUrl: 'https://vettracebackend-1.onrender.com',
  //apiUrl: 'http://102.37.216.79:80',
  //apiUrl:'http://localhost:8080'1111,
  // WebSocket URL (if you use sockets)
  socketUrl: 'ws:https://vettracebackend-1.onrender.com/ws',

  // Feature flags
  featureFlags: {
    enableNewDashboard: false,
    enableBetaMode: false
  },

  // Third-party keys
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
  firebaseConfig: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'your-app.firebaseapp.com',
    projectId: 'your-app-id',
    storageBucket: 'your-app.appspot.com',
    messagingSenderId: 'SENDER_ID',
    appId: 'APP_ID'
  }
};
