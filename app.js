import {
  auth,
  db
}
from "./firebase.js";

import {
  generateAIResponse
}
from "./openai.js";

import {
  getPrompt
}
from "./aimode.js";

import {
  transcribeAudio
}
from "./transcribe.js";

import {
  saveHistory
}
from "./history.js";

import {
  shareResult
}
from "./share.js";

import {

  doc,

  getDoc,

  updateDoc,

  increment

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ====================================
   ELEMENTS
==================================== */

const /* ====================================
   MENU
==================================== */

const menuBtn =
  document.getElementById(
    "menuBtn"
  );

const sidebar =
  document.getElementById(
    "sidebar"
  );

menuBtn.addEventListener(
  "click",
  ()=>{

    sidebar.classList.toggle(
      "active"
    );

  }
);

/* CLOSE MENU OUTSIDE */

document.addEventListener(
  "click",
  (event)=>{

    if(
      !sidebar.contains(event.target)
      &&
      !menuBtn.contains(event.target)
    ){

      sidebar.classList.remove(
        "active"
      );

    }

  }
);

/* ====================================
   AUTH DISPLAY
==================================== */

const authLinks =
  document.getElementById(
    "authLinks"
  );

const userGreeting =
  document.getElementById(
    "userGreeting"
  );

const storedName =
  localStorage.getItem(
    "voxfixName"
  );

if(storedName){

  userGreeting.innerText =
    `Hi, ${storedName}`;

  authLinks.style.display =
    "none";

}else{

  userGreeting.innerText =
    "Guest";

}

/* ====================================
   LOGOUT
==================================== */

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );

logoutBtn.addEventListener(
  "click",
  ()=>{

    localStorage.clear();

    window.location.href =
      "auth.html";

  }
);
const userGreeting =
  document.getElementById(
    "userGreeting"
  );

const fixBtn =
  document.getElementById(
    "fixBtn"
  );

const resultText =
  document.getElementById(
    "resultText"
  );

const audioInput =
  document.getElementById(
    "audioInput"
  );

/* ====================================
   SIDEBAR
==================================== */

menuBtn.addEventListener(
  "click",
  ()=>{

    sidebar.classList.toggle(
      "active"
    );

  }
);

/* ====================================
   LOAD USER
==================================== */

let currentPremium =
  false;

let currentPlan =
  "free";

async function loadUserData(){

  const user =
    auth.currentUser;

  if(!user){

    window.location.href =
      "auth.html";

    return;

  }

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

    currentPremium =
      userData.premium;

    currentPlan =
      userData.plan;

    localStorage.setItem(

      "voxfixPremium",

      currentPremium

    );

    localStorage.setItem(

      "voxfixPlan",

      currentPlan

    );

    userGreeting.innerText =
      `Hi, ${userData.name}`;

  }

}

loadUserData();

/* ====================================
   AUDIO
==================================== */

audioInput.addEventListener(

  "change",

  async(event)=>{

    if(!currentPremium){

      alert(
        "Premium required for voice transcription."
      );

      return;

    }

    const file =
      event.target.files[0];

    if(!file) return;

    resultText.innerText =
      "Transcribing voice note...";

    const transcription =
      await transcribeAudio(
        file
      );

    document.getElementById(
      "userInput"
    ).value =
      transcription;

    resultText.innerText =
      "Voice note transcribed successfully.";

  }

);

/* ====================================
   GENERATE AI
==================================== */

fixBtn.addEventListener(

  "click",

  async()=>{

    const input =
      document.getElementById(
        "userInput"
      ).value.trim();

    if(!input){

      alert(
        "Enter a message first."
      );

      return;

    }

    const tone =
      document.getElementById(
        "toneSelect"
      ).value;

    const language =
      document.getElementById(
        "languageSelect"
      ).value;

    /* PREMIUM LANGUAGE */

    if(
      language !== "English"
      &&
      !currentPremium
    ){

      alert(
        "Premium required for multilingual AI."
      );

      return;

    }

    resultText.innerText =
      "Generating premium AI response...";

    try{

      const prompt =
        getPrompt(
          tone,
          input
        ) +

`
Translate response to:
${language}
`;

      const result =
        await generateAIResponse(
          prompt
        );

      resultText.innerText =
        result;

      /* SAVE HISTORY */

      await saveHistory(

        input,
        result,
        tone

      );

      /* UPDATE REQUEST COUNT */

      const user =
        auth.currentUser;

      if(user){

        const userRef =
          doc(
            db,
            "users",
            user.uid
          );

        await updateDoc(

          userRef,

          {

            requests:
              increment(1)

          }

        );

      }

    }catch(error){

      console.error(error);

      resultText.innerText =
`
AI generation failed.

Please try again.
`;

    }

  }

);

/* ====================================
   COPY
==================================== */

document.getElementById(
  "copyBtn"
).addEventListener(

  "click",

  async()=>{

    const text =
      resultText.innerText;

    await navigator.clipboard.writeText(
      text
    );

    alert(
      "Copied successfully."
    );

  }

);

/* ====================================
   SHARE
==================================== */

document.getElementById(
  "shareBtn"
).addEventListener(

  "click",

  async()=>{

    await shareResult();

  }

);

/* ====================================
   LOGOUT
==================================== */

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );

logoutBtn.addEventListener(

  "click",

  ()=>{

    localStorage.clear();

  }

);