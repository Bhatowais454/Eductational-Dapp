import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { magic } from '../magic';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

export default function AuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const finishLogin = async () => {
      try {
        const isLoggedIn = await magic.user.isLoggedIn();
        if (!isLoggedIn) {
          console.log('Not logged in');
          navigate('/login');
          return;
        }

        // ✅ 1) Get Magic DID token
        const didToken = await magic.user.getIdToken();

        // ✅ 2) Call your Firebase login Function
        const res = await fetch(
          'https://us-central1-owais-43.cloudfunctions.net/api/login',
          {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + didToken,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await res.json();
        const firebaseToken = data.firebaseToken;

        // ✅ 3) Sign in with Firebase custom token
        const auth = getAuth();
        await signInWithCustomToken(auth, firebaseToken);

        // ✅ 4) Now Firestore queries work
        const metadata = await magic.user.getInfo();
        const email = metadata.email;

        const docRef = doc(db, 'users', email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          navigate('/student');
        } else {
          navigate('/create-profile');
        }
      } catch (err) {
        console.error('Error finishing login:', err);
      }
    };

    finishLogin();
  }, [navigate]);

  return <p>Finishing login...</p>;
}
