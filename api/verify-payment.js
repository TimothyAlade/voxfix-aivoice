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

        const {
            transaction_id,
            uid
        } = req.body;

        if (!transaction_id || !uid) {
            return res.status(400).json({
                error: "Missing data"
            });
        }

        /* =========================
           VERIFY FLUTTERWAVE
        ========================= */

        const verifyRes = await fetch(
            `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${process.env.FLW_SECRET_KEY}`
                }
            }
        );

        const verifyData =
            await verifyRes.json();

        const success =
            verifyData?.data?.status === "successful";

        if (!success) {

            return res.status(400).json({
                error: "Payment not successful"
            });
        }

        /* =========================
           UPGRADE USER
        ========================= */

        await db.collection("users")
            .doc(uid)
            .update({
                plan: "pro",
                upgradedAt: Date.now()
            });

        return res.json({
            success: true
        });

    } catch (err) {

        return res.status(500).json({
            error: err.message
        });
    }
}