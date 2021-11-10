// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

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

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    console.log("Signed in  " + user.uid);
    document.getElementById("username").innerHTML =
      "Welcome: " + user.displayName;
    // ...
  } else {
    // User is signed out
    console.log("User is not Signed IN");
    //window.location.href = "/index.html";
    swup.loadPage({
      url: "/index.html", // route of request (defaults to current url)
      method: "GET", // method of request (defaults to "GET")
      customTransition: "transition-fade", // name of your transition used for adding custom class to html element and choosing custom animation in swupjs (as setting data-swup-transition attribute on link)
    });
    // ...
  }
});

document.getElementById("logoutbtn").onclick = function () {
  signOut(auth)
    .then(() => {
      // Sign-out successful
      window.location.href = "/index.html";
    })
    .catch((error) => {
      console.log(error);
      alert("An unexpected error has occured !");
    });
};
