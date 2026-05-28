import { auth } from "./firebase-core.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* =========================
   PLAN BUTTONS
========================= */

const upgradeButtons = document.querySelectorAll(".pricing-btn");

let currentUser = null;


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, (user) => {

    if (!user) {

        // NOT LOGGED IN
        upgradeButtons.forEach(btn => {

            btn.addEventListener("click", () => {
                window.location.href = "login.html";
            });

        });

        return;
    }

    currentUser = user;

    initializePayments();
});


/* =========================
   INITIALIZE PAYMENTS
========================= */

function initializePayments() {

    upgradeButtons.forEach((button) => {

        button.addEventListener("click", async () => {

            const plan =
                button.dataset.plan || "pro";

            const amount =
                button.dataset.amount || 5;

            startFlutterwavePayment(plan, amount);

        });

    });
}


/* =========================
   FLUTTERWAVE CHECKOUT
========================= */

function startFlutterwavePayment(plan, amount) {

    if (!currentUser) {
        return alert("Please login first.");
    }

    FlutterwaveCheckout({

        public_key: "FLWPUBK-0c35e47a817888bb118eb81c282ddb31-X",

        tx_ref: `voxfix_${Date.now()}`,

        amount: Number(amount),

        currency: "USD",

        payment_options: "card,banktransfer,ussd",

        customer: {
            email: currentUser.email,
            name: currentUser.displayName || "VoxFix User"
        },

        meta: {
            uid: currentUser.uid,
            plan: plan
        },

        customizations: {
            title: "VoxFix AI Premium",
            description: "Unlock premium AI tools",
            logo: "https://yourdomain.com/logo.png"
        },

        callback: async function (payment) {

            try {

                const res = await fetch("/api/verify-payment", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        transaction_id: payment.transaction_id,

                        uid: currentUser.uid

                    })

                });

                const data = await res.json();

                if (data.success) {

                    showSuccessMessage();

                    setTimeout(() => {

                        window.location.href =
                            "dashboard.html";

                    }, 2000);

                } else {

                    alert(data.error || "Payment verification failed");

                }

            } catch (err) {

                alert(err.message);

            }

        },

        onclose: function () {

            console.log("Payment popup closed");

        }

    });
}


/* =========================
   SUCCESS UI
========================= */

function showSuccessMessage() {

    const successBox = document.createElement("div");

    successBox.className = "payment-success-box";

    successBox.innerHTML = `
        <h3>Premium Activated</h3>
        <p>Your VoxFix AI Pro plan is now active.</p>
    `;

    document.body.appendChild(successBox);
}


/* =========================
   HANDLE URL STATUS
========================= */

const params = new URLSearchParams(window.location.search);

const paymentStatus = params.get("status");

if (paymentStatus === "cancelled") {

    alert("Payment was cancelled.");

}