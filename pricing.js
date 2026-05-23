import {
  auth,
  db
}
from "./firebase.js";

import {
  doc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ====================================
   FLUTTERWAVE KEYS
==================================== */

const TEST_KEY =
"FLWPUBK_TEST-244e80dcb198108381cc5d9320da4fc9-X";

const LIVE_KEY =
"pk_live_9aa6ef8ab901b849ee1723345ff12bbef8162359";

/* ====================================
   SELECT KEY
==================================== */

const FLW_KEY =
location.hostname === "localhost"
? TEST_KEY
: LIVE_KEY;

/* ====================================
   USER DATA
==================================== */

async function getUserData(){

  const user =
    auth.currentUser;

  if(!user){

    alert(
      "Please login first."
    );

    location.href =
      "auth.html";

    return null;

  }

  const ref =
    doc(
      db,
      "users",
      user.uid
    );

  const snapshot =
    await getDoc(ref);

  return {

    uid:
      user.uid,

    email:
      user.email,

    ...snapshot.data()

  };

}

/* ====================================
   PAYMENT
==================================== */

async function payNow(

  plan,
  amount

){

  const user =
    await getUserData();

  if(!user){

    return;

  }

  FlutterwaveCheckout({

    public_key:
      FLW_KEY,

    tx_ref:
`VOXFIX-${Date.now()}`,

    amount,

    currency:"USD",

    payment_options:
      "card,banktransfer,ussd",

    customer:{

      email:
        user.email,

      name:
        user.name ||
        "VoxFix User"

    },

    customizations:{

      title:
        "VoxFix AI Premium",

      description:
        `${plan} subscription`,

      logo:
"https://voxfixai.vercel.app/logo.png"

    },

    callback:function(data){

      console.log(data);

      alert(
`Payment successful.

Premium activation may take a few seconds.`
      );

      location.reload();

    },

    onclose:function(){

      console.log(
        "Payment closed"
      );

    }

  });

}

/* ====================================
   BUTTONS
==================================== */

document

.getElementById(
  "weeklyBtn"
)

?.addEventListener(

  "click",

  ()=>{

    payNow(
      "weekly",
      5
    );

  }

);

document

.getElementById(
  "monthlyBtn"
)

?.addEventListener(

  "click",

  ()=>{

    payNow(
      "monthly",
      15
    );

  }

);

document

.getElementById(
  "lifetimeBtn"
)

?.addEventListener(

  "click",

  ()=>{

    payNow(
      "lifetime",
      79
    );

  }

);