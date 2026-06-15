// src/components/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { magic } from "../../magic";
import ConnectWallet from "./ConnectWallet";
import UploadFile from "./uploadfile";
import {
  UserIcon,
  CalendarIcon,
  AcademicCapIcon,
  HomeIcon,
  IdentificationIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import {
  BookOpenIcon,
  PaintBrushIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";
import StudentNFTs from "./StudentNFTs";
import SendNFT from "./SendNFT";
import NFTDetails from "./NFTDetails";
import MyAssignments from "./MyAssignments";
import Announcements from "./Announcements";
import ChatScreen from "./ChatSection";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedNFT, setSelectedNFT] = useState(null);
  const [sendNFTData, setSendNFTData] = useState(null);

  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const didToken = await magic.user.getIdToken();
        const res = await fetch(
          "https://us-central1-owais-43.cloudfunctions.net/api/getStudentProfile",
          { method: "GET", headers: { Authorization: `Bearer ${didToken}` } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile.");
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError("Could not load profile.");
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await magic.user.logout();
    window.location.href = "/login";
  };

  const profileItem = (label, value, Icon) => (
    <div className="flex items-center space-x-3 p-3 rounded-xl 
                    bg-white/10 backdrop-blur-xl border border-white/20 
                    shadow-md hover:shadow-xl hover:scale-[1.02] 
                    transition-all duration-300">
      {Icon && <Icon className="w-5 h-5 text-purple-400" />}
      <p className="text-gray-200 font-medium">
        <span className="font-semibold text-white">{label}:</span> {value}
      </p>
    </div>
  );

  const toggleSection = (section) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white overflow-hidden">

      {/* ✅ NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-4 
                      bg-white/10 backdrop-blur-xl border-b border-white/20 
                      shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 
                       rounded-lg shadow-md text-white font-medium 
                       hover:scale-105 transition"
          >
            {sidebarOpen ? "Close Profile" : "Open Profile"}
          </button>
          <h1 className="text-lg md:text-xl font-bold tracking-wide bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
        </div>

        {/* ✅ Navbar Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleSection("announcements")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition 
              ${activeSection === "announcements"
                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg"
                : "bg-white/10 hover:bg-white/20 border border-yellow-400/40"}`}
          >
            <BellIcon className="w-5 h-5" /> Announcements
          </button>

          <button
            onClick={() => toggleSection("chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition 
              ${activeSection === "chat"
                ? "bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg"
                : "bg-white/10 hover:bg-white/20 border border-teal-400/40"}`}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" /> Chat
          </button>

          <button
            onClick={() => toggleSection("nfts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition 
              ${activeSection === "nfts"
                ? "bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg"
                : "bg-white/10 hover:bg-white/20 border border-pink-400/40"}`}
          >
            <SparklesIcon className="w-5 h-5" /> My NFTs
          </button>

          <button
            onClick={() => toggleSection("assignments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition 
              ${activeSection === "assignments"
                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg"
                : "bg-white/10 hover:bg-white/20 border border-indigo-400/40"}`}
          >
            <BookOpenIcon className="w-5 h-5" /> My Assignments
          </button>

          <button
            onClick={() => toggleSection("createNFT")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition 
              ${activeSection === "createNFT"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg"
                : "bg-white/10 hover:bg-white/20 border border-green-400/40"}`}
          >
            <PaintBrushIcon className="w-5 h-5" /> Create NFT
          </button>

          <div className="p-1 bg-white/20 backdrop-blur-lg rounded-full shadow-md border border-white/30 hover:scale-110 transition">
            <div className="scale-90">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ Welcome */}
      <div className="flex justify-center mt-6">
        <div className="bg-white/10 backdrop-blur-xl px-10 py-4 rounded-xl shadow-lg border border-white/20 text-center">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome, {profile?.name || "Student"} 🎓
          </h1>
        </div>
      </div>

      {/* ✅ Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-80 h-full 
          bg-gradient-to-b from-purple-900/90 to-indigo-900/80 
          backdrop-blur-2xl shadow-2xl p-8 flex flex-col justify-between 
          border-r border-white/20 transform transition-transform duration-300 z-40
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          <h2 className="text-2xl font-extrabold mb-8 text-purple-300 drop-shadow-lg tracking-wide">
            Student Profile
          </h2>
          {error && (
            <p className="text-red-400 mb-4 bg-red-900/30 p-3 rounded-lg shadow-md">
              {error}
            </p>
          )}
          {profile ? (
            <div className="grid grid-cols-1 gap-4">
              {profileItem("Name", profile.name, UserIcon)}
              {profileItem("Parentage", profile.parentage)}
              {profileItem("Address", profile.address, HomeIcon)}
              {profileItem("Semester", profile.semester, AcademicCapIcon)}
              {profileItem("Batch", profile.batch)}
              {profileItem("Roll No", profile.rollNo, IdentificationIcon)}
              {profileItem("DOB", profile.dob, CalendarIcon)}
              {profileItem("Department", profile.department)}
            </div>
          ) : (
            !error && <p className="text-gray-300 animate-pulse">Loading profile...</p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button className="w-full py-3 rounded-xl 
                             bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                             font-semibold shadow-lg hover:scale-105 transition">
            ✏️ Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-xl 
                       bg-gradient-to-r from-red-500 via-pink-500 to-orange-400 
                       font-semibold shadow-lg hover:scale-105 transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ✅ Section Rendering */}
      <div className="p-6">
        {activeSection === "announcements" && (
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20">
            <Announcements />
          </div>
        )}

        {activeSection === "chat" && (
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 min-h-[70vh]">
            <ChatScreen profile={profile} />
          </div>
        )}

        {activeSection === "nfts" && (
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20">
            <StudentNFTs />
          </div>
        )}

        {activeSection === "assignments" && (
          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20">
            <MyAssignments />
          </div>
        )}

        {activeSection === "createNFT" && (
          <div className="relative flex justify-center items-center min-h-[60vh]">
            <div
              className="w-full max-w-2xl p-8 rounded-2xl 
                         bg-gradient-to-br from-purple-900 via-indigo-900 to-black 
                         border border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.7)] 
                         backdrop-blur-xl transition-all duration-500 
                         hover:shadow-[0_0_50px_rgba(139,92,246,0.9)]"
            >
              <h2 className="text-2xl font-extrabold text-center mb-6 
                             bg-gradient-to-r from-purple-400 to-pink-400 
                             bg-clip-text text-transparent">
                🚀 Create Your NFT
              </h2>
              <UploadFile />
            </div>
          </div>
        )}
      </div>

      {/* ✅ NFT Modals */}
      {selectedNFT && <NFTDetails nft={selectedNFT} onClose={() => setSelectedNFT(null)} />}
      {sendNFTData && <SendNFT nft={sendNFTData} onClose={() => setSendNFTData(null)} />}
    </div>
  );
}









