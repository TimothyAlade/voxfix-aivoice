import admin from "firebase-admin";
import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";


export const config = {
    api: {
        bodyParser: false
    }
};


/* =========================
   FIREBASE ADMIN
========================= */

if (!admin.apps.length) {

    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        })
    });
}

const db = admin.firestore();


/* =========================
   OPENAI CLIENT
========================= */

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


/* =========================
   MAIN HANDLER
========================= */

export default async function handler(req, res) {

    try {

        if (req.method !== "POST") {
            return res.status(405).json({
                error: "Method not allowed"
            });
        }


        /* =========================
           FORM PARSE
        ========================= */

        const form = formidable({
            multiples: false,
            keepExtensions: true
        });


        const data = await new Promise((resolve, reject) => {

            form.parse(req, (err, fields, files) => {

                if (err) reject(err);

                resolve({
                    fields,
                    files
                });
            });
        });


        const uid = data.fields.uid?.[0];

        const file = data.files.file?.[0];


        if (!uid || !file) {
            return res.status(400).json({
                error: "Missing audio or uid"
            });
        }


        /* =========================
           USER CHECK
        ========================= */

        const userRef = db.collection("users").doc(uid);

        const snap = await userRef.get();

        if (!snap.exists) {
            return res.status(404).json({
                error: "User not found"
            });
        }


        const user = snap.data();

        const used = user?.usage?.transcription || 0;


        if (
            user.plan !== "pro" &&
            used >= 1
        ) {

            return res.status(403).json({
                error: "Monthly transcription limit reached",
                upgrade: true
            });
        }


        /* =========================
           OPENAI WHISPER
        ========================= */

        const transcription =
            await openai.audio.transcriptions.create({

                file: fs.createReadStream(file.filepath),

                model: "whisper-1"
            });


        /* =========================
           UPDATE USAGE
        ========================= */

        await userRef.update({
            "usage.transcription":
                admin.firestore.FieldValue.increment(1)
        });


        /* =========================
           ANALYTICS
        ========================= */

        await db.collection("analytics_events").add({
            uid,
            type: "transcription",
            timestamp: Date.now(),
            plan: user.plan
        });


        return res.json({
            success: true,
            transcription: transcription.text
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            error: err.message
        });
    }
}