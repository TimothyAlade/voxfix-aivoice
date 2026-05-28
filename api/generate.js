import OpenAI from "openai";
import { checkLimit } from "./_checkLimit.js";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        const formData = await req.formData();
        const uid = formData.get("uid");
        const audio = formData.get("audio");

        if (!uid) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 🔒 LIMIT CHECK
        await checkLimit(uid);

        if (!audio) {
            return res.status(400).json({ error: "No audio uploaded" });
        }

        const transcription = await openai.audio.transcriptions.create({
            file: audio,
            model: "whisper-1"
        });

        return res.status(200).json({
            text: transcription.text
        });

    } catch (err) {
        return res.status(403).json({
            error: err.message
        });
    }
}