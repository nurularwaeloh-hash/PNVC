// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue, runTransaction, update } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2gx4STv76J9eMk1KcCbiHGkaQZ--lM_c",
  authDomain: "pnvc-app-b404a.firebaseapp.com",
  projectId: "pnvc-app-b404a",
  storageBucket: "pnvc-app-b404a.firebasestorage.app",
  messagingSenderId: "853182148919",
  appId: "1:853182148919:web:3829d10d1996f41c782ab2",
  measurementId: "G-EQ1DHWQEYM",
  databaseURL: "https://pnvc-app-b404a-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default (app);
export const db = getDatabase(app);