// src/components/Page2.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const highlights = [
  "Blockchain / NFT integration",
  "Student verification and NFTs / certificates",
  "Secure decentralized data",
  "Multi-chain support: Ethereum, Solana, Polygon, BNB, Bitcoin",
  "Easy-to-use interface",
  "Join the decentralized future of education"
];

export default function Page2() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Loop through highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlights.length);
    }, 2500); // change every 2.5s
    return () => clearInterval(interval);
  }, []);

  const variants = {
    enter: { y: 50, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 }
  };

  return (
    <div className="min-h-screen page bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex flex-col overflow-hidden">

      {/* Upper Section - Modern Sliding Points */}
      <div className="flex-1 flex justify-center items-center relative overflow-hidden pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="px-8 py-4 rounded-3xl text-2xl sm:text-4xl font-extrabold 
                       text-center bg-clip-text text-transparent 
                       bg-gradient-to-r from-pink-500 via-purple-400 to-blue-400 
                       drop-shadow-lg"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            {highlights[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lower Section - For future content */}
      <div className="flex-1 flex justify-center items-center">
        {/* You can add more components here later */}
      </div>

    </div>
  );
}
