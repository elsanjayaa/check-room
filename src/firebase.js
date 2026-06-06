import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrvTg3jNWDAqzu7U0n-56nLjwdOqSD9xw",
  authDomain: "hotel-check-ff435.firebaseapp.com",
  projectId: "hotel-check-ff435",
  storageBucket: "hotel-check-ff435.firebasestorage.app",
  messagingSenderId: "168134002357",
  appId: "1:168134002357:web:c6d803ab5a384c04a1e0fc",
  measurementId: "G-LKZ19Y3HC3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
