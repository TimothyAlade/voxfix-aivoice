import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================================
   SIDEBAR
========================================= */

window.toggleSidebar = function(){

    document
    .getElementById("sidebar")
    .classList
    .toggle("active");

};

/* =========================================
   SECTION SWITCHING
========================================= */

window.showSection = function(id){

    document
    .querySelectorAll(".app-section")
    .forEach(section => {

        section.classList.remove(
            "active-section"
        );

    });

    document
    .getElementById(id)
    .classList.add(
        "active-section"
    );

    document
    .getElementById("sidebar")
    .classList.remove(
        "active"
    );

};

/* =========================================
   AUTH
========================================= */

onAuthStateChanged(auth, async(user)=>{

    const greeting =
    document.getElementById(
        "userGreeting"
    );

    const authLink =
    document.getElementById(
        "authLink"
    );

    if(user){

        authLink.style.display =
        "none";

        greeting.innerText =
        `Hi, ${user.displayName || "User"}`;

        loadHistory(user.uid);

    }else{

        greeting.innerText =
        "Guest User";

    }

});

/* =========================================
   LOGOUT
========================================= */

window.logoutUser = async function(){

    try{

        await signOut(auth);

        alert(
            "Logged out successfully."
        );

        location.href =
        "auth.html";

    }catch(error){

        alert(error.message);

    }

};

/* =========================================
   FIX MESSAGE
========================================= */

const fixBtn =
document.getElementById(
    "fixBtn"
);

fixBtn.addEventListener(
    "click",
    async()=>{

        const input =
        document.getElementById(
            "promptInput"
        ).value;

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

        document.getElementById(
            "resultText"
        ).innerHTML =
        `
        ✨ Rewritten in ${tone} tone (${language}):

        <br><br>

        ${input}
        `;

    }
);

/* =========================================
   COPY
========================================= */

window.copyResult = function(){

    const text =
    document.getElementById(
        "resultText"
    ).innerText;

    navigator.clipboard.writeText(
        text
    );

    alert(
        "Copied successfully."
    );

};

/* =========================================
   SHARE
========================================= */

window.shareAIResult = async function(){

    const text =
    document.getElementById(
        "resultText"
    ).innerText;

    if(navigator.share){

        await navigator.share({

            title:"VoxFix AI",

            text:text

        });

    }else{

        alert(
            "Sharing not supported on this device."
        );

    }

};

/* =========================================
   HISTORY
========================================= */

async function loadHistory(uid){

    try{

        const ref =
        doc(
            db,
            "users",
            uid
        );

        const snap =
        await getDoc(ref);

        if(snap.exists()){

            const data =
            snap.data();

            const history =
            data.history || [];

            const list =
            document.getElementById(
                "historyList"
            );

            if(history.length === 0){

                list.innerHTML =
                "No saved history.";

                return;

            }

            list.innerHTML =
            history.map(item=>`
                <div class="history-item">
                    ${item}
                </div>
            `).join("");

        }

    }catch(error){

        console.log(error);

    }

}

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

window.resetFreeUses =
function(){

    alert(
        "Free usage reset."
    );

};