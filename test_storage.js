const firebase = require('firebase/compat/app');
require('firebase/compat/storage');
require('firebase/compat/auth');
const fs = require('fs');

const firebaseConfig = {
    apiKey: "AIzaSyCJbOaiElCypwgtPgbwdnudn3VC737fMrs",
    authDomain: "kpuritan-home.firebaseapp.com",
    projectId: "kpuritan-home",
    storageBucket: "kpuritan-home.firebasestorage.app",
    messagingSenderId: "1071220455502",
    appId: "1:1071220455502:web:7f6f59b48c48a73437f8f0"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const storage = firebase.storage();

async function testStorage() {
    try {
        await auth.signInAnonymously();
        console.log("Anonymous sign-in success.");

        console.log("- Try uploading file -");
        // Create array buffer
        const buffer = new Uint8Array([1, 2, 3]);
        const ref = storage.ref(`covers/test_upload_${Date.now()}.png`);

        await ref.put(buffer);
        console.log("Upload SUCCESS! Firebase Storage rules allow anonymous writes.");
    } catch (err) {
        console.error("ERROR code:", err.code);
        console.error("ERROR message:", err.message);
    }
    process.exit();
}

testStorage();
