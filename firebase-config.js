// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9Y1_F7hf5tdelpx-K-SUjTTZpkZrv2K4",
    authDomain: "biashararahisi-9947f.firebaseapp.com",
    projectId: "biashararahisi-9947f",
    storageBucket: "biashararahisi-9947f.firebasestorage.app",
    messagingSenderId: "441463571251",
    appId: "1:441463571251:web:2ba9a567109f81fd187446"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(error => console.error("Persistence error:", error));

console.log("Firebase initialized successfully!");
