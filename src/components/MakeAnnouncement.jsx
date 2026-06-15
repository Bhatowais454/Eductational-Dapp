import React, { useState, useEffect } from "react";
import { magic } from "../../magic";
import { MegaphoneIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

// API endpoints from .env
const MAKE_API_URL =
  import.meta.env.VITE_MAKE_ANNOUNCEMENT_API_URL ||
  "https://us-central1-owais-43.cloudfunctions.net/api/makeAnnouncement";

const BATCH_RANGE_URL =
  import.meta.env.VITE_BATCH_RANGE_API_URL ||
  "https://us-central1-owais-43.cloudfunctions.net/api/batchRange";

export default function MakeAnnouncement() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [batch, setBatch] = useState("");
  const [batches, setBatches] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  // Fetch batch options on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(BATCH_RANGE_URL);
        if (!res.ok) throw new Error("Failed to fetch batches");
        const data = await res.json();
        setBatches(data);
      } catch (err) {
        console.error("Batch fetch error:", err);
      }
    };
    fetchBatches();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || !batch) {
      setStatus("⚠️ Please fill out all fields including batch.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const didToken = await magic.user.getIdToken();

      const res = await fetch(MAKE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + didToken,
        },
        body: JSON.stringify({
          title,
          message,
          batch,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed (${res.status}): ${txt || "Unknown error"}`);
      }

      setStatus("✅ Announcement posted successfully!");
      setTitle("");
      setMessage("");
      setBatch("");
    } catch (err) {
      console.error(err);
      setStatus("❌ " + (err.message || "Failed to post announcement"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 rounded-2xl bg-gradient-to-r from-indigo-900/70 to-purple-900/70 border border-white/20 shadow-2xl backdrop-blur-lg">
      <div className="flex items-center gap-2 mb-6">
        <MegaphoneIcon className="w-7 h-7 text-indigo-300" />
        <h2 className="text-2xl font-bold text-white">Make Announcement</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Batch Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Batch
          </label>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            disabled={submitting}
            className="w-full rounded-lg px-3 py-2 bg-white/10 text-white border border-white/20 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
            <option value="" className="bg-gray-800 text-white">
                Select Batch
            </option>

            {/* ✅ All batches option */}
            <option value="All" className="bg-gray-800 text-white">
                All Batches
            </option>

            {batches.map((b) => (
                <option key={b} value={b} className="bg-gray-800 text-white">
                {b}
                </option>
            ))}
            </select>

        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg px-3 py-2 bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter announcement title"
            disabled={submitting}
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-lg px-3 py-2 bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Write your announcement message..."
            disabled={submitting}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg transition transform hover:scale-[1.02] disabled:opacity-50"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
          {submitting ? "Posting..." : "Post Announcement"}
        </button>
      </form>

      {status && (
        <p className="mt-4 text-sm text-gray-200 text-center">{status}</p>
      )}
    </div>
  );
}

