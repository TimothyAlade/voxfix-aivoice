import { auth, db } from "./firebase-core.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    transcribeAudio
} from "./transcription.js";

import {
    polishMessage,
    generateReplies
} from "./ai.js";

let user = null;
let audioFile = null;

/* ================= AUTH GUARD ================= */

onAuthStateChanged(auth, (u) => {

    if (!u) {
        window.location.href = "login.html";
        return;
    }

    user = u;

    document.querySelector(".user-badge").innerText =
        u.displayName || "User";

    loadHistory();
});

/* ================= LOGOUT ================= */

document.querySelector(".logout-btn")?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
});

/* ================= FILE UPLOAD ================= */

const uploadBtn = document.querySelector(".upload-btn");
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "audio/*";

uploadBtn?.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
    audioFile = e.target.files[0];
});

/* ================= TRANSCRIPTION ================= */

document.querySelector(".mini-btn")?.addEventListener("click", async () => {

    if (!audioFile) return alert("Upload audio first");

    const text = await transcribeAudio(audioFile);

    document.querySelectorAll(".main-textarea")[0].value = text;

    saveHistory("transcription", text);
});

/* ================= POLISH MESSAGE ================= */

document.querySelector(".primary-action")?.addEventListener("click", async () => {

    const inputs = document.querySelectorAll(".main-textarea");

    const text = inputs[1].value;
    const tone = document.querySelector(".tone-select").value;

    const result = await polishMessage(text, tone);

    inputs[2].value = result;

    saveHistory("polish", result);
});

/* ================= SMART REPLIES ================= */

document.querySelector(".mini-btn:nth-of-type(2)")?.addEventListener("click", async () => {

    const text = document.querySelectorAll(".main-textarea")[1].value;

    const replies = await generateReplies(text);

    const container = document.querySelector(".reply-list");

    container.innerHTML = "";

    replies.forEach(r => {
        const div = document.createElement("div");
        div.className = "history-card";
        div.innerText = r;
        container.appendChild(div);
    });
});

/* ================= HISTORY ================= */

async function saveHistory(type, output) {

    if (!user) return;

    await addDoc(collection(db, "history"), {
        uid: user.uid,
        type,
        output,
        createdAt: serverTimestamp()
    });
}

async function loadHistory() {

    const q = query(
        collection(db, "history"),
        where("uid", "==", user.uid)
    );

    const snap = await getDocs(q);

    const container = document.querySelector(".history-list");
    container.innerHTML = "";

    snap.forEach(doc => {

        const d = doc.data();

        const div = document.createElement("div");
        div.className = "history-card";

        div.innerHTML = `
            <b>${d.type}</b>
            <p>${d.output}</p>
        `;

        container.appendChild(div);
    });
}