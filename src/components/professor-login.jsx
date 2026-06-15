import React, { useState } from 'react';
import { magic } from '../../magic';
import { useNavigate } from 'react-router-dom';

export default function ProfessorLogin() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await magic.auth.loginWithEmailOTP({ email });
      // Redirect to professor-specific callback
      navigate('/professorCallback');
    } catch (err) {
      console.error('Professor login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 relative overflow-hidden px-4">
      {/* BACKGROUND BRANDING */}
      <div className="absolute top-12 text-center w-full z-0">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">
          University of Kashmir
        </h1>
        <p className="text-lg md:text-xl text-white/80 mt-2 drop-shadow">
          Web3 DApp for Professors
        </p>
      </div>

      {/* LOGIN CARD */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Professor Login with Email OTP
        </h2>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />
        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold text-lg shadow-md hover:from-indigo-700 hover:to-purple-600 transition"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
}
