// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCGQRXH_QKDC3-7N9ytV91mYafn2I4KxxI",
    authDomain: "twiller-nullclass.firebaseapp.com",
    projectId: "twiller-nullclass",
    storageBucket: "twiller-nullclass.appspot.com",
    messagingSenderId: "353299659981",
    appId: "1:353299659981:web:da021a1cc83e8cc757bd84",
    measurementId: "G-TYX9JKPDM7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export default app