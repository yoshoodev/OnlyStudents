// Import the functions you need from the SDKs you need
import Aos, { init } from "aos";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import barba from "@barba/core";
import { gsap } from "gsap";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { OUser, userConverter } from "./userops";
import Swal from "sweetalert2";

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
var curuser = null;

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
    const userobjwait = await importUFLS(uid);
    userobj = userobjwait;
    return userobj;
  } else {
    const userobjwait = await getUserFromDB(uid);
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
var profilepic = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    document.getElementById("username").innerHTML = "" + user.displayName;
    //getUserFromDB(user.uid);

    localuid = user.uid;
    curuser = user;
    profilepic = user.photoURL;
    const profpicurl = new String("url(" + user.photoURL + ")");
    document.getElementById("profilepicture").style.backgroundImage =
      profpicurl;

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

function isUserNameValid(username) {
  /* 
    Usernames can only have: 
    - Lowercase Letters (a-z) 
    - Numbers (0-9)
    - Dots (.)
    - Underscores (_)
  */
  const res = /^[a-z0-9_\.]+$/.exec(username);
  const valid = !!res;
  if (valid == true) {
    return true;
  } else {
    Swal.fire({
      title: "Username not valid",
      text: ` Usernames can only have:
      - Lowercase Letters (a-z) 
      - Numbers (0-9)
      - Dots (.)
      - Underscores (_)`,
      icon: "error",
      showCancelButton: false,
      confirmButtonText: "I will fix it !",
    })
      .then((result) => {
        if (result.isConfirmed) {
          document.getElementById("profilepicture").click();
          return false;
        }
      })
      .catch((err) => {
        return false;
      });
    return false;
  }
}

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

async function updateUserDB(uid, name, username, email) {
  const docRef = doc(db, "users", uid);

  // Set the "capital" field of the city 'DC'
  await updateDoc(docRef, {
    name: name,
    username: username,
  });
}

document.getElementById("profilepicture").onclick = function () {
  const profileSwal = Swal.mixin({
    customClass: {
      htmlContainer: "profileswalhtml",
    },
  });
  profileSwal
    .fire({
      title: "Profile Info",
      html: `
      <img id="profileimg" src="https://avatars.dicebear.com/api/adventurer-neutral/default.svg" class="rounded-circle profilepicswal"></img>
      <h2 style="margin-top: 0; margin-bottom: 1rem;">Name : <input class="form-control rounded-pill" type="text" placeholder="name" id="namef" value="name"></input></h2>
      <h2 style="margin-top: 0">Username: <input class="form-control rounded-pill" type="text" placeholder="username" id="uname" value="username"></h2>
      <h2 style="margin-top: 0">Email: <input class="form-control rounded-pill" type="email" placeholder="email@example.com" id="email" value="email@example.com"></h2>
      <div class="buttonsonf d-flex">
      <button id="btnsave" class="swal2-confirm swal2-styled">SAVE</button>
      <button id="btndelete" class="swal2-cancel swal2-styled">DELETE USER</button>
      <button id="btnpassw" class="swal2-confirm swal2-styled">PASSWORD</button>
      </div>
    `,
      showCancelButton: true,
      cancelButtonText: "CLOSE",
      confirmButtonText: "OK",
      backdrop: true,
      didOpen: () => {
        document.getElementById("namef").value = osuser.name;
        document.getElementById("uname").value = osuser.username;
        document.getElementById("email").value = curuser.email;
        if (curuser.photoURL != null) {
          document.getElementById("profileimg").src = curuser.photoURL;
        } else {
          console.log("User does'nt have a default photo genarated, WEEEIRD");
        }

        document.getElementById("btnsave").onclick = function () {
          const uname = document.getElementById("uname").value;
          const name = document.getElementById("namef").value;
          const email = document.getElementById("email").value;
          const good = isUserNameValid(uname);
          if (good == true) {
            updateUserDB(localuid, name, uname);
            const photogen = new String(
              "https://avatars.dicebear.com/api/adventurer-neutral/" +
                uname +
                ".svg"
            );
            //Update Profile in AUTH
            updateProfile(curuser, {
              displayName: uname,
              photoURL: photogen,
            })
              .then(() => {})
              .catch((error) => {});
            //END
            //UPDATE EMAIL
            updateEmail(auth.currentUser, email)
              .then(() => {
                // Email updated!
                // ...
              })
              .catch((error) => {
                // An error occurred
                // ...
              });
            //
            osuser.name = name;
            osuser.username = uname;
            saveUserToLS(osuser, localuid);
            Swal.fire({
              title: "User Details Saved",
              text: "User info saved successfully !",
              showCancelButton: false,
              showConfirmButton: true,
              showCloseButton: false,
              icon: "success",
            })
              .then((result) => {
                if (result.isConfirmed) {
                  location.reload();
                  return false;
                }
              })
              .catch((err) => {});
          } else {
          }
        };

        document.getElementById("btndelete").onclick = function () {
          Swal.fire({
            title: "Delete Account",
            text: "",
            html: `Are you sure you want to delete your account ?\nInput your current password down below !
            <input type="password" id="passwd3" class="swal2-input" placeholder="Password">`,
            confirmButtonText: "Sign in",
            focusConfirm: false,
            preConfirm: () => {
              const password = Swal.getPopup().querySelector("#passwd3").value;
              if (!password) {
                Swal.showValidationMessage(`Please enter login and password`);
              }
              return { password: password };
            },
          })
            .then((result) => {
              if (result.isConfirmed) {
                const user = curuser;
                const credential = EmailAuthProvider.credential(
                  user.email,
                  result.value.password
                );
                reauthenticateWithCredential(user, credential)
                  .then(() => {
                    deleteUser(user)
                      .then(() => {
                        Swal.fire({
                          title: "Success",
                          text: "User has been deleted !",
                          icon: "success",
                          showCloseButton: false,
                          showCancelButton: false,
                          showConfirmButton: true,
                        });
                      })
                      .catch((error) => {
                        if (error.code == "auth/wrong-password") {
                          Swal.fire({
                            title: "Wrong Password",
                            text: "You don't know your own password ?",
                            icon: "error",
                            showCloseButton: false,
                            showCancelButton: false,
                            showConfirmButton: true,
                            confirmButtonText: "SIGH",
                          });
                          document.getElementById("profilepicture").click();
                          return false;
                        } else {
                          Swal.fire({
                            title: "Error !",
                            text: "Give this to the devs : " + error.code,
                            icon: "error",
                            showCloseButton: false,
                            showCancelButton: false,
                            showConfirmButton: true,
                          });
                        }
                      });
                  })
                  .catch((error) => {
                    Swal.fire({
                      title: "Error !",
                      text: "Give this to the devs : " + error.code,
                      icon: "error",
                      showCloseButton: false,
                      showCancelButton: false,
                      showConfirmButton: true,
                    });
                  });
              }
            })
            .catch((err) => {});
        };

        document.getElementById("btnpassw").onclick = function () {
          Swal.fire({
            title: "Password Change",
            html: `<input type="password" id="passwordcurr" class="swal2-input" placeholder="Current Password">
            <input type="password" id="passwd1" class="swal2-input" placeholder="New Password">
            <input type="password" id="passwd2" class="swal2-input" placeholder="Again pls">`,
            confirmButtonText: "Change Password",
            focusConfirm: false,
            preConfirm: () => {
              const password1 = Swal.getPopup().querySelector("#passwd1").value;
              const currpass =
                Swal.getPopup().querySelector("#passwordcurr").value;
              const password2 = Swal.getPopup().querySelector("#passwd2").value;
              if (!password1 || !password2) {
                Swal.showValidationMessage(`Please enter both passwords`);
              } else {
                if (password1 != password2) {
                  Swal.showValidationMessage(`Both passwords must be the same`);
                }
                return {
                  pass1: password1,
                  pass2: password2,
                  currpass: currpass,
                };
              }
            },
          }).then((result) => {
            const user = curuser;
            const credential = EmailAuthProvider.credential(
              user.email,
              result.value.currpass
            );
            reauthenticateWithCredential(user, credential)
              .then(() => {
                // User re-authenticated.
                console.log("AUTHOK");
                updatePassword(user, result.value.pass2)
                  .then(() => {
                    Swal.fire({
                      title: "Success !",
                      text: "Password change successfuly :D",
                      icon: "success",
                      showCloseButton: false,
                      showCancelButton: false,
                      showConfirmButton: true,
                    });
                  })
                  .catch((error) => {
                    if (error.code == "auth/wrong-password") {
                      Swal.fire({
                        title: "Wrong Password",
                        text: "You don't know your own password ?",
                        icon: "error",
                        showCloseButton: false,
                        showCancelButton: false,
                        showConfirmButton: true,
                        confirmButtonText: "SIGH",
                      });
                      document.getElementById("profilepicture").click();
                      return false;
                    } else {
                      Swal.fire({
                        title: "Error !",
                        text: "Give this to the devs : " + error.code,
                        icon: "error",
                        showCloseButton: false,
                        showCancelButton: false,
                        showConfirmButton: true,
                      });
                    }
                  });
              })
              .catch((error) => {
                console.log(error.code);
                Swal.fire({
                  title: "Error !",
                  text: "Give this to the devs : " + error.code,
                  icon: "error",
                  showCloseButton: false,
                  showCancelButton: false,
                  showConfirmButton: true,
                });
              });
          });
        };
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
    })
    .then((result) => {})
    .catch((err) => {});
};
