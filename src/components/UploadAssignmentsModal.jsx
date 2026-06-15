// src/components/UploadAssignmentsModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  collection, query, where, getDocs, addDoc, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

export default function UploadAssignmentsModal({ open, onClose }) {
  const [tab, setTab] = useState("batch"); // "batch" | "students"
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  // student search
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // -------- Helpers ----------
  const isFourDigitYear = (t) => /^\d{4}$/.test(t);
  const isNumeric = (t) => /^\d+$/.test(t);
  const normalizeNumber = (v) => {
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? "" : String(n); // "001" -> "1"
  };
  const rollVariants = (val) => {
    const base = normalizeNumber(val);
    if (!base) return [];
    const MAX_ZEROES = 8;
    const out = [];
    for (let z = 0; z <= MAX_ZEROES; z++) out.push("0".repeat(z) + base);
    return out;
  };

  const allowedTypes = useMemo(
    () => [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ],
    []
  );

  // -------- Load batches (distinct from users) ----------
  useEffect(() => {
    if (!open) return;
    (async () => {
      // Simple: fetch and dedupe client-side. If large, paginate later.
      const snap = await getDocs(collection(db, "users"));
      const set = new Set();
      snap.docs.forEach((d) => {
        const b = d.data()?.batch;
        if (b) set.add(String(b));
      });
      const list = Array.from(set).sort(); // e.g., ["2020","2021","2022"]
      setBatches(list);
    })();
  }, [open]);

  // -------- Search students like BStudent (case-insensitive name, roll zero-insensitive, across all batches) ----------
  const handleSearchStudents = async () => {
    const term = (searchTerm || "").trim();
    if (!term) return;

    try {
      let data = [];
      if (isFourDigitYear(term)) {
        const q = query(collection(db, "users"), where("batch", "==", term));
        const snap = await getDocs(q);
        data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } else if (isNumeric(term)) {
        const variants = rollVariants(term);
        let docs = [];
        if (variants.length > 0) {
          // <= 10 values fits single 'in' query
          const q = query(collection(db, "users"), where("rollNo", "in", variants));
          const snap = await getDocs(q);
          docs = snap.docs;
        }
        data = docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } else {
        const termUpper = term.toUpperCase(); // names stored in CAPITALS in your DB
        const usersRef = collection(db, "users");
        const nameQ = query(
          usersRef,
          where("name", ">=", termUpper),
          where("name", "<=", termUpper + "\uf8ff")
        );
        const nameSnap = await getDocs(nameQ);
        data = nameSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }
      setStudents(data);
    } catch (e) {
      console.error(e);
      setStudents([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // -------- Upload helpers ----------
  const uploadOneFile = async (file, path) => {
    const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return { url, name: file.name, type: file.type || "application/octet-stream" };
  };

  const sendToBatch = async () => {
    if (!selectedBatch) return setMsg("Please select a batch.");
    if (!files.length) return setMsg("Please choose at least one file.");

    setSending(true); setMsg("");
    try {
      for (const file of files) {
        if (allowedTypes.length && !allowedTypes.includes(file.type)) {
          // optional: skip invalid types
        }
        const { url, name, type } = await uploadOneFile(
          file,
          `assignments/batch/${selectedBatch}`
        );

        // ✅ FIXED PATH
        await addDoc(
          collection(db, "assignments", "batch_" + selectedBatch, "files"),
          {
            title: name,
            fileURL: url,
            type,
            uploadedAt: serverTimestamp(),
            batch: selectedBatch,
          }
        );
      }
      setMsg("✅ Sent to batch!");
      setFiles([]);
    } catch (e) {
      console.error(e);
      setMsg("❌ Failed to send to batch.");
    } finally {
      setSending(false);
    }
  };

  const sendToStudents = async () => {
    if (!selectedIds.size) return setMsg("Please select at least one student.");
    if (!files.length) return setMsg("Please choose at least one file.");

    setSending(true); setMsg("");
    try {
      // Upload each file once, then create one metadata doc per student
      const uploaded = [];
      for (const file of files) {
        const { url, name, type } = await uploadOneFile(
          file,
          `assignments/students/_shared`
        );
        uploaded.push({ url, name, type });
      }

      const targets = Array.from(selectedIds);
      for (const studentId of targets) {
        for (const up of uploaded) {
          // ✅ FIXED PATH
          await addDoc(
            collection(db, "assignments", "student_" + studentId, "files"),
            {
              title: up.name,
              fileURL: up.url,
              type: up.type,
              uploadedAt: serverTimestamp(),
              studentId,
            }
          );
        }
      }
      setMsg("✅ Sent to selected student(s)!");
      setFiles([]);
      setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
      setMsg("❌ Failed to send to student(s).");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* modal */}
      <div className="relative bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">Upload Assignments</h2>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200">
            Close
          </button>
        </div>

        {/* tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("batch")}
            className={`px-4 py-2 rounded-xl ${tab === "batch" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
          >
            Send to Batch
          </button>
          <button
            onClick={() => setTab("students")}
            className={`px-4 py-2 rounded-xl ${tab === "students" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
          >
            Send to Student(s)
          </button>
        </div>

        {tab === "batch" ? (
          <>
            {/* batch dropdown */}
            <div className="mb-4">
              <label className="block font-medium mb-2">Select Batch</label>
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {batches.length === 0 && (
                  <div className="px-4 py-3 text-gray-500">No batches found.</div>
                )}
                {batches.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBatch(b)}
                    className={`w-full text-left px-4 py-2 hover:bg-indigo-50 ${selectedBatch === b ? "bg-indigo-100 font-semibold" : ""}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              {selectedBatch && (
                <p className="mt-2 text-sm text-indigo-700">Selected: {selectedBatch}</p>
              )}
            </div>

            {/* file input */}
            <div className="mb-4">
              <label className="block font-medium mb-2">Files</label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              disabled={sending}
              onClick={sendToBatch}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send to Batch"}
            </button>
          </>
        ) : (
          <>
            {/* search students */}
            <div className="mb-4">
              <label className="block font-medium mb-2">Search (Batch / Name / Roll No.)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., 2022 or Owais or 001"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleSearchStudents}
                  className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Search
                </button>
              </div>
            </div>

            {/* results */}
            <div className="grid gap-4 md:grid-cols-2 max-h-60 overflow-y-auto mb-4">
              {students.map((s) => {
                const selected = selectedIds.has(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSelect(s.id)}
                    className={`text-left p-4 rounded-xl border shadow-sm hover:shadow-md transition ${
                      selected ? "bg-indigo-50 border-indigo-300" : "bg-white"
                    }`}
                  >
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-sm text-gray-600">Roll: {s.rollNo}</div>
                    <div className="text-sm text-gray-600">Batch: {s.batch}</div>
                  </button>
                );
              })}
              {students.length === 0 && (
                <div className="text-gray-500">No students yet. Search to load.</div>
              )}
            </div>

            {/* file input */}
            <div className="mb-4">
              <label className="block font-medium mb-2">Files</label>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              disabled={sending}
              onClick={sendToStudents}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send to Selected"}
            </button>
          </>
        )}

        {msg && <p className="mt-4 text-center text-indigo-700 font-medium">{msg}</p>}
      </div>
    </div>
  );
}
