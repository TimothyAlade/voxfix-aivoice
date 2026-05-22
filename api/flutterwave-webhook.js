import admin from "firebase-admin";

/* ====================================
   FIREBASE ADMIN
==================================== */

if(!admin.apps.length){

  admin.initializeApp({

    credential:
      admin.credential.cert({

        projectId:
          process.env.FIREBASE_PROJECT_ID,

        clientEmail:
          process.env.FIREBASE_CLIENT_EMAIL,

        privateKey:
          process.env.FIREBASE_PRIVATE_KEY
          .replace(/\\n/g,"\n")

      })

  });

}

const db =
  admin.firestore();

/* ====================================
   WEBHOOK
==================================== */

export default async function handler(
  req,
  res
){

  if(req.method !== "POST"){

    return res.status(405).send(
      "Method not allowed"
    );

  }

  try{

    const secretHash =
      process.env.FLW_WEBHOOK_SECRET;

    const signature =
      req.headers["verif-hash"];

    /* ====================================
       VERIFY WEBHOOK
    ==================================== */

    if(
      !signature ||
      signature !== secretHash
    ){

      return res.status(401).send(
        "Invalid webhook"
      );

    }

    const payload =
      req.body;

    console.log(payload);

    /* ====================================
       SUCCESSFUL PAYMENT
    ==================================== */

    if(

      payload.event === "charge.completed"

      &&

      payload.data.status === "successful"

    ){

      const customerEmail =
        payload.data.customer.email;

      const amount =
        payload.data.amount;

      let plan = "weekly";

      if(amount >= 79){

        plan = "lifetime";

      }else if(amount >= 14.99){

        plan = "monthly";

      }

      /* ====================================
         FIND USER
      ==================================== */

      const userQuery =
        await db
        .collection("users")
        .where(
          "email",
          "==",
          customerEmail
        )
        .get();

      if(!userQuery.empty){

        const userDoc =
          userQuery.docs[0];

        /* ====================================
           UPDATE PREMIUM
        ==================================== */

        await userDoc.ref.update({

          premium:true,

          premiumPlan:plan,

          updatedAt:
            admin.firestore.FieldValue
            .serverTimestamp()

        });

      }

    }

    return res.status(200).send(
      "Webhook received"
    );

  }catch(error){

    console.error(error);

    return res.status(500).send(
      "Webhook error"
    );

  }

}