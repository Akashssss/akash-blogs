// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth" ; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZH8E-4nQhh49Ji85YOnOLsHSi-oJPae8",
  authDomain: "react-blog-5daf3.firebaseapp.com",
  projectId: "react-blog-5daf3",
  storageBucket: "react-blog-5daf3.appspot.com",
  messagingSenderId: "1083524706109",
  appId: "1:1083524706109:web:70a7de6e2d33fa9a775f54",
  measurementId: "G-2N7R0GZN3G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const provider = new GoogleAuthProvider() ; 
const auth  =getAuth() ;


export const authWithGoogle  = async()=>{
 
    let user  = null ; 
  await signInWithPopup(auth, provider).
  then((result)=>{
    user = result.user
  }).catch((err)=>{
    console.log(err)
  })

  return user ;
   
}