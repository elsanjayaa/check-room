import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBC1VdSAviU_1_smA2VO9YXnLoIfQzc21g",
  authDomain: "hotel-check-f020c.firebaseapp.com",
  projectId: "hotel-check-f020c",
  storageBucket: "hotel-check-f020c.firebasestorage.app",
  messagingSenderId: "1009331330415",
  appId: "1:1009331330415:web:1657b7683a9c6fef091c9a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
