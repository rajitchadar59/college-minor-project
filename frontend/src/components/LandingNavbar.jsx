import { SignInButton } from "@clerk/clerk-react";
import './LandingNavbar.css';

export default function LandingNavbar() {
  return (
    <nav className="landing-nav">
      <h2 className="logo">ResumeRadar</h2>
      
      <div className="nav-links">
        <SignInButton mode="modal">
          <button className="login-btn">Login</button>
        </SignInButton>
      </div>
    </nav>
  );
}