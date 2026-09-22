// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
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

// Function to safely obtain or initialize the Firebase App
const getFirebaseApp = () => {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
};

export const authWithGoogle = async () => {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error("Firebase Auth Error:", err);
    throw err; // Throw the error so the UI can catch it!
  }
};