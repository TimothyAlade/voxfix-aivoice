import admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();


/* =========================
   GET USER
========================= */

export async function getUser(uid) {

    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
        throw new Error("User not found");
    }

    return snap.data();
}


/* =========================
   RESET WEEKLY USAGE
========================= */

export async function resetUsageIfNeeded(uid, user) {

    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    if (!user.lastReset || now - user.lastReset > oneWeek) {

        await db.collection("users").doc(uid).update({
            usage: {
                transcription: 0,
                polish: 0,
                reply: 0
            },
            lastReset: now
        });

        user.usage = {
            transcription: 0,
            polish: 0,
            reply: 0
        };
    }

    return user;
}


/* =========================
   CHECK LIMIT
========================= */

export async function checkAndConsume(uid, feature) {

    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
        throw new Error("User not found");
    }

    let user = snap.data();

    // RESET IF NEEDED
    user = await resetUsageIfNeeded(uid, user);

    // PRO USERS = NO LIMITS
    if (user.plan === "pro") {
        return user;
    }

    const currentUsage = user.usage?.[feature] || 0;
    const limit = user.limits?.[feature];

    if (currentUsage >= limit) {
        throw new Error(`Limit reached for ${feature}`);
    }

    // INCREMENT USAGE
    await ref.update({
        [`usage.${feature}`]: currentUsage + 1
    });

    user.usage[feature] = currentUsage + 1;

    return user;
}


/* =========================
   UPGRADE USER
========================= */

export async function upgradeUser(uid) {

    await db.collection("users").doc(uid).update({
        plan: "pro"
    });
}