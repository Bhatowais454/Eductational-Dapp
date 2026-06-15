import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { magic } from "../../magic";
import { auth } from "../firebase";
import { signInWithCustomToken } from "firebase/auth";

export default function ProfessorCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const finishLogin = async () => {
      try {
        // 1) Ensure Magic login
        const loggedIn = await magic.user.isLoggedIn();
        if (!loggedIn) throw new Error("User is not logged in via Magic");

        const user = await magic.user.getInfo(); // contains email
        const email = user?.email?.toLowerCase();
        if (!email) throw new Error("Failed to fetch your email. Please login again.");

        // 2) Get DID token
        const didToken = await magic.user.getIdToken();

        // 3) Try to get MPC wallet public address from Magic (no keys)
        let walletAddress = "";
        try {
          if (magic?.wallet?.getInfo) {
            const info = await magic.wallet.getInfo();
            // Different SDK versions use different fields
            walletAddress = info?.publicAddress || info?.address || "";
          }
          // Fallback via EVM provider (requires @magic-ext/ethereum in your magic instance)
          if (!walletAddress && magic?.rpcProvider?.request) {
            const accounts = await magic.rpcProvider.request({ method: "eth_requestAccounts" });
            walletAddress = accounts?.[0] || "";
          }
        } catch (wErr) {
          console.warn("Could not resolve wallet address from Magic:", wErr);
        }

        // 4) Check IF professor profile already exists (by email only)
        const profileRes = await fetch(
          "https://us-central1-owais-43.cloudfunctions.net/api/getProfessorProfile",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${didToken}` },
          }
        );

        if (profileRes.ok) {
          // 5a) Existing professor: get Firebase custom token and go to dashboard
          const tokenRes = await fetch(
            "https://us-central1-owais-43.cloudfunctions.net/api/getCustomToken",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${didToken}`,
              },
            }
          );
          if (!tokenRes.ok) throw new Error("Failed to get Firebase token");
          const { firebaseToken } = await tokenRes.json();
          await signInWithCustomToken(auth, firebaseToken);
          navigate("/TeacherDashboard");
        } else if (profileRes.status === 404) {
          // 5b) New professor: go to Create Profile, pass email + walletAddress
          navigate("/createProfessorProfile", {
            state: { email, walletAddress },
            replace: true,
          });
        } else {
          const errorText = await profileRes.text();
          throw new Error(`Profile check failed: ${errorText}`);
        }
      } catch (err) {
        console.error("Professor callback error:", err);
        setError(err.message || "Login failed");
      } finally {
        setLoading(false);
      }
    };

    finishLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      {loading ? (
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-400 border-b-purple-600 animate-spin-slow"></div>
            <div className="absolute inset-0 rounded-full border-4 border-l-purple-400 border-r-indigo-600 animate-spin"></div>
          </div>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-400 animate-gradient-x">
            Processing your professor login...
          </p>
        </div>
      ) : error ? (
        <p className="text-red-400 font-semibold">{error}</p>
      ) : null}

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






