// Import the functions you need from the SDKs you need
import Aos, { init } from "aos";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import barba from "@barba/core";
import { gsap } from "gsap";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { OUser, userConverter } from "./userops";

Storage.prototype.setObject = function (key, value) {
  this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function (key) {
  var value = this.getItem(key);
  return value && JSON.parse(value);
};

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
const auth = getAuth();
const db = getFirestore();

var osuser = new OUser();

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

async function getUserFromDB(uid) {
  const ref = doc(db, "users", uid).withConverter(userConverter);
  const docSnap = await getDoc(ref);
  if (docSnap.exists()) {
    // Convert to City object
    const osuser2 = docSnap.data();
    // Use a City instance method
    return osuser2;
  } else {
    console.log("No such document!");
    return null;
  }
}

function saveUserToLS(userobj, uid) {
  console.log("Saving user to LS");
  localStorage.removeItem(uid);
  localStorage.setObject(uid, userobj);
}

function checkSavedUser(uid) {
  if (localStorage.getObject(uid) != null) {
    return true;
  } else {
    return false;
  }
}

function deleteSavedUser(uid) {
  if (uid != null) {
    localStorage.removeItem(uid);
    console.log("Removed User Data");
    console.log(importUFLS(uid));
  } else {
    console.log("Can't delete what i dont have :D");
  }
}

function checkUEASWO() {
  if (checkSavedUser() == true) {
    console.log("Importing UDFLS");
    var userobj = new OUser();
    userobj = importUFLS();
    return userobj;
  } else {
    console.log("Not loaded yet ...");
  }
}

async function asyncCheckUEAS(userobj = new OUser(), uid) {
  if (checkSavedUser(uid) == true) {
    console.log("User data already in local storage importing into variable");
    const userobjwait = await importUFLS(uid);
    userobj = userobjwait;
    return userobj;
  } else {
    console.log("Getting user data from DB");
    const userobjwait = await getUserFromDB(uid);
    console.log("Got user from db: " + userobjwait);
    saveUserToLS(userobjwait, uid);
    userobj = userobjwait;
    return userobj;
  }
}

function importUFLS(uid) {
  const user = localStorage.getObject(uid);
  return user;
}

var localuid = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    console.log("Signed in  " + user.uid);
    document.getElementById("username").innerHTML = "" + user.displayName;
    //getUserFromDB(user.uid);

    localuid = user.uid;

    asyncCheckUEAS(osuser, user.uid)
      .then((result) => {
        osuser = result;
      })
      .catch((err) => {});

    // ...
  } else {
    // User is signed out
    console.log("User is not Signed IN");
    //window.location.href = "/index.html";
    deleteSavedUser(localuid);
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
  const profileSwal = Swal.mixin({
    customClass: {
      htmlContainer: "profileswalhtml",
    },
  });
  profileSwal.fire({
    title: "Profile Info",
    html: `<h2 style="margin-top: 0; margin-bottom: 1rem;">Name : <input class="form-control" type="text" placeholder="username" id="uname" value="username" disabled></input></h2>
    <h2 style="margin-top: 0">Username: <input class="form-control" type="text" placeholder="username" id="namef" value="username" disabled></h2>
    `,
    showCancelButton: true,
    confirmButtonText: "Save",
    didOpen: () => {
      document.getElementById("uname").value = osuser.name;
      document.getElementById("namef").value = osuser.username;
    },
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
