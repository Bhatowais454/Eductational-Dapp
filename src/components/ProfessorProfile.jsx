import React, { useEffect, useState } from "react";
import { magic } from "../../magic";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { ClipboardIcon } from "@heroicons/react/24/outline";

export default function ProfessorProfile() {
  const [professor, setProfessor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false); // ✅ edit mode
  const [formData, setFormData] = useState({ name: "", department: "", phone: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        const loggedIn = await magic.user.isLoggedIn();
        if (!loggedIn) {
          setLoading(false);
          return;
        }

        const metadata = await magic.user.getInfo();
        if (!metadata?.email) {
          setLoading(false);
          return;
        }

        const safeEmail = metadata.email.replace(/[.#$[\]/]/g, "_");

        const profRef = doc(db, "professors", safeEmail);
        const profSnap = await getDoc(profRef);

        if (profSnap.exists()) {
          setProfessor(profSnap.data());
          setFormData({
            name: profSnap.data().name || "",
            department: profSnap.data().department || "",
            phone: profSnap.data().phone || "",
          });
        } else {
          setProfessor(null);
        }
      } catch (err) {
        console.error("Error fetching professor profile:", err);
        setProfessor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessor();
  }, []);

  const handleLogout = async () => {
    await magic.user.logout();
    navigate("/login");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    try {
      const metadata = await magic.user.getInfo();
      const safeEmail = metadata.email.replace(/[.#$[\]/]/g, "_");

      const profRef = doc(db, "professors", safeEmail);
      await updateDoc(profRef, {
        name: formData.name,
        department: formData.department,
        phone: formData.phone,
      });

      setProfessor((prev) => ({
        ...prev,
        name: formData.name,
        department: formData.department,
        phone: formData.phone,
      }));
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (loading) return <p className="text-white">Loading profile...</p>;

  if (!professor) {
    return (
      <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Professor Not Found</h2>
        <p className="text-gray-600 mb-4">
          Make sure you created your profile with the correct email and secret code.
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="relative bg-white text-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full">
      <h2 className="text-3xl font-bold mb-6 text-center">👨‍🏫 Professor Profile</h2>

      {!editing ? (
        <div className="space-y-3">
          <p><b>Name:</b> {professor.name}</p>
          <p><b>Email:</b> {professor.email}</p>
          <p><b>Department:</b> {professor.department}</p>
          <p><b>Phone:</b> {professor.phone}</p>
          <p><b>Unique Code:</b> {professor.uniqueCode}</p>

          {professor.wallet && (
            <div className="flex items-center space-x-2">
              <p className="flex-1 break-all">
                <b>Wallet Address:</b> {professor.wallet}
              </p>
              <ClipboardIcon
                className="h-5 w-5 text-gray-600 cursor-pointer hover:text-purple-600"
                onClick={() => copyToClipboard(professor.wallet)}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Name"
          />
          <input
            type="text"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Department"
          />
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Phone"
          />
          <button
            onClick={handleSave}
            className="w-full py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
          >
            Save
          </button>
        </div>
      )}

      {copied && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-lg shadow-md text-sm">
          Copied!
        </div>
      )}

      {/* ✅ Buttons row */}
      <div className="mt-6 flex justify-between space-x-3">
        <button
          onClick={handleLogout}
          className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md text-sm"
        >
          Logout
        </button>
        <button
          onClick={() => setEditing(!editing)}
          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md text-sm"
        >
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
}




