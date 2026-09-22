// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8kVfOl8BrfQ5ptCslDBd1F4_RzIH_0nA",
  authDomain: "akash-mern-blog.firebaseapp.com",
  projectId: "akash-mern-blog",
  storageBucket: "akash-mern-blog.firebasestorage.app",
  messagingSenderId: "972908866709",
  appId: "1:972908866709:web:f3fd300195fcc037ba3f9c",
  measurementId: "G-LJC1R0PV2Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const provider = new GoogleAuthProvider();
const auth = getAuth(app);


export const authWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error("Firebase Auth Error:", err);
    throw err; // Throw the error so the UI can catch it!
  }
}