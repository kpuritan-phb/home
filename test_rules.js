const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');
require('firebase/compat/auth');

const firebaseConfig = {
    apiKey: "AIzaSyCJbOaiElCypwgtPgbwdnudn3VC737fMrs",
    authDomain: "kpuritan-home.firebaseapp.com",
    projectId: "kpuritan-home",
    storageBucket: "kpuritan-home.firebasestorage.app",
    messagingSenderId: "1071220455502",
    appId: "1:1071220455502:web:7f6f59b48c48a73437f8f0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

async function testUpdate() {
    try {
        await auth.signInAnonymously();
        console.log("Anonymous sign-in success. UID:", auth.currentUser.uid);

        console.log("- Try reading posts -");
        const doc = await db.collection("posts").limit(1).get();
        if (doc.empty) {
            console.log("No posts found.");
            return;
        }
        const firstPost = doc.docs[0];
        console.log("Post ID:", firstPost.id);

        console.log("- Try updating post -");
        await db.collection("posts").doc(firstPost.id).update({
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log("Update SUCCESS! Firebase rules allow anonymous writes.");
    } catch (err) {
        console.error("ERROR code:", err.code);
        console.error("ERROR message:", err.message);
    }
    process.exit();
}

testUpdate();
