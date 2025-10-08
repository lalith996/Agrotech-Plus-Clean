// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2ppHNAV-WqXLAVWhDGtwuGKnv_dRX52Q",
  authDomain: "agrotech-plus-fb16e.firebaseapp.com",
  projectId: "agrotech-plus-fb16e",
  storageBucket: "agrotech-plus-fb16e.firebasestorage.app",
  messagingSenderId: "973239943443",
  appId: "1:973239943443:web:db9b040b0be477c36fdae6",
  measurementId: "G-1MHE5SWRRE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);