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

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

async function testUpdateFull() {
    try {
        await auth.signInAnonymously();
        console.log("Anonymous sign-in success. UID:", auth.currentUser.uid);

        const docSnapshot = await db.collection("posts").limit(1).get();
        if (docSnapshot.empty) { return; }
        const firstPost = docSnapshot.docs[0];

        const updateData = {
            topic: "Test Topic",
            author: "Test Author",
            otherCategory: "기타",
            tags: ["Test Topic", "Test Author", "기타"],
            title: "Updated Title",
            series: "",
            order: 0,
            price: "",
            content: "Test Content",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        console.log("- Try updating post fully -");
        await db.collection("posts").doc(firstPost.id).update(updateData);
        console.log("Full Update SUCCESS! Payload isn't the issue.");
    } catch (err) {
        console.error("ERROR code:", err.code);
        console.error("ERROR message:", err.message);
    }
    process.exit();
}

testUpdateFull();
