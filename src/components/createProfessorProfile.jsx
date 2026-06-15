import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { magic } from "../../magic"; // ✅ Ensure this is frontend SDK: "magic-sdk"
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function CreateProfessorProfile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const loggedIn = await magic.user.isLoggedIn();
        if (!loggedIn) throw new Error("User not logged in");

        // ✅ Fetch logged-in user info
        const metadata = await magic.user.getInfo();
        if (metadata?.email) {
          setEmail(metadata.email);
        } else {
          throw new Error("Failed to fetch email from Magic");
        }
      } catch (err) {
        console.error("Error fetching Magic user info:", err);
        setError("Failed to fetch your email. Please login again.");
      }
    };

    fetchEmail();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!uniqueCode) throw new Error("Unique code is required");

      const codeDoc = await getDoc(doc(db, "professorCodes", uniqueCode));
      if (!codeDoc.exists()) throw new Error("Invalid unique code");
      if (codeDoc.data().used) throw new Error("This code has already been used");

      const safeEmail = email.replace(/[.#$[\]/]/g, "_");

      // 🔹 Get professor's Magic MPC wallet address
      const accounts = await magic.rpcProvider.request({ method: "eth_accounts" });
      const walletAddress = accounts[0];
      console.log("Professor Wallet Address:", walletAddress);

      // 🔹 Save professor profile with wallet address
      await setDoc(doc(db, "professors", safeEmail), {
        name,
        email,
        department,
        phone,
        wallet: walletAddress,
        createdAt: new Date().toISOString(),
        uniqueCode,
      });

      // 🔹 Mark unique code as used
      await setDoc(
        doc(db, "professorCodes", uniqueCode),
        { used: true },
        { merge: true }
      );

      // 🔹 Store wallet locally for session usage
      if (walletAddress) {
        localStorage.setItem("professorWallet", walletAddress);
      }

      navigate("/TeacherDashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-pink-500 to-red-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Create Professor Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100"
          />
          <input
            type="text"
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Enter Admin Unique Code"
            value={uniqueCode}
            onChange={(e) => setUniqueCode(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg shadow-md hover:from-purple-700 hover:to-pink-600 transition"
          >
            {loading ? "Creating..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}




