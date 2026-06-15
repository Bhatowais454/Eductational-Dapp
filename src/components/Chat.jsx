// src/components/Chat.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { Upload, Send } from "lucide-react";
import MessageBubble from "./MessageBubble";

const Chat = ({ batch }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const [myName, setMyName] = useState("");
  const messagesEndRef = useRef(null);

  // 🔹 Track auth user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 🔹 Resolve display name
  useEffect(() => {
    const loadName = async () => {
      if (!user?.email) return;
      let name = user.displayName || "";
      if (!name) {
        try {
          const snap = await getDoc(doc(db, "users", user.email));
          if (snap.exists()) {
            name = snap.data()?.name || "";
          }
        } catch (e) {
          console.error("Name lookup failed:", e);
        }
      }
      setMyName(name || user.email.split("@")[0]);
    };
    loadName();
  }, [user]);

  // 🔹 Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Real-time listener
  useEffect(() => {
    if (!batch) return;
    const qy = query(
      collection(db, "chats"),
      where("batch", "==", batch),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(qy, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [batch]);

  // 🔹 Send message
  const sendMessage = async () => {
    if (!user?.email) return;
    if (!input.trim() && !image) return;

    await addDoc(collection(db, "chats"), {
      message: image || input, // ✅ always saved in "message"
      type: image ? "image" : "text",
      sender: user.email,
      senderName: myName || user.displayName || user.email.split("@")[0],
      batch: batch || "ALL",
      createdAt: serverTimestamp(),
      seenBy: [],
    });

    setInput("");
    setImage(null);
  };

  // 🔹 Delete message
  const deleteMessage = async (id) => {
    await deleteDoc(doc(db, "chats", id));
  };

  // 🔹 Mark message as seen
  useEffect(() => {
    const run = async () => {
      if (!user?.email) return;
      const updates = messages.filter(
        (m) => m.sender !== user.email && !(m.seenBy || []).includes(user.email)
      );
      for (const msg of updates) {
        try {
          await updateDoc(doc(db, "chats", msg.id), {
            seenBy: [...(msg.seenBy || []), user.email],
          });
        } catch (e) {
          console.error("Seen update failed:", e);
        }
      }
    };
    run();
  }, [messages, user]);

  return (
    <div className="flex flex-col h-[80vh] w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 font-semibold text-lg flex items-center justify-between shadow-md">
        <span className="truncate">Batch {batch || "ALL"} Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender === user?.email;
          const nameToShow =
            msg.senderName ||
            (msg.sender ? msg.sender.split("@")[0] : "Unknown");

          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                {/* Show name above if not mine */}
                {!isMine && (
                  <div className="text-xs font-semibold text-gray-600 ml-1 mb-1">
                    {nameToShow}
                  </div>
                )}

                <MessageBubble msg={msg} onDelete={deleteMessage} />
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 p-3 bg-white border-t shadow-inner">
        <label className="cursor-pointer">
          <Upload className="w-6 h-6 text-gray-500 hover:text-green-500" />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setImage(URL.createObjectURL(file));
            }}
            className="hidden"
          />
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-xl border focus:ring-2 focus:ring-green-400 focus:outline-none text-sm"
        />
        <button
          onClick={sendMessage}
          className="bg-green-600 text-white p-3 rounded-full shadow hover:bg-green-700 transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Chat;


