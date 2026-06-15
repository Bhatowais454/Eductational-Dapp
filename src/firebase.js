// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: 'AIzaSyCeHKrOBztMUU9U3tc9y1JWwae08v7-PUw',
  authDomain: 'owais-43.firebaseapp.com',
  projectId: 'owais-43',
  storageBucket: 'owais-43.firebasestorage.app',
  messagingSenderId: '1086064977170',
  appId: '1:1086064977170:web:84e74597156b6b8a80bfcb',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);