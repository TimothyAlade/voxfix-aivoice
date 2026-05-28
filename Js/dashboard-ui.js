/* =========================
   LOADING SYSTEM
========================= */

export function setLoading(state, text = "Loading...") {

    let loader =
        document.getElementById("loader");

    if (!loader) {

        loader = document.createElement("div");

        loader.id = "loader";

        loader.style.position = "fixed";
        loader.style.top = "20px";
        loader.style.right = "20px";
        loader.style.background = "#111827";
        loader.style.color = "white";
        loader.style.padding = "12px 16px";
        loader.style.borderRadius = "10px";
        loader.style.zIndex = "9999";
        loader.style.border = "1px solid #334155";

        document.body.appendChild(loader);
    }

    loader.style.display = state ? "block" : "none";

    loader.innerText = text;
}


/* =========================
   GET USER
========================= */

function getUser() {

    return JSON.parse(
        localStorage.getItem("voxfix_user")
    );
}


/* =========================
   USAGE RENDER SYSTEM
========================= */

export function renderUsage() {

    const usageBox =
        document.getElementById("usageBox");

    if (!usageBox) return;

    const user = getUser();

    if (!user) return;

    const usage = user.usage || {
        polish: 0,
        reply: 0,
        transcription: 0
    };

    const plan =
        user.plan || "free";

    const limits = {

        free: {
            polish: 3,
            reply: 3,
            transcription: 1
        },

        pro: {
            polish: "∞",
            reply: "∞",
            transcription: "∞"
        }
    };

    const current =
        limits[plan];

    usageBox.innerHTML = `

        <div class="usage-card">

            <div class="plan-header ${plan}">
                ${plan === "pro"
                    ? "PRO PLAN"
                    : "FREE PLAN"}
            </div>

            <div class="usage-block">
                <div class="usage-top">
                    <span>Message Polish</span>
                    <span>
                        ${usage.polish}
                        /
                        ${current.polish}
                    </span>
                </div>

                <div class="bar-bg">
                    <div
                        class="bar-fill"
                        style="
                            width:
                            ${
                                plan === "pro"
                                ? "100"
                                : (usage.polish / 3) * 100
                            }%;
                        "
                    ></div>
                </div>
            </div>


            <div class="usage-block">
                <div class="usage-top">
                    <span>Reply Generator</span>
                    <span>
                        ${usage.reply}
                        /
                        ${current.reply}
                    </span>
                </div>

                <div class="bar-bg">
                    <div
                        class="bar-fill"
                        style="
                            width:
                            ${
                                plan === "pro"
                                ? "100"
                                : (usage.reply / 3) * 100
                            }%;
                        "
                    ></div>
                </div>
            </div>


            <div class="usage-block">
                <div class="usage-top">
                    <span>Voice Transcription</span>
                    <span>
                        ${usage.transcription}
                        /
                        ${current.transcription}
                    </span>
                </div>

                <div class="bar-bg">
                    <div
                        class="bar-fill"
                        style="
                            width:
                            ${
                                plan === "pro"
                                ? "100"
                                : (usage.transcription / 1) * 100
                            }%;
                        "
                    ></div>
                </div>
            </div>

        </div>

    `;
}