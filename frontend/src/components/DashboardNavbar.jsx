import React from 'react';
import { UserButton } from "@clerk/clerk-react";
import './DashboardNavbar.css';

export default function DashboardNavbar() {
  return (
    <nav className="dash-nav-fixed">
      <div className="dash-nav-container">
        
        {/* LOGO (Left) */}
        <div className="nav-left">
          <h2 className="logo">
            Hire<span className="text-gradient">Matrix</span>
          </h2>
        </div>
        
        {/* USER PROFILE & STATUS (Right) */}
        <div className="nav-right">
          <div className="status-indicator">
            <div className="pulse-dot"></div>
            <span className="status-text">Online</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>

      </div>
    </nav>
  );
}