// src/components/Landing.js
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  SiEthereum, 
  SiBinance, 
  SiSolana, 
  SiPolygon, 
  SiBitcoin, 
  SiFantom,  
  SiNear     
} from 'react-icons/si';

const logos = [
  { name: 'Ethereum', Icon: SiEthereum, color: 'text-blue-400' },
  { name: 'Near', Icon: SiNear, color: 'text-blue-600' },
  { name: 'BNB', Icon: SiBinance, color: 'text-yellow-400' },
  { name: 'Solana', Icon: SiSolana, color: 'text-purple-400' },
  { name: 'Fantom', Icon: SiFantom, color: 'text-purple-500' },
  { name: 'Polygon', Icon: SiPolygon, color: 'text-purple-500' },
  { name: 'Bitcoin', Icon: SiBitcoin, color: 'text-orange-500' },
];

export default function Landing() {
  const radius = 220;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-white via-purple-50 to-indigo-100 text-gray-900">
      
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-300 opacity-30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-blue-300 opacity-30 rounded-full blur-[120px]" />
      </div>

      {/* Title fixed at top */}
      <header className="relative z-10 text-center py-8">
        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
          University Of Kashmir
        </h2>
        <p className="text-lg md:text-2xl mt-2 font-medium text-gray-700">
          Web3 Dapp for Students
        </p>
      </header>

      {/* Main Section */}
      <div className="flex-1 flex flex-col justify-center items-center">
        
        {/* Circular Logos */}
        <div className="absolute inset-0 flex justify-center items-center z-0">
          {logos.map((logo, i) => {
            const angle = (i / logos.length) * 2 * Math.PI;
            return (
              <motion.div
                key={i}
                className="absolute w-20 h-20 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center"
                style={{ x: radius * Math.cos(angle), y: radius * Math.sin(angle) }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
              >
                <logo.Icon className={`w-12 h-12 ${logo.color}`} />
              </motion.div>
            );
          })}

          {/* Center Get Started */}
          <div className="absolute flex justify-center items-center">
            <Link
              to="/login"
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-semibold rounded-xl shadow-md hover:scale-105 transition-transform"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Buttons (at very bottom) */}
      <footer className="relative z-10 flex justify-center gap-6 py-8">
        <Link
          to="/login"
          className="px-6 py-3 bg-white/80 backdrop-blur-md text-gray-900 text-lg font-semibold rounded-xl shadow-md hover:bg-white hover:scale-105 transition-transform"
        >
          Student Login
        </Link>
        <Link
          to="/professor-login"
          className="px-6 py-3 bg-white/80 backdrop-blur-md text-gray-900 text-lg font-semibold rounded-xl shadow-md hover:bg-white hover:scale-105 transition-transform"
        >
          Professor Login
        </Link>
      </footer>
    </div>
  );
}



