/* =========================
   USER SESSION
========================= */

export function getUser() {
    return JSON.parse(localStorage.getItem("voxfix_user"));
}


/* =========================
   API CALL WRAPPER
========================= */

async function apiCall(url, body) {

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    return await res.json();
}


/* =========================
   POLISH MESSAGE
========================= */

export async function polishMessage(text) {

    const user = getUser();

    return await apiCall("/api/ai-route", {
        uid: user.uid,
        feature: "polish",
        input: text
    });
}


/* =========================
   REPLY GENERATION
========================= */

export async function generateReply(text) {

    const user = getUser();

    return await apiCall("/api/ai-route", {
        uid: user.uid,
        feature: "reply",
        input: text
    });
}


/* =========================
   TRANSCRIPTION
========================= */

export async function transcribeAudio(file) {

    const user = getUser();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", user.uid);
    formData.append("feature", "transcription");

    const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData
    });

    return await res.json();
}