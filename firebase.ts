// Import the functions you need from the SDKs you need
import { initializeApp,getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRiLWeQXeona1ktnOsgx2Zm8V894sW6h0",
  authDomain: "worknest-73437.firebaseapp.com",
  projectId: "worknest-73437",
  storageBucket: "worknest-73437.firebasestorage.app",
  messagingSenderId: "426239719525",
  appId: "1:426239719525:web:17efab9bb6db7717e26e8c",
  measurementId: "G-TB7YRBE5BB"
};

// Initialize Firebase
const app = getApps.length ===0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export {db};