// src/components/LandingCombined.jsx
import React from 'react';
import Landing from './Landing';
import Landing2 from './Landing2';
import Landing3 from './Landing3';

export default function LandingCombined() {
  return (
    <div className="App">
      <Landing />
      <Landing2 />
      <Landing3 />
    </div>
  );
}
