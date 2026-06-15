// src/components/MyAssignments.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { BookOpenIcon } from "@heroicons/react/24/solid"; // modern icon

export default function MyAssignments() {
  const [user, setUser] = useState(null);
  const [batch, setBatch] = useState(null);
  const [personalAssignments, setPersonalAssignments] = useState([]);
  const [batchAssignments, setBatchAssignments] = useState([]);
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
      setPersonalAssignments([]);
      setBatchAssignments([]);
      setLoading(false);
      return;
    }

    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const studRef = collection(db, "assignments", "student_" + user.uid, "files");
        const studQ = query(studRef, orderBy("uploadedAt", "desc"));
        const studSnap = await getDocs(studQ);
        setPersonalAssignments(studSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        if (batch) {
          const batchRef = collection(db, "assignments", "batch_" + batch, "files");
          const batchQ = query(batchRef, orderBy("uploadedAt", "desc"));
          const batchSnap = await getDocs(batchQ);
          setBatchAssignments(batchSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user, batch]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4 text-indigo-700 flex items-center justify-center gap-3">
            <BookOpenIcon className="w-8 h-8 text-indigo-600" />
            My Assignments
          </h2>
          <p className="text-gray-600">Please log in to see your assignments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl p-6">
        {/* Modern Header */}
        <h2 className="text-4xl font-bold text-center text-indigo-700 mb-12 flex items-center justify-center gap-4">
          <BookOpenIcon className="w-10 h-10 text-indigo-600 drop-shadow" />
          My Assignments
        </h2>

        {loading ? (
          <p className="text-center text-indigo-600">Loading assignments...</p>
        ) : (
          <>
            {/* --- Personal Assignments --- */}
            <section className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                🎓 Personal Assignments
              </h3>
              {personalAssignments.length === 0 ? (
                <p className="text-gray-500 text-center">No personal assignments yet.</p>
              ) : (
                <div className="max-h-96 overflow-y-auto pr-2">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {personalAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="p-6 rounded-2xl shadow-md bg-white hover:shadow-xl transition transform hover:-translate-y-1"
                      >
                        <div className="font-semibold text-lg text-gray-900 mb-2">
                          {a.title || "Untitled Assignment"}
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          {a.uploadedAt?.toDate?.().toLocaleString() || "Just now"}
                        </p>
                        <div className="flex gap-2">
                          <a
                            href={a.fileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            👁 View
                          </a>
                          <a
                            href={a.fileURL}
                            download
                            className="flex-1 text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            📥 Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* --- Batch Assignments --- */}
            <section>
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                🏫 Batch Assignments {batch ? `(Batch ${batch})` : ""}
              </h3>
              {batchAssignments.length === 0 ? (
                <p className="text-gray-500 text-center">No batch assignments yet.</p>
              ) : (
                <div className="max-h-96 overflow-y-auto pr-2">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {batchAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="p-6 rounded-2xl shadow-md bg-white hover:shadow-xl transition transform hover:-translate-y-1"
                      >
                        <div className="font-semibold text-lg text-gray-900 mb-2">
                          {a.title || "Untitled Assignment"}
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          {a.uploadedAt?.toDate?.().toLocaleString() || "Just now"}
                        </p>
                        <div className="flex gap-2">
                          <a
                            href={a.fileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            👁 View
                          </a>
                          <a
                            href={a.fileURL}
                            download
                            className="flex-1 text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            📥 Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
