// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  signInWithEmailAndPassword,
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from "firebase/auth";

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

function validateForm() {
  var a = document.getElementById("emailform").value;
  var b = document.getElementById("passwordform").value;
  if ((a == null || a == "", b == null || b == "")) {
    return false;
  } else {
    return true;
  }
}

function validateEmptyFormReg() {
  var a = document.getElementById("registeremailform").value;
  var b = document.getElementById("registeremailrepeat").value;
  var c = document.getElementById("userform").value;
  var d = document.getElementById("nameform").value;
  var e = document.getElementById("password1").value;
  var f = document.getElementById("password2").value;
  if (
    a == null ||
    a == "" ||
    b == null ||
    b == "" ||
    c == null ||
    c == "" ||
    d == null ||
    d == "" ||
    e == null ||
    e == "" ||
    f == null ||
    f == ""
  ) {
    return false;
  } else {
    if (e == f && a == b) {
      return true;
    } else {
      return false;
    }
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    console.log("Signed in  " + uid);
    //window.location.href = "/home.html";
    swup.loadPage({
      url: "/home.html", // route of request (defaults to current url)
      method: "GET", // method of request (defaults to "GET")
      customTransition: "transition-fade", // name of your transition used for adding custom class to html element and choosing custom animation in swupjs (as setting data-swup-transition attribute on link)
    });
    // ...
  } else {
    // User is signed out
    console.log("User is not Signed IN");
    // ...
  }
});

document.getElementById("registerbtn").onclick = function () {
  var email = document.getElementById("registeremailform").value;
  var email2 = document.getElementById("registeremailrepeat").value;
  var user = document.getElementById("userform").value;
  var name = document.getElementById("nameform").value;
  var password = document.getElementById("password1").value;
  var password2 = document.getElementById("password2").value;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      var uid = user.uid;
      var user = user;
      console.log("Signed in  " + uid + "cannot create new account !");
      alert("You are already signed-in, You should'nt be on this page!");
      // ...
    } else {
      console.log("User is not signed-in, account creation possible");

      if (validateEmptyFormReg() == true) {
        createUserWithEmailAndPassword(auth, email, password)
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
      } else {
        alert("Complete all registration fields !");
      }
    }
  });
};

document.getElementById("loginbtn").onclick = function () {
  var email = document.getElementById("emailform").value;
  var password = document.getElementById("passwordform").value;

  if (null != null) {
    alert("signed in");
    return false;
    throw "NonNull";
  } else {
    if (validateForm() == true) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          setPersistence(auth, browserLocalPersistence);
          console.log("Login successful");
          throw "Success login";
          //Redirect to homepage
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;

          if (errorCode != null) {
            alert("Wrong Username or Password");
          }
        });
    } else {
      alert(
        "Something went wrong with your username or password. Check if you typed right !  "
      );
      return false;
    }
  }
};
