// src/components/Announcements.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { MegaphoneIcon } from "@heroicons/react/24/solid";

export default function Announcements() {
  const [user, setUser] = useState(null);
  const [batch, setBatch] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setBatch(userDoc.data().batch || null);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        let batchData = [];
        if (batch) {
          const res = await fetch(
            `https://us-central1-owais-43.cloudfunctions.net/api/announcements/${batch}`
          );
          if (res.ok) {
            batchData = await res.json();
          }
        }

        let allData = [];
        const resAll = await fetch(
          "https://us-central1-owais-43.cloudfunctions.net/api/announcements/All"
        );
        if (resAll.ok) {
          allData = await resAll.json();
        }

        const merged = [...batchData, ...allData].sort((a, b) => {
          const timeA = a.createdAt?._seconds || 0;
          const timeB = b.createdAt?._seconds || 0;
          return timeB - timeA;
        });

        setAnnouncements(merged);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [user, batch]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">🔒 Please log in to see announcements.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <div className="w-full max-w-5xl p-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="p-3 rounded-full bg-indigo-600 shadow-lg">
            <MegaphoneIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-800 drop-shadow">
            Announcements
          </h2>
        </div>

        {loading ? (
          <p className="text-center text-indigo-600 text-lg animate-pulse">
            Loading…
          </p>
        ) : announcements.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            🚫 No announcements yet.
          </p>
        ) : (
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
            {announcements.map((a) => (
                <div
                    key={a.id}
                    className="relative p-6 rounded-2xl shadow-md bg-white border border-gray-100 hover:shadow-2xl transition transform hover:-translate-y-1"
                >
                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    📢 {a.title || "Untitled"}
                    </h3>

                    {/* Message */}
                    <p className="text-gray-700 leading-relaxed mb-4">
                    {a.message}
                    </p>

                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between text-sm text-gray-500">
                    <span className="font-medium text-indigo-600">
                        👨‍🏫 {a.professorName || "Unknown Professor"}
                    </span>
                    <span>
                        {a.createdAt?._seconds
                        ? new Date(a.createdAt._seconds * 1000).toLocaleString()
                        : ""}
                    </span>
                    </div>

                    {/* Batch Tag */}
                    <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 shadow-sm">
                        {a.batch === "All" ? "ALL" : `Batch ${a.batch}`}
                    </span>
                    </div>
                </div>
                ))}

          </div>
        )}
      </div>
    </div>
  );
}




