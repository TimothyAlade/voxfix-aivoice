import admin from "firebase-admin";
import OpenAI from "openai";


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
   FREE LIMITS
========================= */

const LIMITS = {
    polish: 3,
    reply: 3,
    transcription: 1
};


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

        const {
            uid,
            feature,
            input
        } = req.body;


        if (!uid || !feature || !input) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }


        /* =========================
           USER FETCH
        ========================= */

        const userRef = db.collection("users").doc(uid);

        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const user = userSnap.data();

        const isPro = user.plan === "pro";

        const usage = user.usage || {};


        /* =========================
           LIMIT ENFORCEMENT
        ========================= */

        if (!isPro) {

            const used = usage[feature] || 0;

            const limit = LIMITS[feature];

            if (used >= limit) {

                return res.status(403).json({
                    error: "Free limit reached",
                    upgrade: true
                });
            }
        }


        /* =========================
           PROMPT ROUTING
        ========================= */

        let systemPrompt = "You improve communication professionally.";


        if (feature === "polish") {
            systemPrompt = `
            Rewrite the user's message professionally.
            Keep it natural.
            Improve clarity.
            Keep original meaning.
            `;
        }


        if (feature === "reply") {
            systemPrompt = `
            Generate a smart professional reply.
            Keep it concise and human.
            `;
        }


        /* =========================
           AI GENERATION
        ========================= */

        const aiResponse = await openai.chat.completions.create({

            model: isPro
                ? "gpt-4o-mini"
                : "gpt-3.5-turbo",

            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: input
                }
            ],

            temperature: 0.7,
            max_tokens: 300
        });


        const result =
            aiResponse.choices?.[0]?.message?.content
            || "No response generated";


        /* =========================
           UPDATE USAGE
        ========================= */

        await userRef.update({
            [`usage.${feature}`]:
                admin.firestore.FieldValue.increment(1)
        });


        /* =========================
           ANALYTICS
        ========================= */

        await db.collection("analytics_events").add({
            uid,
            feature,
            type: "ai_use",
            timestamp: Date.now(),
            plan: user.plan
        });


        return res.json({
            success: true,
            result
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            error: err.message
        });
    }
}