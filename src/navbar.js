// Import the functions you need from the SDKs you need
//import Aos, { init } from "aos";
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
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import barba from "@barba/core";
import { gsap } from "gsap";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { OUser, userConverter } from "./userops";
import Swal from "sweetalert2";
import barbaPrefetch from "@barba/prefetch";
import { _checkPlugin } from "gsap/gsap-core";
import Cropper from "cropperjs";

//console.log("Initializing Auth and Navbar script !");

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
const storage = getStorage();

var osuser = new OUser();
var curuser = null;
var localuid = null;
var profilepic = null;
var logoOpen = false;
var userFolderStr = "null";
var userFolderRef = null;
var userImageFolderStr = "null";
var profilePicData = null;

// Initialize Authentication observer and log-out users if != present
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    document.getElementById("username").innerHTML = "" + user.displayName;
    //getUserFromDB(user.uid);

    //initialize Variables
    localuid = user.uid;
    curuser = user;
    profilepic = user.photoURL;
    userFolderStr = "user/" + localuid;
    userFolderRef = ref(storage, userFolderStr);
    userImageFolderStr = userFolderStr + "/images/";

    if (
      localStorage.getItem("profileUrl") == 0 ||
      localStorage.getItem("profileUrl") == null
    ) {
      //console.log("Profile Picture Url was empty. Adding !");
      localStorage.setItem("profileUrl", profilepic);
      toDataURL(profilepic, function (dataUrl) {
        //console.log("DURL:", dataUrl);
        profilePicData = dataUrl;
        localStorage.setItem("profilepic", profilePicData);
        document.getElementById("profilepicture").style.backgroundImage =
          "url(" + profilePicData + ")";
      });
    } else if (localStorage.getItem("profileUrl") == profilepic) {
      profilePicData = localStorage.getItem("profilepic");
      document.getElementById("profilepicture").style.backgroundImage =
        "url(" + profilePicData + ")";
      //console.log("Loaded Pic from LS");
    } else {
      //console.log("Profile Picture was changed, reloading LS");
      localStorage.removeItem("profileUrl");
      localStorage.setItem("profileUrl", profilepic);
      toDataURL(profilepic, function (dataUrl) {
        //console.log("DURL:", dataUrl);
        profilePicData = dataUrl;
        localStorage.setItem("profilepic", profilePicData);
        document.getElementById("profilepicture").style.backgroundImage =
          "url(" + profilePicData + ")";
      });
    }

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
    localStorage.removeItem("profileUrl");
    localStorage.removeItem("profilepic");
    window.location.replace("/index.html");
    // ...
  }
});

// Animate on scroll

//Aos.init();

//Barba Animations

barba.use(barbaPrefetch);

barba.init({
  transitions: [
    {
      sync: false,
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

barba.hooks.after(() => {
  //Replace script at the bottom of page on load
  const bottomDOM = document.getElementsByTagName("body")[0];
  const newScript = document.createElement("script");
  const oldScript = document.querySelector(".main-script");
  newScript.src = "../dist/home.bundle.js";
  newScript.className = "main-script";
  oldScript.remove();
  bottomDOM.appendChild(newScript);
  //console.log("Re-initialized script on page change");
});

//Data Conversion Functions

function toDataURL(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    var reader = new FileReader();
    reader.onloadend = function () {
      callback(reader.result);
    };
    reader.readAsDataURL(xhr.response);
  };
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.send();
}

//User LocalStorage and DataBase functions

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

async function updateUserDB(uid, name, username, email) {
  const docRef = doc(db, "users", uid);

  // Set the "capital" field of the city 'DC'
  await updateDoc(docRef, {
    name: name,
    username: username,
    email: email,
  });
}

// Navigation Bar Buttons

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
      <button id="btndelete" class="swal2-cancel swal2-styled">Delete User</button>
      <button id="btnpassw" class="swal2-confirm swal2-styled">Change Password</button>
      </div>
    `,
      showCancelButton: true,
      cancelButtonText: "Close",
      confirmButtonText: "Ok",
      backdrop: true,
      didOpen: () => {
        document.getElementById("namef").value = osuser.name;
        document.getElementById("uname").value = osuser.username;
        document.getElementById("email").value = curuser.email;

        if (curuser.photoURL != null) {
          document.getElementById("profileimg").src = profilePicData;
        } else {
          console.log("User does'nt have a default photo genarated, WEEEIRD");
        }

        document.getElementById("profileimg").onclick = function () {
          var imgFile2 = null;
          var pchange = 0;
          const profilePicSwal = Swal.mixin({
            customClass: {
              htmlContainer: "profilepicedithtml",
            },
          });
          profilePicSwal
            .fire({
              title: "Edit Profile Picture",
              html: `<img id="preview" src="">
            <div class="cropperdiv" style="display: none"><input class="form-control" type="file" id="formFile" accept="image/png, image/gif, image/jpeg, image/svg"></input><div class="cropdiv"><img id="cropimg"></img></div></div>
            <button id="editbtn" class="btn btn-primary">Change Photo</button>
          `,
              confirmButtonText: "Ok",
              didOpen: () => {
                document.getElementById("preview").src = profilePicData;
              },
              didRender: () => {
                var cropopen = 0;
                var image = Swal.getHtmlContainer().querySelector("#cropimg");
                image.src = profilePicData;
                var cropper = new Cropper(image, {
                  aspectRatio: 1,
                  viewMode: 1,
                  guides: false,
                  center: false,
                  minContainerWidth: 120,
                  minContainerHeight: 120,
                  minCanvasWidth: 120,
                  minCanvasHeight: 120,
                  cropBoxResizable: false,
                  cropBoxMovable: false,
                  toggleDragModeOnDblclick: false,
                  dragMode: "move",
                  background: false,
                  autoCropArea: 1,
                  minCropBoxWidth: 60,
                  minCropBoxHeight: 60,
                  crop: function () {
                    setTimeout(() => {
                      const croppedCanvas = cropper.getCroppedCanvas({
                        width: 1024,
                        height: 1024,
                        minWidth: 120,
                        minHeight: 120,
                        maxWidth: 4096,
                        maxHeight: 4096,
                        fillColor: "#26272c",
                        imageSmoothingEnabled: false,
                        imageSmoothingQuality: "high",
                      });
                      const preview =
                        Swal.getHtmlContainer().querySelector("#preview");
                      preview.src = croppedCanvas.toDataURL();
                      croppedCanvas.toBlob((blob) => {
                        imgFile2 = blob;
                        imgFile2.name = "profile";
                      });
                      return imgFile2;
                    }, 25);
                  },
                });
                Swal.getHtmlContainer().querySelector("#editbtn").onclick =
                  function () {
                    if (cropopen == 0) {
                      Swal.getHtmlContainer().querySelector(
                        ".cropperdiv"
                      ).style.display = "flex";
                      cropopen = 1;
                    } else {
                      cropopen = 0;
                      Swal.getHtmlContainer().querySelector(
                        ".cropperdiv"
                      ).style.display = "none";
                    }
                  };

                Swal.getHtmlContainer().querySelector("#formFile").onchange =
                  function () {
                    pchange = 1;
                    Swal.getConfirmButton().innerHTML = "Save";
                    Swal.getConfirmButton().setAttribute(
                      "style",
                      "background-color: #419d78 !important"
                    );
                    //console.log("File Uploaded");
                    var imgFile =
                      Swal.getHtmlContainer().querySelector("#formFile")
                        .files[0];
                    const reader = new FileReader();
                    reader.addEventListener(
                      "load",
                      function () {
                        // convert image file to base64 string
                        //image.src = reader.result;
                        cropper.replace(reader.result);
                      },
                      false
                    );
                    if (imgFile) {
                      reader.readAsDataURL(imgFile);
                    }
                  };
              },
            })
            .then((result) => {
              if (result.isConfirmed && pchange == 1) {
                const cropimg = imgFile2;
                const path = userImageFolderStr + cropimg.name;
                const storageRef = ref(storage, path);
                const uploadTask = uploadBytesResumable(storageRef, cropimg);
                Swal.fire({
                  title: "Icon Change Success",
                  html: "Reloading page when complete.",
                  icon: "success",
                  timerProgressBar: true,
                  didOpen: () => {
                    Swal.showLoading();
                    uploadTask.on(
                      "state_changed",
                      (snapshot) => {
                        switch (snapshot.state) {
                          case "paused":
                            //console.log("Upload is paused");
                            break;
                          case "running":
                            break;
                        }
                      },
                      (error) => {
                        // A full list of error codes is available at
                        // https://firebase.google.com/docs/storage/web/handle-errors
                        switch (error.code) {
                          case "storage/unauthorized":
                            // User doesn't have permission to access the object
                            break;
                          case "storage/canceled":
                            // User canceled the upload
                            break;

                          // ...

                          case "storage/unknown":
                            // Unknown error occurred, inspect error.serverResponse
                            break;
                        }
                      },
                      () => {
                        // Upload completed successfully, now we can get the download URL
                        getDownloadURL(uploadTask.snapshot.ref).then(
                          (downloadURL) => {
                            updateProfile(curuser, {
                              photoURL: downloadURL,
                            })
                              .then(() => {
                                Swal.close();
                                location.reload();
                              })
                              .catch((error) => {});
                          }
                        );
                      }
                    );
                  },
                  willClose: () => {},
                }).then((result) => {});
              }
            })
            .catch((err) => {});
        };

        document.getElementById("btndelete").onclick = function () {
          const profileSwal = Swal.mixin({
            customClass: {
              confirmButton: "confirmDel",
            },
          });
          profileSwal
            .fire({
              title: "Delete Account",
              text: "",
              html: `Are you sure you want to delete your account ?\nInput your current password down below !
            <input type="password" id="passwd3" class="swal2-input" placeholder="Password">`,
              confirmButtonText: "Delete Profile",
              focusConfirm: false,
              preConfirm: () => {
                const password =
                  Swal.getPopup().querySelector("#passwd3").value;
                if (!password) {
                  Swal.showValidationMessage(
                    `Please enter your current password`
                  );
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
                        const errorCode = error.code;
                        if (errorCode == "auth/wrong-password") {
                          Swal.fire({
                            title: "Wrong Password",
                            text: "You don't know your own password ?",
                            icon: "error",
                            showCloseButton: false,
                            showCancelButton: false,
                            showConfirmButton: true,
                            confirmButtonText: "SIGH",
                          })
                            .then((result) => {
                              if (result.isConfirmed) {
                                document
                                  .getElementById("profilepicture")
                                  .click();
                                return false;
                              }
                            })
                            .catch((err) => {});
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
                    const errorCode = error.code;
                    if (errorCode == "auth/wrong-password") {
                      Swal.fire({
                        title: "Wrong Password",
                        text: "You don't know your own password ?",
                        icon: "error",
                        showCloseButton: false,
                        showCancelButton: false,
                        showConfirmButton: true,
                        confirmButtonText: "SIGH",
                      })
                        .then((result) => {
                          if (result.isConfirmed) {
                            document.getElementById("profilepicture").click();
                            return false;
                          }
                        })
                        .catch((err) => {});
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
              }
            })
            .catch((err) => {});
        };

        document.getElementById("btnpassw").onclick = function () {
          Swal.fire({
            title: "Password Change",
            html: `<input type="password" id="passwordcurr" class="swal2-input" placeholder="Current Password">
            <input type="password" id="passwd1" class="swal2-input" placeholder="New Password">
            <input type="password" id="passwd2" class="swal2-input" placeholder="New Password Again">`,
            confirmButtonText: "Change Password",
            focusConfirm: false,
            preConfirm: () => {
              const password1 = Swal.getPopup().querySelector("#passwd1").value;
              const currpass =
                Swal.getPopup().querySelector("#passwordcurr").value;
              const password2 = Swal.getPopup().querySelector("#passwd2").value;
              if (!password1 || !password2) {
                Swal.showValidationMessage(`Please enter all passwords`);
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
            if (result.isConfirmed) {
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
                      const errorCode = error.code;
                      if (errorCode == "auth/wrong-password") {
                        Swal.fire({
                          title: "Wrong Password",
                          text: "You don't know your own password ?",
                          icon: "error",
                          showCloseButton: false,
                          showCancelButton: false,
                          showConfirmButton: true,
                          confirmButtonText: "SIGH",
                        })
                          .then((result) => {
                            if (result.isConfirmed) {
                              document.getElementById("profilepicture").click();
                              return false;
                            }
                          })
                          .catch((err) => {});
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
                  const errorCode = error.code;
                  if (errorCode == "auth/wrong-password") {
                    Swal.fire({
                      title: "Wrong Password",
                      text: "You don't know your own password ?",
                      icon: "error",
                      showCloseButton: false,
                      showCancelButton: false,
                      showConfirmButton: true,
                      confirmButtonText: "SIGH",
                    })
                      .then((result) => {
                        if (result.isConfirmed) {
                          document.getElementById("profilepicture").click();
                          return false;
                        }
                      })
                      .catch((err) => {});
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
            }
          });
        };

        function updateSVBTN() {
          const uname = document.getElementById("uname").value;
          const name = document.getElementById("namef").value;
          const email = document.getElementById("email").value;
          const good = isUserNameValid(uname);
          function check() {
            if (
              osuser.name == name &&
              osuser.username == uname &&
              osuser.email == email
            ) {
              return false;
            } else {
              return true;
            }
          }
          const button1 = Swal.getConfirmButton();
          if (check() == true) {
            button1.setAttribute(
              "style",
              "background-color: #419d78 !important"
            );
            button1.innerHTML = "Save";
          } else if (check() == false) {
            button1.setAttribute(
              "style",
              "background-color: #3b7db3 !important"
            );
            button1.innerHTML = "Ok";
          } else {
            button1.setAttribute(
              "style",
              "background-color: #3b7db3 !important"
            );
            button1.innerHTML = "Ok";
          }
        }

        document.getElementById("namef").onkeyup = function () {
          updateSVBTN();
        };
        document.getElementById("uname").onkeyup = function () {
          updateSVBTN();
        };
        document.getElementById("email").onkeyup = function () {
          updateSVBTN();
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
    .then((result) => {
      if (result.isConfirmed) {
        const uname = document.getElementById("uname").value;
        const name = document.getElementById("namef").value;
        const email = document.getElementById("email").value;
        const good = isUserNameValid(uname);

        function check() {
          if (
            osuser.name == name &&
            osuser.username == uname &&
            osuser.email == email
          ) {
            return false;
          } else {
            return true;
          }
        }

        const checkVar = check();

        if (good == true && checkVar == true) {
          updateUserDB(localuid, name, uname, email);
          updateProfile(curuser, {
            displayName: uname,
          })
            .then(() => {
              updateEmail(curuser, email)
                .then(() => {
                  // Email updated!
                  // ...
                })
                .catch((error) => {
                  // An error occurred
                  // ...
                });
            })
            .catch((error) => {});
          //END
          //UPDATE EMAIL

          //
          osuser.name = name;
          osuser.username = uname;
          osuser.email = email;
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
      }
    })
    .catch((err) => {});
};

document.getElementById("menuitems").addEventListener("animationend", () => {
  document
    .getElementById("menuitems")
    .classList.remove("animate__fadeInDown", "animate__fadeOutUp");
  if (logoOpen == false) {
    document
      .getElementById("menuitems")
      .setAttribute("style", "display: none; opacity: 0;");
  } else if (logoOpen == true) {
    document
      .getElementById("menuitems")
      .setAttribute("style", "display: flex; opacity: 100;");
  }
});

document.getElementById("onlystudentslogo").onclick = function () {
  const vw = window.innerWidth;
  if (vw > 576) {
    barba.go("../home.html");
  } else {
    if (logoOpen == false) {
      logoOpen = true;
      document
        .getElementById("menuitems")
        .setAttribute("style", "display: flex; opacity: 100;");
      document
        .getElementById("menuitems")
        .style.setProperty("--animate-duration", "1s");
      document.getElementById("menuitems").classList.add("animate__fadeInDown");
    } else {
      logoOpen = false;
      document
        .getElementById("menuitems")
        .style.setProperty("--animate-duration", "1s");
      document.getElementById("menuitems").classList.add("animate__fadeOutUp");
    }
  }
};
