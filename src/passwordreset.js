import Swal from "sweetalert2";
import { initializeApp } from "firebase/app";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  getAuth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD33F_vo2zofnh_-g6dk4I3eSawDcBkTL8",
  authDomain: "onlystudents-c006b.firebaseapp.com",
  projectId: "onlystudents-c006b",
  storageBucket: "onlystudents-c006b.appspot.com",
  messagingSenderId: "664309698186",
  appId: "1:664309698186:web:ca6a730b014e6e21316773",
  measurementId: "G-PTCTDT0BBV",
};

const app = initializeApp(firebaseConfig);
var auth = getAuth();

document.getElementById("rst").onclick = function () {
  const pass1 = document.getElementById("password1").value;
  const pass2 = document.getElementById("password2").value;
  if ((pass1 == "" || pass1 == null, pass2 == "" || pass2 == null)) {
    Swal.fire({
      title: "Please input all fields",
      text: "You haven't completed all the necessary fields",
      icon: "error",
      showCancelButton: false,
      confirmButtonText: "I will fix it !",
    });
  } else {
    if (pass1 === pass2) {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      if (!!queryString) {
        console.log("NOT NULL");
        const idcode = urlParams.get("oobCode");
        console.log(idcode);
        verifyPasswordResetCode(auth, idcode)
          .then((result) => {
            confirmPasswordReset(auth, idcode, pass1)
              .then((result) => {
                Swal.fire({
                  title: "Success",
                  text: "We successfuly resetted your password",
                  icon: "success",
                  showCancelButton: false,
                  confirmButtonText: "Yay",
                })
                  .then((result) => {
                    if (result.isConfirmed) {
                      window.location.href("/index.html");
                    }
                  })
                  .catch((err) => {});
              })
              .catch((error) => {
                switch (error.code) {
                  case "auth/expired-action-code":
                    Swal.fire({
                      title: "Expired Code",
                      text: "The code you provided is expired !",
                      icon: "error",
                      showCancelButton: false,
                      confirmButtonText: "Hmm",
                    });
                    break;
                  case "auth/user-not-found":
                    Swal.fire({
                      title: "User Not Found",
                      text: "Could'nt find you ?!?!",
                      icon: "error",
                      showCancelButton: false,
                      confirmButtonText: "Strange",
                    });
                    break;
                  case "auth/user-disabled":
                    Swal.fire({
                      title: "User Disabled",
                      text: "Why ?",
                      icon: "error",
                      showCancelButton: false,
                      confirmButtonText: "IDK",
                    });
                    break;
                  case "auth/invalid-action-code":
                    Swal.fire({
                      title: "Invalid Code",
                      text: "The code you provided is invalid !",
                      icon: "error",
                      showCancelButton: false,
                      confirmButtonText: "Fake",
                    });
                    break;

                  default:
                    Swal.fire({
                      title: "Oopsie !",
                      text: "Give this to the devs : " + error.code,
                      icon: "error",
                      showCancelButton: false,
                      confirmButtonText: "OKI",
                    });
                    break;
                }
              });
          })
          .catch((error) => {
            switch (error.code) {
              case "auth/expired-action-code":
                Swal.fire({
                  title: "Expired Code",
                  text: "The code you provided is expired !",
                  icon: "error",
                  showCancelButton: false,
                  confirmButtonText: "Hmm",
                });
                break;
              case "auth/user-not-found":
                Swal.fire({
                  title: "User Not Found",
                  text: "Could'nt find you ?!?!",
                  icon: "error",
                  showCancelButton: false,
                  confirmButtonText: "Strange",
                });
                break;
              case "auth/user-disabled":
                Swal.fire({
                  title: "User Disabled",
                  text: "Why ?",
                  icon: "error",
                  showCancelButton: false,
                  confirmButtonText: "IDK",
                });
                break;
              case "auth/invalid-action-code":
                Swal.fire({
                  title: "Invalid Code",
                  text: "The code you provided is invalid !",
                  icon: "error",
                  showCancelButton: false,
                  confirmButtonText: "Fake",
                });
                break;

              default:
                Swal.fire({
                  title: "Oopsie !",
                  text: "Give this to the devs : " + error.code,
                  icon: "error",
                  showCancelButton: false,
                  confirmButtonText: "OKI",
                });
                break;
            }
          });
      } else {
        Swal.fire({
          title: "No Parameters In URL",
          text: "Where did you come from ?",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "IDK",
        });
      }
    } else {
      Swal.fire({
        title: "Passwords are not the same",
        text: "The passwords you provided are not the same !",
        icon: "warning",
        showCancelButton: false,
        confirmButtonText: "Oops!",
      });
    }
  }
};
