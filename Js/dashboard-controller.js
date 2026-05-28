import {
    polishMessage,
    generateReply,
    transcribeAudio
} from "./voxfix-core.js";

import { setLoading } from "./dashboard-ui.js";


/* =========================
   POLISH
========================= */

export function initPolish() {

    const btn = document.getElementById("polishBtn");

    btn.onclick = async () => {

        setLoading(true, "Polishing message...");

        const input = document.getElementById("messageInput").value;

        const res = await polishMessage(input);

        document.getElementById("resultBox").innerText = res.result || "Error";

        setLoading(false);
    };
}


/* =========================
   REPLY
========================= */

export function initReply() {

    const btn = document.getElementById("replyBtn");

    btn.onclick = async () => {

        setLoading(true, "Generating reply...");

        const input = document.getElementById("messageInput").value;

        const res = await generateReply(input);

        document.getElementById("resultBox").innerText = res.result || "Error";

        setLoading(false);
    };
}


/* =========================
   TRANSCRIPTION
========================= */

export function initTranscription() {

    const input = document.getElementById("audioInput");

    input.onchange = async (e) => {

        setLoading(true, "Transcribing audio...");

        const file = e.target.files[0];

        const res = await transcribeAudio(file);

        document.getElementById("resultBox").innerText =
            res.transcription || "Error";

        setLoading(false);
    };
}