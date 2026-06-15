import React, { useState } from 'react';
import { magic } from '../../magic';

export default function Login() {
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    try {
      await magic.auth.loginWithEmailOTP({ email });
      window.location.href = '/callback';
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 relative overflow-hidden px-4">
      {/* BACKGROUND BRANDING */}
      <div className="absolute top-12 text-center w-full z-0">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">
          University of Kashmir
        </h1>
        <p className="text-lg md:text-xl text-white/80 mt-2 drop-shadow">
          Blockchain-Based Ledger for Students
        </p>
      </div>

      {/* LOGIN CARD */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Login with Email OTP
        </h2>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
        />
        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg shadow-md hover:from-purple-700 hover:to-pink-600 transition"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
}
