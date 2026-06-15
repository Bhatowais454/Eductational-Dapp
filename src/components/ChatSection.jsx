// src/components/ChatSection.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import MessageBubble from "./MessageBubble";
import { magic } from "../../magic";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const API_URL = import.meta.env.VITE_API_URL;

export default function ChatSection({ profile }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userBatch, setUserBatch] = useState(null);
  const [userName, setUserName] = useState(null);
  const [classmates, setClassmates] = useState([]);
  const chatEndRef = useRef(null);

  const nameByEmail = useMemo(() => {
    const map = {};
    classmates.forEach((u) => {
      if (u?.email) map[u.email.toLowerCase()] = u.name || u.email;
    });
    return map;
  }, [classmates]);

  useEffect(() => {
    const loadStudentProfile = async () => {
      if (!profile?.email) return;
      try {
        const ref = doc(db, "users", profile.email.toLowerCase());
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUserBatch(data.batch || null);
          setUserName(data.name || profile.email);
        }
      } catch (err) {
        console.error("Failed to fetch student profile:", err);
      }
    };
    loadStudentProfile();
  }, [profile]);

  useEffect(() => {
    if (!userBatch) return;

    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.batch === userBatch) {
          docs.push({ id: docSnap.id, ...d });
        }
      });
      setMessages(docs);
      setLoading(false);

      // Update seenBy with timestamp
      docs.forEach(async (msg) => {
        if (
          !msg.deleted &&
          msg.sender !== profile?.email &&
          !(msg.seenBy || []).some((u) =>
            typeof u === "string" ? u === profile?.email : u.email === profile?.email
          )
        ) {
          try {
            const msgRef = doc(db, "messages", msg.id);
            const updatedSeen = [
              ...(msg.seenBy || []),
              {
                email: profile?.email,
                name: userName || profile?.name || profile?.email,
                time: new Date().toISOString(),
              },
            ];
            await updateDoc(msgRef, { seenBy: updatedSeen });
          } catch (err) {
            console.warn("Seen update skipped:", err);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [userBatch, profile]);

  useEffect(() => {
    const loadClassmates = async () => {
      if (!userBatch) return;
      try {
        const res = await fetch(
          `${API_URL}/studentsByBatch/${encodeURIComponent(userBatch)}`
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn("Load classmates failed:", err.message || res.statusText);
          return;
        }
        const list = await res.json();
        setClassmates(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("Load classmates error:", e);
      }
    };
    loadClassmates();
  }, [userBatch]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!userBatch) {
      console.error("Cannot send: user batch unknown yet.");
      return;
    }

    const optimisticMsg = {
      id: `tmp-${Date.now()}`,
      message: newMessage,
      type: "text",
      batch: userBatch,
      sender: (profile?.email || "").toLowerCase(),
      senderName: userName || profile?.name || profile?.email,
      createdAt: new Date().toISOString(),
      seenBy: [{
        email: profile?.email,
        name: userName || profile?.name || profile?.email,
        time: new Date().toISOString() // add timestamp for sender
      }],
      receivedBy: classmates.map((c) => c.email?.toLowerCase()),
    };


    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");

    try {
      const didToken = await magic.user.getIdToken();
      await fetch(`${API_URL}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${didToken}`,
        },
        body: JSON.stringify({
          message: optimisticMsg.message,
          batch: userBatch,
          type: "text",
          seenBy: optimisticMsg.seenBy,
          receivedBy: optimisticMsg.receivedBy,
        }),
      });
    } catch (err) {
      console.error("Send failed:", err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }
  };

  const deleteForMe = (id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const deleteForEveryone = async (id) => {
    try {
      const msgRef = doc(db, "messages", id);
      await updateDoc(msgRef, { deleted: true, message: "" });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, deleted: true, message: "" } : m
        )
      );
    } catch (e) {
      console.error("Delete for everyone failed", e);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] w-full max-w-3xl mx-auto rounded-2xl 
      bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 
      shadow-[0_0_25px_rgba(99,102,241,0.5)] border border-indigo-400/40">

      <div className="px-6 py-3 border-b border-indigo-400/30 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-indigo-200">
          💬 Batch Chat {userBatch ? `- ${userBatch}` : ""}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading chat…</p>
        ) : messages.length > 0 ? (
          messages.map((msg) => {
            const senderEmail = typeof msg.sender === "string" ? msg.sender.toLowerCase() : "";
            const displayName =
              senderEmail === (profile?.email || "").toLowerCase()
                ? userName || profile?.name || senderEmail
                : nameByEmail[senderEmail] || msg.senderName || senderEmail;

            // ===== Updated for name + timestamp only, no emails =====
            const seenList = (msg.seenBy || []).map((u) => {
              const email = typeof u === "string" ? u : u.email;
              const name = typeof u === "string" ? nameByEmail[email?.toLowerCase()] || "(unknown)" : u.name || nameByEmail[email?.toLowerCase()] || "(unknown)";
              const time = u?.time || null;
              return { name, time };
            });

            const deliveredList = (msg.receivedBy || [])
              .filter((u) => {
                const email = typeof u === "string" ? u : u.email;
                return !(msg.seenBy || []).some((s) => {
                  const seenEmail = typeof s === "string" ? s : s.email;
                  return seenEmail === email;
                });
              })
              .map((u) => {
                const email = typeof u === "string" ? u : u.email;
                const name = typeof u === "string" ? nameByEmail[email?.toLowerCase()] || "(unknown)" : u.name || nameByEmail[email?.toLowerCase()] || "(unknown)";
                return { name, time: null };
              });

            const allBatchmates = classmates.map((c) => c.email?.toLowerCase());
            const notDeliveredList = allBatchmates
              .filter(
                (email) =>
                  !(msg.receivedBy || []).some((r) => r?.toLowerCase?.() === email) &&
                  email !== (profile?.email || "").toLowerCase()
              )
              .map((email) => ({ name: nameByEmail[email] || "(unknown)", time: null }));

            const decorated = {
              ...msg,
              senderName: displayName,
              batch: msg.batch || userBatch,
              seenList,
              deliveredList,
              notDeliveredList,
            };

            return (
              <MessageBubble
                key={msg.id}
                msg={decorated}
                currentUser={profile}
                onDeleteForMe={deleteForMe}
                onDeleteForEveryone={deleteForEveryone}
              />
            );
          })
        ) : (
          <p className="text-center text-gray-400">
            No messages yet. Start chatting 🚀
          </p>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-indigo-400/30 flex items-center gap-3 bg-gray-900/40">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-xl bg-gray-800/80 border border-indigo-400/40 
          text-white placeholder-gray-400 focus:outline-none focus:ring-2 
          focus:ring-indigo-400"
        />
        <button
          onClick={sendMessage}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition shadow-md hover:shadow-xl"
        >
          <PaperAirplaneIcon className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}














