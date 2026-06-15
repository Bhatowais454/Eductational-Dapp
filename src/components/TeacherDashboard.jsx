// src/pages/TeacherDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Upload,
  User,
  Image as ImageIcon,
  Wallet,
  FileText,
  PlusCircle,
  Bell,
  Megaphone,
} from "lucide-react";
import BStudent from "./BStudents"; 
import UploadAssignmentsModal from "./UploadAssignmentsModal"; 
import ProfessorProfile from "./ProfessorProfile"; 
import MakeAnnouncement from "./MakeAnnouncement"; 
import UploadFile from "./uploadfile"; 
import Web3AuthWallet from "./Web3AuthWallet";
import { magic } from "../../magic"; // your existing Magic instance

export default function TeacherDashboard() {
  const [active, setActive] = useState("Student Details");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [professorEmail, setProfessorEmail] = useState(null);

  useEffect(() => {
    // Get email of logged-in professor from Magic
    const fetchEmail = async () => {
      const userMetadata = await magic.user.getMetadata();
      setProfessorEmail(userMetadata.email);
    };
    fetchEmail();
  }, []);

  const menuItems = [
    { name: "Student Details", icon: <User size={20} /> },
    { name: "Make Announcement", icon: <Megaphone size={20} /> },
    { name: "Upload Assignments", icon: <Upload size={20} /> },
    { name: "Profile", icon: <BookOpen size={20} /> },
    { name: "Create NFTs", icon: <ImageIcon size={20} /> },
    { name: "Wallet", icon: <Wallet size={20} /> },
    { name: "Study Material", icon: <FileText size={20} /> },
    { name: "Add Class", icon: <PlusCircle size={20} /> },
    { name: "Notifications", icon: <Bell size={20} /> },
  ];

  const handleMenuClick = (itemName) => {
    if (itemName === "Upload Assignments") {
      setActive(itemName);              
      setShowUploadModal(true);         
    } else {
      setActive(itemName);
      setShowUploadModal(false);        
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-black bg-opacity-30 backdrop-blur-lg shadow-lg">
        <h1 className="text-2xl font-bold tracking-wide">🎓 Teacher Dashboard</h1>
        <div className="flex space-x-6">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleMenuClick(item.name)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                active === item.name
                  ? "bg-white text-indigo-700 shadow-lg"
                  : "hover:bg-white hover:bg-opacity-20"
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 p-10 flex items-center justify-center">
        {active === "Wallet" ? (
          <>
            {professorEmail ? (
              <Web3AuthWallet email={professorEmail} />
            ) : (
              <p>Loading Wallet...</p>
            )}
          </>
        ) : active === "Student Details" ? (
          <BStudent />
        ) : active === "Make Announcement" ? (
          <MakeAnnouncement />
        ) : active === "Upload Assignments" ? (
          <div className="text-center text-lg">📂 Use the popup to upload assignments</div>
        ) : active === "Profile" ? (
          <ProfessorProfile />
        ) : active === "Create NFTs" ? (
          <UploadFile />
        ) : (
          <div className="bg-white text-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl p-10 text-center">
            <h2 className="text-3xl font-bold mb-4">{active}</h2>
            <p className="text-gray-600">
              🚧 Content for <b>{active}</b> will be implemented in the second file.
            </p>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadAssignmentsModal 
          open={showUploadModal}              
          onClose={() => setShowUploadModal(false)} 
        />
      )}
    </div>
  );
}






