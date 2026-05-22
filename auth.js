import {
  auth,
  db
}
from "./firebase.js";

import {

  GoogleAuthProvider,

  signInWithPopup,

  createUserWithEmailAndPassword,

  signInWithEmailAndPassword,

  updateProfile,

  sendEmailVerification,

  signInAnonymously,

  onAuthStateChanged,

  signOut

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

  doc,

  setDoc,

  getDoc,

  updateDoc

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ====================================
   INPUTS
==================================== */

const nameInput =
  document.getElementById(
    "nameInput"
  );

const emailInput =
  document.getElementById(
    "emailInput"
  );

const passwordInput =
  document.getElementById(
    "passwordInput"
  );

/* ====================================
   GOOGLE PROVIDER
==================================== */

const provider =
  new GoogleAuthProvider();

/* ====================================
   CREATE USER DOCUMENT
==================================== */

async function createUserDocument(
  user,
  name
){

  const userRef =
    doc(
      db,
      "users",
      user.uid
    );

  const userSnap =
    await getDoc(userRef);

  if(!userSnap.exists()){

    await setDoc(

      userRef,

      {

        uid:
          user.uid,

        name:
          name ||

          user.displayName ||

          "User",

        email:
          user.email ||

          "guest@voxfix.ai",

        premium:
          false,

        plan:
          "free",

        requests:
          0,

        createdAt:
          Date.now()

      }

    );

  }

}

/* ====================================
   SIGNUP
==================================== */

window.signup = async()=>{

  const name =
    nameInput.value.trim();

  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value.trim();

  if(
    !name ||
    !email ||
    !password
  ){

    alert(
      "Please fill all fields."
    );

    return;

  }

  try{

    const result =
      await createUserWithEmailAndPassword(

        auth,
        email,
        password

      );

    await updateProfile(

      result.user,

      {
        displayName:name
      }

    );

    await sendEmailVerification(
      result.user
    );

    await createUserDocument(

      result.user,
      name

    );

    localStorage.setItem(

      "voxfixName",

      name

    );

    localStorage.setItem(

      "voxfixPremium",

      "false"

    );

    alert(
      "Account created successfully."
    );

    window.location.href =
      "index.html";

  }catch(error){

    console.error(error);

    alert(error.message);

  }

};

/* ====================================
   LOGIN
==================================== */

window.login = async()=>{

  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value.trim();

  if(
    !email ||
    !password
  ){

    alert(
      "Enter email and password."
    );

    return;

  }

  try{

    const result =
      await signInWithEmailAndPassword(

        auth,
        email,
        password

      );

    const userRef =
      doc(
        db,
        "users",
        result.user.uid
      );

    const userSnap =
      await getDoc(userRef);

    let premium = false;

    if(userSnap.exists()){

      const userData =
        userSnap.data();

      premium =
        userData.premium;

      localStorage.setItem(

        "voxfixPlan",

        userData.plan || "free"

      );

    }

    localStorage.setItem(

      "voxfixPremium",

      premium

    );

    localStorage.setItem(

      "voxfixName",

      result.user.displayName ||

      "User"

    );

    alert(
      "Login successful."
    );

    window.location.href =
      "index.html";

  }catch(error){

    console.error(error);

    alert(error.message);

  }

};

/* ====================================
   GOOGLE LOGIN
==================================== */

window.googleLogin = async()=>{

  try{

    const result =
      await signInWithPopup(

        auth,
        provider

      );

    await createUserDocument(

      result.user,
      result.user.displayName

    );

    const userRef =
      doc(
        db,
        "users",
        result.user.uid
      );

    const userSnap =
      await getDoc(userRef);

    let premium = false;

    if(userSnap.exists()){

      premium =
        userSnap.data().premium;

    }

    localStorage.setItem(

      "voxfixPremium",

      premium

    );

    localStorage.setItem(

      "voxfixName",

      result.user.displayName

    );

    alert(
      "Google login successful."
    );

    window.location.href =
      "index.html";

  }catch(error){

    console.error(error);

    alert(error.message);

  }

};

/* ====================================
   GUEST LOGIN
==================================== */

window.guestLogin = async()=>{

  try{

    const result =
      await signInAnonymously(
        auth
      );

    await createUserDocument(

      result.user,
      "Guest"

    );

    localStorage.setItem(

      "voxfixName",

      "Guest"

    );

    localStorage.setItem(

      "voxfixPremium",

      "false"

    );

    window.location.href =
      "index.html";

  }catch(error){

    console.error(error);

    alert(error.message);

  }

};

/* ====================================
   AUTH SESSION
==================================== */

onAuthStateChanged(

  auth,

  async(user)=>{

    if(user){

      console.log(
        "Logged in:",
        user.uid
      );

      const userRef =
        doc(
          db,
          "users",
          user.uid
        );

      const userSnap =
        await getDoc(userRef);

      if(userSnap.exists()){

        const userData =
          userSnap.data();

        localStorage.setItem(

          "voxfixPremium",

          userData.premium

        );

        localStorage.setItem(

          "voxfixPlan",

          userData.plan

        );

      }

    }else{

      console.log(
        "No active session"
      );

    }

  }

);

/* ====================================
   LOGOUT
==================================== */

window.logout = async()=>{

  try{

    await signOut(auth);

    localStorage.clear();

    window.location.href =
      "auth.html";

  }catch(error){

    console.error(error);

    alert(error.message);

  }

};