import { getUser } from "./voxfix-core.js";

export async function track(type, feature = null) {

    const user = getUser();

    if (!user) return;

    await fetch("/api/analytics-track", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            uid: user.uid,
            type,
            feature
        })
    });
}