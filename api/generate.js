export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ result: "Method not allowed" });
    }

    try {

        const {
            message,
            tone,
            language,
            userPlan
        } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ result: "No message provided" });
        }

        // =================================================
        // PLAN SYSTEM (CORE MONETIZATION LOGIC)
        // =================================================
        function isPremium(plan) {

            return [
                "weekly",
                "monthly",
                "lifetime"
            ].includes(plan);

        }

        function isLifetime(plan) {
            return plan === "lifetime";
        }

        // =================================================
        // TONE ACCESS CONTROL (IMPORTANT)
        // =================================================
        function resolveTone(tone, plan) {

            const freeTones = [
                "professional",
                "emotional"
            ];

            const premiumTones = [
                "CEO",
                "LUXURY",
                "DATING"
            ];

            // If free user tries premium tone → downgrade
            if (!isPremium(plan) && premiumTones.includes(tone)) {
                return "professional";
            }

            return tone;

        }

        const safeTone = resolveTone(tone, userPlan);

        // =================================================
        // TONE ENGINE (PSYCHOLOGY SYSTEM)
        // =================================================
        function buildToneInstruction(tone) {

            switch (tone) {

                case "CEO":
                    return `
You are writing like a top CEO.

RULES:
- very short sentences
- decisive leadership tone
- no emotional weakness
- high authority language
- direct communication
                    `;

                case "LUXURY":
                    return `
You are writing in luxury communication style.

RULES:
- calm and refined tone
- minimal words, maximum meaning
- high status expression
- emotionally controlled language
- elegant flow
                    `;

                case "DATING":
                    return `
You are writing attractive social communication.

RULES:
- confident tone
- smooth and natural flow
- playful but respectful
- emotionally intelligent attraction
                    `;

                case "EMOTIONAL":
                    return `
You are writing emotionally intelligent communication.

RULES:
- warm tone
- human and supportive language
- empathy focused
- natural flow
                    `;

                default:
                    return `
You are writing professional communication.

RULES:
- clear and structured
- simple intelligent wording
- no slang
                    `;
            }
        }

        // =================================================
        // CORE SYSTEM PROMPT
        // =================================================
        const systemPrompt = `
You are VoxFix AI.

Your job is to fully transform messages into high-quality communication.

CRITICAL RULES:
- NEVER copy structure from input
- NEVER repeat phrases from input
- NEVER paraphrase line by line
- ALWAYS rebuild message completely
- ALWAYS improve clarity and emotional intelligence
- ALWAYS remove weakness, repetition, and confusion

OUTPUT RULE:
Return ONLY final rewritten message.
No explanation.
No labels.
No formatting.
        `;

        // =================================================
        // USER PROMPT
        // =================================================
        const userPrompt = `
${buildToneInstruction(safeTone)}

Language: ${language}

Transform this message fully:

${message}
        `;

        // =================================================
        // OPENAI REQUEST
        // =================================================
        const response = await fetch("https://api.openai.com/v1/chat/completions", {

            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },

            body: JSON.stringify({

                model: "gpt-4o-mini",
                temperature: 0.85,
                max_tokens: 350,

                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user",
                        content: userPrompt
                    }
                ]

            })

        });

        const data = await response.json();

        let result = data?.choices?.[0]?.message?.content || "";

        // =================================================
        // ANTI-ECHO VALIDATION (IMPORTANT FIX)
        // =================================================
        function validate(input, output) {

            if (!output) return "AI failed to respond.";

            const inputShort = input.toLowerCase().slice(0, 25);
            const outputLower = output.toLowerCase();

            const isWeakCopy =
                outputLower.includes(inputShort);

            if (isWeakCopy) {
                return "Try again. AI could not properly transform this message.";
            }

            return output;

        }

        const safeResult = validate(message, result);

        // =================================================
        // RESPONSE
        // =================================================
        return res.status(200).json({

            result: safeResult,

            meta: {
                plan: userPlan,
                toneUsed: safeTone,
                premiumAccess: isPremium(userPlan),
                lifetime: isLifetime(userPlan)
            }

        });

    } catch (error) {

        console.log("ERROR:", error);

        return res.status(500).json({
            result: "Server error"
        });

    }
}