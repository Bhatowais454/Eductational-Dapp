import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { magic } from '../../magic';
import { auth } from '../firebase';
import { signInWithCustomToken } from 'firebase/auth';

export default function Callback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const finishLogin = async () => {
      try {
        // Magic login check
        const loggedIn = await magic.user.isLoggedIn();
        console.log('Magic session status:', loggedIn);

        if (!loggedIn) throw new Error('User is not logged in via Magic');

        // Get DID token
        const didToken = await magic.user.getIdToken();
        console.log("Callback got DID token:", didToken);

        // Send DID token to backend
        const res = await fetch(
          'https://api-3fi5ltc5ha-uc.a.run.app/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${didToken}`,
            },
          }
        );

        console.log('Backend response status:', res.status);
        const data = await res.json();
        console.log("Login response:", data);

        if (!data.firebaseToken) throw new Error('No Firebase token returned!');

        // Sign in to Firebase
        await signInWithCustomToken(auth, data.firebaseToken);
        console.log("Signed in to Firebase successfully.");

        // 🔹 NEW STEP: Ensure wallet exists or create it
        try {
          const walletRes = await fetch(
            'https://us-central1-owais-43.cloudfunctions.net/api/createWalletIfNotExists',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${didToken}`,
              },
            }
          );

          if (walletRes.ok) {
            const walletData = await walletRes.json();
            console.log("Wallet check/creation successful:", walletData);
          } else {
            const walletError = await walletRes.text();
            console.error("Wallet creation failed:", walletError);
          }
        } catch (walletErr) {
          console.error("Error ensuring wallet:", walletErr);
        }

        // Check student profile
        const profileRes = await fetch(
          'https://us-central1-owais-43.cloudfunctions.net/api/getStudentProfile',
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${didToken}` },
          }
        );

        console.log('Profile check response status:', profileRes.status);

        if (profileRes.ok) {
          navigate('/student');
        } else if (profileRes.status === 404) {
          navigate('/createProfile');
        } else {
          const errorText = await profileRes.text();
          console.error('Profile check failed:', errorText);
        }

      } catch (err) {
        console.error('Callback error:', err);
      } finally {
        setLoading(false);
      }
    };

    finishLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white">
      {loading ? (
        <div className="flex flex-col items-center space-y-6">
          {/* Sliding neon loader */}
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-400 border-b-purple-600 animate-spin-slow"></div>
            <div className="absolute inset-0 rounded-full border-4 border-l-indigo-400 border-r-indigo-600 animate-spin"></div>
          </div>
          {/* Glowing text */}
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 animate-gradient-x">
            Processing your login...
          </p>
        </div>
      ) : (
        <p className="text-red-400 font-semibold">Something went wrong. Please try again.</p>
      )}

      {/* Tailwind custom animations */}
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% }
          50% { background-position: 100% }
          100% { background-position: 0% }
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
