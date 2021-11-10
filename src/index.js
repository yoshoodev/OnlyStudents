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
var userauth = auth.currentUser;

var comingfromreg = 0;

function redirect() {
  swup.loadPage({
    url: "/home.html", // route of request (defaults to current url)
    method: "GET", // method of request (defaults to "GET")
    customTransition: "transition-fade", // name of your transition used for adding custom class to html element and choosing custom animation in swupjs (as setting data-swup-transition attribute on link)
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    userauth = user;
    console.log("User is signed in !");

    if (comingfromreg == 0) {
      redirect();
    } else {
    }

    return true;
    // ...
  } else {
    // User is signed out
    console.log("User is not Signed IN");
    userauth = null;
    return false;
    // ...
  }
});

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
    Swal.fire({
      title: "Please input all fields",
      text: "You haven't completed all the necessary fields",
      icon: "error",
      showCancelButton: false,
      confirmButtonText: "I will fix it !",
    });
    return false;
  } else {
    if (e == f && a == b) {
      return true;
    } else if (a != b && e != f) {
      Swal.fire({
        title: "Really ?",
        text: "You messed up the email AND password re-type checks ? HOW ?",
        icon: "warning",
        showCancelButton: false,
        confirmButtonText: "Sry, Daddy",
      });
      return false;
    } else if (e != f) {
      Swal.fire({
        title: "Passwords are not the same",
        text: "The passwords you provided are not the same !",
        icon: "warning",
        showCancelButton: false,
        confirmButtonText: "Oops!",
      });
      return false;
    } else if (a != b) {
      Swal.fire({
        title: "Email's are not the same",
        text: "The email addresses you provided are not the same !",
        icon: "warning",
        showCancelButton: false,
        confirmButtonText: "I know my mail",
      });
      return false;
    } else {
      console.log("WTF HAPPENED");
      return false;
    }
  }
}

document.getElementById("registerbtn").onclick = function () {
  var email = document.getElementById("registeremailform").value;
  var email2 = document.getElementById("registeremailrepeat").value;
  var username = document.getElementById("userform").value;
  var name = document.getElementById("nameform").value;
  var password = document.getElementById("password1").value;
  var password2 = document.getElementById("password2").value;

  if (userauth != null) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    console.log("Signed in  " + userauth.uid + "cannot create new account !");
    alert("You are already signed-in, You should'nt be on this page!");
    redirect();
    // ...
  } else {
    console.log("User is not signed-in, account creation possible");

    if (validateEmptyFormReg() == true) {
      comingfromreg = 1;
      createUserWithEmailAndPassword(auth, email, password).then(
        (userCredential) => {
          // Signed in
          console.log("Firing Swal");
          Swal.fire({
            title: "Register Succesful",
            text: "You have succesfully registered",
            icon: "success",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.isConfirmed) {
              redirect();
            }
          });
        }
      );
    } else {
    }
  }
};

document.getElementById("loginbtn").onclick = function () {
  var email = document.getElementById("emailform").value;
  var password = document.getElementById("passwordform").value;

  if (validateForm() == true) {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        userauth = userCredential.user;
        setPersistence(auth, browserLocalPersistence);
        console.log("Login successful");
        redirect();
        throw "Success login";
        //Redirect to homepage
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode != null) {
          Swal.fire({
            title: "Wrong Credentials",
            text: "The credentials you provided are wrong",
            icon: "warning",
            showCancelButton: false,
            confirmButtonText: "Sorry",
          });
        }
      });
  } else {
    Swal.fire({
      title: "Validation Error",
      text: "Unknown validation error",
      icon: "error",
      showCancelButton: false,
      confirmButtonText: "Call the devs !",
    });
    return false;
  }
};
