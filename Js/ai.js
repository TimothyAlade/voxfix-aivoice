export async function polishMessage(text, tone) {

    const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type: "polish",
            text,
            tone
        })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    return data.result;
}

export async function generateReplies(text) {

    const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            type: "reply",
            text
        })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    return data.result;
}