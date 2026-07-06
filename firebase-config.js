const firebaseConfig = {
  apiKey: "AIzaSyD_Mg3Brh9sljk7f2gOt_CXXw2gF9wpl5U",
  authDomain: "exam-system-pkw.firebaseapp.com",
  projectId: "exam-system-pkw",
  storageBucket: "exam-system-pkw.firebasestorage.app",
  messagingSenderId: "27816935568",
  appId: "1:27816935568:web:cb0fcafdfb6649ba819815"
};

// Initialize Firebase (v8 CDN version)
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Export ให้ไฟล์อื่นเรียกใช้งานได้
window.db = db;
