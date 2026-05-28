import admin from "firebase-admin";


if (!admin.apps.length) {

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey:
                process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        })
    });
}

const db = admin.firestore();


export default async function handler(req, res) {

    try {

        const event =
            req.body?.event;

        if (event !== "charge.completed") {
            return res.status(200).send("ignored");
        }

        const data =
            req.body?.data;

        const uid =
            data?.meta?.uid;

        if (!uid) {
            return res.status(400).send("missing uid");
        }

        await db.collection("users")
            .doc(uid)
            .update({
                plan: "pro",
                upgradedAt: Date.now()
            });

        return res.status(200).send("ok");

    } catch (err) {

        return res.status(500).send(err.message);
    }
}