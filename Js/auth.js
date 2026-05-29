import {
    auth,
    db
} from "./firebase-core.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================
   SIGNUP
========================= */

export async function signup(name, email, password) {

    const cred =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

    await updateProfile(cred.user, {
        displayName: name
    });

    await setDoc(
        doc(db, "users", cred.user.uid),
        {
            uid: cred.user.uid,
            name,
            email,
            plan: "free",

            usage: {
                polish: 0,
                reply: 0,
                transcription: 0
            },

            createdAt: Date.now()
        }
    );

    return cred.user;
}


/* =========================
   LOGIN
========================= */

export async function login(email, password) {

    const cred =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    return cred.user;
}


/* =========================
   AUTH STATE
========================= */

export function initAuthRedirects() {

    onAuthStateChanged(auth, async (user) => {

        if (!user) return;

        try {

            const snap = await getDoc(
                doc(db, "users", user.uid)
            );

            if (!snap.exists()) return;

            const data = snap.data();

            localStorage.setItem(
                "voxfix_user",
                JSON.stringify({
                    uid: user.uid,
                    name: data.name,
                    email: data.email,
                    plan: data.plan,
                    usage: data.usage || {}
                })
            );

        } catch (err) {

            console.error(err);
        }
    });
}