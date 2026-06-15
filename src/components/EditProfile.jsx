// src/components/EditProfile.js

import React, { useState, useEffect } from 'react';
import { magic } from '../../magic';

export default function EditProfile() {
  const [profile, setProfile] = useState({
    name: '',
    parentage: '',
    address: '',
    semester: '',
    batch: '',
    rollNo: '',
    dob: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError('');
        setSuccess('');
        const didToken = await magic.user.getIdToken();
        const res = await fetch(
          'https://us-central1-owais-43.cloudfunctions.net/api/getStudentProfile',
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${didToken}` },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch.');
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('Could not load profile.');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      const didToken = await magic.user.getIdToken();
      const res = await fetch(
        'https://us-central1-owais-43.cloudfunctions.net/api/updateStudentProfile',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${didToken}`,
          },
          body: JSON.stringify(profile),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed.');
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setError('Could not update profile.');
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="edit-form">
        <input name="name" placeholder="Name" value={profile.name} onChange={handleChange} />
        <input name="parentage" placeholder="Parentage" value={profile.parentage} onChange={handleChange} />
        <input name="address" placeholder="Address" value={profile.address} onChange={handleChange} />
        <input name="semester" placeholder="Semester" value={profile.semester} onChange={handleChange} />
        <input name="batch" placeholder="Batch" value={profile.batch} onChange={handleChange} />
        <input name="rollNo" placeholder="Roll No" value={profile.rollNo} onChange={handleChange} readOnly /> 
        <input name="dob" placeholder="Date of Birth" value={profile.dob} onChange={handleChange} />
        <input name="department" placeholder="Department" value={profile.department} onChange={handleChange} />

        <button onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
}
