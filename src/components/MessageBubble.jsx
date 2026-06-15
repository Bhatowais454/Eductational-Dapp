// src/components/MessageBubble.jsx
import React, { useState, useRef, useEffect } from "react";
import { Trash2, Pencil, Info } from "lucide-react";

const MessageBubble = ({
  msg,
  onDeleteForMe,
  onDeleteForEveryone,
  onEdit,
  currentUser,
}) => {
  const isOwnMessage = msg.sender === currentUser?.email;
  const [showOptions, setShowOptions] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef(null);

  const handleClick = (e) => {
    e.stopPropagation();
    setShowOptions((prev) => !prev);
    setShowInfo(false);
  };

  // ===== Normalize seenBy array =====
  const normalizedSeen = (msg.seenList || []).map((u) => ({
    name: u.name || "(unknown)",
    time: u.time || null,
  }));

  // Deduplicate seen list by name, pick latest time
  const seenMap = {};
  normalizedSeen.forEach((u) => {
    const key = u.name;
    if (!seenMap[key] || (u.time && new Date(u.time) > new Date(seenMap[key].time))) {
      seenMap[key] = u;
    }
  });
  const uniqueSeenList = Object.values(seenMap);

  // ===== Normalize delivered but not seen array =====
  const deliveredNotSeen = (msg.deliveredList || []).map((u) => ({
    name: u.name || "(unknown)",
    time: u.time || null,
  }));

  // Auto scroll info box to top when opened
  useEffect(() => {
    if (showInfo && infoRef.current) {
      infoRef.current.scrollTop = 0;
    }
  }, [showInfo]);

  return (
    <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"} relative`}>
      {!isOwnMessage && (
        <span className="text-xs text-gray-400 mb-1 ml-2">
          {msg.senderName} · {msg.batch}
        </span>
      )}

      <div
        onClick={handleClick}
        className={`relative max-w-[70%] p-3 rounded-2xl shadow-md cursor-pointer transition ${
          msg.deleted
            ? "bg-gray-800/60 text-gray-400 italic"
            : isOwnMessage
            ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white"
            : "bg-gradient-to-r from-slate-800 via-gray-800 to-gray-900 text-gray-100"
        }`}
      >
        {msg.deleted ? (
          <p className="text-sm">
            {isOwnMessage
              ? "You deleted this message"
              : `${msg.senderName} deleted this message`}
          </p>
        ) : (
          <>
            {msg.type === "text" && <p className="whitespace-pre-wrap">{msg.message}</p>}
            {msg.type === "image" && (
              <img
                src={msg.message}
                alt="chat-img"
                className="rounded-lg mt-2 max-h-40 object-cover"
              />
            )}
          </>
        )}
      </div>

      {showOptions && !msg.deleted && (
        <div
          className={`absolute top-full mt-2 ${
            isOwnMessage ? "right-0" : "left-0"
          } bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10 flex flex-col gap-1 px-3 py-2`}
        >
          <button
            onClick={() => {
              setShowOptions(false);
              setShowInfo((prev) => !prev);
            }}
            className="hover:text-blue-400 flex items-center gap-2 whitespace-nowrap"
          >
            <Info size={14} /> Info
          </button>

          {isOwnMessage && onEdit && (
            <button
              onClick={() => {
                setShowOptions(false);
                onEdit(msg);
              }}
              className="hover:text-indigo-400 flex items-center gap-2 whitespace-nowrap"
            >
              <Pencil size={14} /> Edit
            </button>
          )}

          <button
            onClick={() => {
              setShowOptions(false);
              onDeleteForMe && onDeleteForMe(msg.id);
            }}
            className="hover:text-yellow-400 flex items-center gap-2 whitespace-nowrap"
          >
            <Trash2 size={14} /> Delete for me
          </button>

          {isOwnMessage && (
            <button
              onClick={() => {
                setShowOptions(false);
                onDeleteForEveryone && onDeleteForEveryone(msg.id);
              }}
              className="hover:text-red-400 flex items-center gap-2 whitespace-nowrap"
            >
              <Trash2 size={14} /> Delete for everyone
            </button>
          )}
        </div>
      )}

      {showInfo && (
        <div
          ref={infoRef}
          className="absolute top-full mt-2 w-64 max-h-44 overflow-y-auto bg-gray-800 text-white text-sm rounded-lg shadow-lg z-20 p-3"
        >
          <p className="font-semibold text-green-400 mb-1">✅ Seen by:</p>
          {uniqueSeenList.length > 0 ? (
            <ul className="list-disc list-inside mb-2">
              {uniqueSeenList.map((u, idx) => (
                <li key={`seen-${idx}`}>
                  {u.name}{" "}
                  {u.time && (
                    <span className="text-gray-400 text-xs">
                      ({new Date(u.time).toLocaleString()})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mb-2">No one has seen yet</p>
          )}

          <p className="font-semibold text-yellow-400 mb-1">📩 Delivered but not seen:</p>
          {deliveredNotSeen.length > 0 ? (
            <ul className="list-disc list-inside">
              {deliveredNotSeen.map((u, idx) => (
                <li key={`delivered-${idx}`}>
                  {u.name} {u.time && <span className="text-gray-400 text-xs">({new Date(u.time).toLocaleString()})</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">Everyone has seen</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;













