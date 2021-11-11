// Import the functions you need from the SDKs you need
import Aos, { init } from "aos";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import barba from "@barba/core";
import { gsap } from "gsap";

// only this line when included with script tag

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

// Initialize AOS
Aos.init();

barba.init({
  transitions: [
    {
      name: "opacity-transition",
      leave(data) {
        return gsap.to(data.current.container, {
          opacity: 0,
        });
      },
      enter(data) {
        return gsap.from(data.next.container, {
          opacity: 0,
        });
      },
    },
  ],
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    console.log("Signed in  " + user.uid);
    document.getElementById("username").innerHTML = "" + user.displayName;
    // ...
  } else {
    // User is signed out
    console.log("User is not Signed IN");
    //window.location.href = "/index.html";
    window.location.replace("/index.html");
    // ...
  }
});

document.getElementById("logoutbtn").onclick = function () {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you want to log out ?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Please",
  }).then((result) => {
    if (result.isConfirmed) {
      signOut(auth)
        .then(() => {
          // Sign-out successful
        })
        .catch((error) => {
          console.log(error);
          alert("An unexpected error has occured !");
        });
      let timerInterval;
      Swal.fire({
        title: "You have been logged out !",
        html: "Redirecting in <b></b> milliseconds.",
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const b = Swal.getHtmlContainer().querySelector("b");
          timerInterval = setInterval(() => {
            b.textContent = Swal.getTimerLeft();
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then((result) => {
        /* Read more about handling dismissals below */
        if (result.dismiss === Swal.DismissReason.timer) {
          window.location.href("/index.html");
        }
      });
    }
  });
};

document.getElementById("profilepic").onclick = function () {
  Swal.fire({
    title: "Change Profile Details",
    showCancelButton: true,
    confirmButtonText: "Save",
    allowOutsideClick: () => {
      const popup = Swal.getPopup();
      popup.classList.remove("swal2-show");
      setTimeout(() => {
        popup.classList.add("animate__animated", "animate__headShake");
      });
      setTimeout(() => {
        popup.classList.remove("animate__animated", "animate__headShake");
      }, 500);
      return false;
    },
  });
};
