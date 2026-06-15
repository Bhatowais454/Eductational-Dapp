// This is my Student CreateProfile.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { magic } from '../../magic';

export default function CreateProfile() {
  const [name, setName] = useState('');
  const [parentage, setParentage] = useState('');
  const [address, setAddress] = useState('');
  const [semester, setSemester] = useState('');
  const [batch, setBatch] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [dob, setDob] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    setError('');

    try {
      const didToken = await magic.user.getIdToken();

      const res = await fetch(
        'https://us-central1-owais-43.cloudfunctions.net/api/createStudentProfile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${didToken}`,
          },
          body: JSON.stringify({
            name,
            parentage,
            address,
            semester,
            batch,
            rollNo,
            dob,
            department,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Something went wrong.');
        return;
      }

      navigate('/student');
    } catch (err) {
      console.error(err);
      setError('Failed to create profile.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-800 via-purple-600 to-pink-500 relative overflow-hidden p-6">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1),transparent)]"></div>

      {/* Header */}
      <div className="text-center mb-8 z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow">University of Kashmir</h1>
        <p className="text-lg md:text-xl text-white/80 mt-2 drop-shadow">Blockchain-Based Ledger for Students</p>
      </div>

      {/* Glass card form */}
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-8 w-full max-w-sm relative z-10">
        <h2 className="text-2xl font-bold text-white mb-6 text-center drop-shadow">Create Your Profile</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/40 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          />
          <input
            type="text"
            placeholder="Parentage"
            value={parentage}
            onChange={e => setParentage(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/40 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/40 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          />
          <input
            type="text"
            placeholder="Semester"
            value={semester}
            onChange={e => setSemester(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/40 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          />
          <input
            type="text"
            placeholder="Batch"
            value={batch}
            onChange={e => setBatch(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/40 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          />
          <input
            type="text"
            placeholder="Roll No"
            value={rollNo}
            onChange={e => setRollNo(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/40 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={dob}
            onChange={e => setDob(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/40 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          />
          <input
            type="text"
            placeholder="Department"
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/40 border border-white/30 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          />

          {error && (
            <p className="text-red-200 font-medium text-sm">{error}</p>
          )}

          <button
            onClick={handleCreate}
            className="w-full py-3 bg-white/30 text-white font-bold rounded-lg shadow hover:bg-white/50 backdrop-blur transition"
          >
            ✨ Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
