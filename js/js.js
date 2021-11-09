// Import the functions you need from the SDKs you need
import { initializeApp } from "/firebase/app";
import { getAnalytics } from "/firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "/firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD33F_vo2zofnh_-g6dk4I3eSawDcBkTL8",
  authDomain: "onlystudents-c006b.firebaseapp.com",
  projectId: "onlystudents-c006b",
  storageBucket: "onlystudents-c006b.appspot.com",
  messagingSenderId: "664309698186",
  appId: "1:664309698186:web:ca6a730b014e6e21316773",
  measurementId: "G-PTCTDT0BBV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();
createUserWithEmailAndPassword(auth, "mail@ex.com", "1234")
  .then((userCredential) => {
    // Signed in
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });
