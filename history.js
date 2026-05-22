import {
  db,
  auth
}
from "./firebase.js";

import {

  collection,

  addDoc,

  query,

  where,

  orderBy,

  getDocs,

  serverTimestamp

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ====================================
   SAVE HISTORY
==================================== */

export async function saveHistory(

  input,
  output,
  tone

){

  try{

    const user =
      auth.currentUser;

    if(!user){

      return;

    }

    await addDoc(

      collection(
        db,
        "history"
      ),

      {

        uid:
          user.uid,

        input,

        output,

        tone,

        premium:
          localStorage.getItem(
            "voxfixPremium"
          ) === "true",

        createdAt:
          serverTimestamp()

      }

    );

  }catch(error){

    console.error(error);

  }

}

/* ====================================
   LOAD HISTORY
==================================== */

export async function loadHistory(){

  try{

    const user =
      auth.currentUser;

    if(!user){

      return [];

    }

    const q =
      query(

        collection(
          db,
          "history"
        ),

        where(
          "uid",
          "==",
          user.uid
        ),

        orderBy(
          "createdAt",
          "desc"
        )

      );

    const snapshot =
      await getDocs(q);

    const history = [];

    snapshot.forEach((doc)=>{

      history.push({

        id:
          doc.id,

        ...doc.data()

      });

    });

    return history;

  }catch(error){

    console.error(error);

    return [];

  }

}