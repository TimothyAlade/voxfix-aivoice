import {
    auth,
    db,
    googleProvider
} from "./firebase-core.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================
   CREATE USER PROFILE
========================= */

async function createUserProfile(user, name = "") {

    const ref = doc(db, "users", user.uid);

    await setDoc(ref, {
        uid: user.uid,
        email: user.email,
        name: name || user.displayName || "User",
        plan: "free",
        createdAt: Date.now(),
        usage: {
            transcription: 0,
            polish: 0,
            reply: 0
        }
    });
}


/* =========================
   SIGN UP
========================= */

export async function signup(email, password, name) {

    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(cred.user, {
        displayName: name
    });

    await createUserProfile(cred.user, name);

    return cred.user;
}


/* =========================
   LOGIN
========================= */

export async function login(email, password) {

    const cred = await signInWithEmailAndPassword(auth, email, password);

    return cred.user;
}


/* =========================
   GOOGLE LOGIN
========================= */

export async function googleLogin() {

    const result = await signInWithPopup(auth, googleProvider);

    const userRef = doc(db, "users", result.user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
        await createUserProfile(result.user);
    }

    return result.user;
}


/* =========================
   LOGOUT
========================= */

export async function logout() {

    await signOut(auth);
    localStorage.removeItem("voxfix_user");
    window.location.href = "/login.html";
}


/* =========================
   AUTH STATE CONTROLLER
   (CRITICAL FOR SECURITY FLOW)
========================= */

export function initAuthRedirects() {

    onAuthStateChanged(auth, async (user) => {

        if (!user) return;

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) return;

        const data = snap.data();

        // NEVER trust only localStorage
        localStorage.setItem("voxfix_user", JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: data.name,
            plan: data.plan
        }));

        // redirect logic
        const path = window.location.pathname;

        if (path.includes("login") || path.includes("signup")) {
            window.location.href = "/dashboard.html";
        }
    });
}