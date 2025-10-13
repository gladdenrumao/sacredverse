// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiZKyv7I7zo_t16YsNIcgQu89QcPwhGOg",
  authDomain: "sacredverse-625b2.firebaseapp.com",
  projectId: "sacredverse-625b2",
  storageBucket: "sacredverse-625b2.appspot.com",
  messagingSenderId: "108177371675",
  appId: "1:108177371675:web:925840a6f52c01e99ebebe",
  measurementId: "G-R6LE9RV8YS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };