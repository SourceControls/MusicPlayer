const { initializeApp } = require('firebase/app');
const { getDatabase } = require('firebase/database');
const { getFirestore } = require('firebase/firestore');
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
// const db = getDatabase(app);
const db = getFirestore(app);
module.exports = db