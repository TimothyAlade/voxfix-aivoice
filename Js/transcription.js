export async function transcribeAudio(file) {

    const formData = new FormData();
    formData.append("audio", file);

    const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Transcription failed");
    }

    return data.text;
}