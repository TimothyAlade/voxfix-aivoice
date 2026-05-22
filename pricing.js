/* ====================================
   FLUTTERWAVE KEYS
==================================== */

/* TEST */

const TEST_PUBLIC_KEY =
  "FLWPUBK_TEST-XXXXXXXXXXXX-X";

/* LIVE */

const LIVE_PUBLIC_KEY =
  "FLWPUBK-XXXXXXXXXXXX-X";

/* SWITCH */

const USE_LIVE_MODE =
  false;

/* ACTIVE */

const FLW_PUBLIC_KEY =

  USE_LIVE_MODE

  ? LIVE_PUBLIC_KEY

  : TEST_PUBLIC_KEY;

/* ====================================
   PRICING
==================================== */

const plans = {

  weekly:4.99,

  monthly:14.99,

  lifetime:79

};

/* ====================================
   PAY
==================================== */

window.payNow = function(plan){

  const amount =
    plans[plan];

  const name =
    localStorage.getItem(
      "voxfixName"
    ) || "User";

  FlutterwaveCheckout({

    public_key:
      FLW_PUBLIC_KEY,

    tx_ref:
      "VOXFIX_" +
      Date.now(),

    amount:
      amount,

    currency:
      "USD",

    payment_options:
      "card,ussd,banktransfer,mobilemoney",

    customer:{

      email:
        "customer@example.com",

      name:
        name

    },

    customizations:{

      title:
        "VoxFix AI Premium",

      description:
        `${plan} premium plan`,

      logo:
        "https://cdn-icons-png.flaticon.com/512/4712/4712109.png"

    },

    callback:function(response){

      console.log(response);

      localStorage.setItem(

        "voxfixPremium",

        "true"

      );

      localStorage.setItem(

        "voxfixPlan",

        plan

      );

      alert(
        "Payment successful."
      );

      window.location.href =
        "index.html";

    },

    onclose:function(){

      console.log(
        "Payment closed"
      );

    }

  });

};