import {
    auth
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* =========================================
   SAFE ELEMENTS
========================================= */

const sidebar =
document.getElementById(
    "sidebar"
);

const fixBtn =
document.getElementById(
    "fixBtn"
);

const resultText =
document.getElementById(
    "resultText"
);

/* =========================================
   SIDEBAR
========================================= */

window.toggleSidebar =
function(){

    if(sidebar){

        sidebar.classList.toggle(
            "active"
        );

    }

};

/* =========================================
   SECTION SWITCHING
========================================= */

window.showSection =
function(id){

    document
    .querySelectorAll(".app-section")
    .forEach(section=>{

        section.classList.remove(
            "active-section"
        );

    });

    const target =
    document.getElementById(id);

    if(target){

        target.classList.add(
            "active-section"
        );

    }

    if(sidebar){

        sidebar.classList.remove(
            "active"
        );

    }

};

/* =========================================
   AUTH
========================================= */

onAuthStateChanged(
    auth,
    (user)=>{

        const greeting =
        document.getElementById(
            "userGreeting"
        );

        if(user){

            greeting.innerText =
            `Hi, ${user.displayName || "User"}`;

        }else{

            greeting.innerText =
            "Guest User";

        }

    }
);

/* =========================================
   LOGOUT
========================================= */

window.logoutUser =
async function(){

    try{

        await signOut(auth);

        location.href =
        "auth.html";

    }catch(error){

        console.log(error);

    }

};

/* =========================================
   AI GENERATION
========================================= */

fixBtn.addEventListener(
    "click",
    async()=>{

        const input =
        document.getElementById(
            "promptInput"
        ).value.trim();

        const tone =
        document.getElementById(
            "toneSelect"
        ).value;

        const language =
        document.getElementById(
            "languageSelect"
        ).value;

        if(!input){

            alert(
                "Enter a message first."
            );

            return;

        }

        resultText.innerHTML =
        "✨ VoxFix AI is thinking...";

        try{

            const response =
            await fetch(
                "/api/generate",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({

                        message:input,

                        tone,

                        language

                    })

                }
            );

            const data =
            await response.json();

            resultText.innerHTML =
            data.result;

        }catch(error){

            console.log(error);

            resultText.innerHTML =
            "AI generation failed.";

        }

    }
);

/* =========================================
   COPY
========================================= */

window.copyResult =
function(){

    navigator.clipboard.writeText(
        resultText.innerText
    );

    alert(
        "Copied successfully."
    );

};

/* =========================================
   SHARE
========================================= */

window.shareAIResult =
async function(){

    if(navigator.share){

        await navigator.share({

            title:"VoxFix AI",

            text:
            resultText.innerText

        });

    }

};

/* =========================================
   SETTINGS
========================================= */

window.toggleDarkMode =
function(){

    document.body.classList.toggle(
        "light-mode"
    );

};

window.clearHistory =
function(){

    document.getElementById(
        "historyList"
    ).innerHTML =
    "History cleared.";

};