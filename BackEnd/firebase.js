// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAm5pJepKhHgVlwKH4hfmMaEzHuWScn0Ic",
  authDomain: "musicplayer-6a748.firebaseapp.com",
  databaseURL: "https://musicplayer-6a748-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "musicplayer-6a748",
  storageBucket: "musicplayer-6a748.appspot.com",
  messagingSenderId: "133711484528",
  appId: "1:133711484528:web:f35e5fd9bc0445051086b5",
  measurementId: "G-GTMRW1XXN1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export default db