import { getUser } from "./voxfix-core.js";

export function payWithFlutterwave() {

    const user = getUser();

    FlutterwaveCheckout({

        public_key: "FLWPUBK-0c35e47a817888bb118eb81c282ddb31-X",

        tx_ref: "VOXFIX_" + Date.now(),

        amount: 10,
        currency: "USD",

        meta: {
            uid: user.uid
        },

        customer: {
            email: user.email,
            name: user.name
        },

        callback: function () {
            window.location.href = "/dashboard.html";
        }
    });
}