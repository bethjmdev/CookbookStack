import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// Replace these with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1dTa4P68OFUskyYLloyXbxFojq52kydo",
  authDomain: "cookbookstack.firebaseapp.com",
  projectId: "cookbookstack",
  storageBucket: "cookbookstack.firebasestorage.app",
  messagingSenderId: "546871043779",
  appId: "1:546871043779:web:635115cf8ea9787bb7e476",
  measurementId: "G-GFTS4RPK2E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
