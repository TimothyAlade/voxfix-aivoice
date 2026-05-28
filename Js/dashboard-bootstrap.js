import {
    initPolish,
    initReply,
    initTranscription
} from "./dashboard-controller.js";

import { renderUsage } from "./dashboard-ui.js";


window.addEventListener("load", () => {

    renderUsage();

    initPolish();
    initReply();
    initTranscription();
});