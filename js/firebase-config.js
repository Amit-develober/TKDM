// Firebase SDK Configuration & Initialization
// Configured with active project details for "ptkd-995a5"

const firebaseConfig = {
  apiKey: "AIzaSyAYTnm9Z5YlgYHm4l6ew3c70B0XT97Wc5A",
  authDomain: "ptkd-995a5.firebaseapp.com",
  projectId: "ptkd-995a5",
  storageBucket: "ptkd-995a5.firebasestorage.app",
  messagingSenderId: "367866641261",
  appId: "1:367866641261:web:8d98f9edc3aa51d5f57864",
  measurementId: "G-JJZW1XT5VZ"
};

// Check if credentials are set
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

let app = null;
let auth = null;
let db = null;
let isFirebaseConnected = false;

if (isConfigValid) {
  try {
    // Import SDK modules dynamically using standard ES modules
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js");

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    try {
      getAnalytics(app);
    } catch (analyticsError) {
      console.warn("Analytics initialization failed (likely due to ad-blockers or configuration).", analyticsError);
    }
    isFirebaseConnected = true;
    console.log("Firebase initialized successfully on project: ptkd-995a5.");
  } catch (error) {
    console.warn("Firebase initialization failed. Falling back to Local Storage.", error);
  }
} else {
  console.log("No valid Firebase configuration found. Running in Local Storage Demo Mode.");
}

export { app, auth, db, isFirebaseConnected };
