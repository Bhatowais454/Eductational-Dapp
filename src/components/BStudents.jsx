// src/pages/Playground/BStudent.jsx
import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // adjust path if needed

export default function BStudent() {
  const [batch, setBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null); // ✅ track copied wallet

  const isFourDigitYear = (text) => /^\d{4}$/.test(text);
  const isNumeric = (text) => /^\d+$/.test(text);
  const normalizeNumber = (val) => {
    const n = parseInt(val, 10);
    return Number.isNaN(n) ? "" : String(n);
  };

  const rollVariants = (val) => {
    const base = normalizeNumber(val);
    if (!base) return [];
    const MAX_ZEROES = 8;
    const out = [];
    for (let z = 0; z <= MAX_ZEROES; z++) out.push("0".repeat(z) + base);
    return out;
  };

  const handleFetchStudents = async (e) => {
    e.preventDefault();
    const term = (batch || "").trim();
    if (!term) return;

    setLoading(true);
    setError("");
    setStudents([]);

    try {
      let data = [];

      if (isFourDigitYear(term)) {
        const q = query(collection(db, "users"), where("batch", "==", term));
        const querySnapshot = await getDocs(q);
        data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } else if (isNumeric(term)) {
        const variants = rollVariants(term);
        let allDocs = [];
        if (variants.length > 0) {
          const q = query(collection(db, "users"), where("rollNo", "in", variants));
          const snap = await getDocs(q);
          allDocs = snap.docs;
        }
        const map = new Map();
        allDocs.forEach((doc) => map.set(doc.id, { id: doc.id, ...doc.data() }));
        data = Array.from(map.values());
      } else {
        const termUpper = term.toUpperCase();
        const usersRef = collection(db, "users");
        const nameQ = query(
          usersRef,
          where("name", ">=", termUpper),
          where("name", "<=", termUpper + "\uf8ff")
        );
        const nameSnap = await getDocs(nameQ);
        data = nameSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }

      if (data.length === 0) {
        setError("No students found.");
      } else {
        setStudents(data);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); // reset after 2s
    } catch (err) {
      console.error("Failed to copy wallet:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Student Details</h1>

      <form
        onSubmit={handleFetchStudents}
        className="flex justify-center gap-4 mb-8"
      >
        <input
          type="text"
          placeholder="Enter batch (e.g., 2022) or Name or Roll No."
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 placeholder-gray-400"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
        >
          Fetch
        </button>
      </form>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {students.map((student) => {
          const wallet =
            student.walletAddress || student.wallet?.evmAddress || "N/A";
          return (
            <div
              key={student.id}
              className="p-5 rounded-xl shadow-md hover:shadow-xl transition 
                        bg-gradient-to-br from-indigo-50 to-white border border-indigo-200"
            >
              <h2 className="text-lg font-bold text-indigo-800 mb-2">
                {student.name}
              </h2>
              <p className="text-gray-700">
                <span className="font-medium text-indigo-600">Email:</span>{" "}
                {student.email}
              </p>
              <p className="text-gray-700">
                <span className="font-medium text-indigo-600">Roll No:</span>{" "}
                {student.rollNo}
              </p>

              {/* ✅ Wallet with copy feature */}
              <p className="text-gray-700 flex items-center gap-2">
                <span className="font-medium text-indigo-600">Wallet:</span>
                <span
                  className="truncate max-w-[160px] cursor-pointer text-indigo-700 hover:underline"
                  title={wallet}
                  onClick={() => wallet !== "N/A" && handleCopy(student.id, wallet)}
                >
                  {wallet}
                </span>
                {copiedId === student.id && (
                  <span className="text-green-600 text-sm">Copied!</span>
                )}
              </p>

              <p className="text-gray-700">
                <span className="font-medium text-indigo-600">Batch:</span>{" "}
                {student.batch}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

